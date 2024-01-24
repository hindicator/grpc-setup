import * as cache from '@actions/cache';
import { info, addPath, exportVariable } from '@actions/core';
import isNil from 'lodash/isNil';
import { exec } from '@actions/exec';
import { mkdirP } from '@actions/io';
import { cpus } from 'os';
import path from 'path';

export const INSTALLATION_CACHE_KEY = 'grpc-setup';
export const INPUT_GRPC_VERSION = 'grpc-version';
export const INPUT_INSTALLATION_PATH = 'grpc-installation-path';

function addEnvPath(name: string, value: string) {
  if (name in process.env) {
    exportVariable(name, `${process.env[name]}${path.delimiter}${value}`);
  } else {
    exportVariable(name, value);
  }
}

export async function restoreGrpcInstallation(
  versionSpec: string,
  installationPath: string,
): Promise<boolean> {
  if (!isNil(installationPath)) {
    const versionCacheKey = `${INSTALLATION_CACHE_KEY}-${versionSpec}`;

    const cacheKey = await cache.restoreCache(
      [installationPath],
      versionCacheKey,
    );
    console.log(cacheKey);

    if (!isNil(cacheKey)) {
      info(`Found grpc installation in cache @ ${installationPath}`);
      return true;
    }
  }
  return false;
}

export async function cacheGrpcInstallation(
  versionSpec: string,
  installationPath: string,
): Promise<void> {
  const versionCacheKey = `${INSTALLATION_CACHE_KEY}-${versionSpec}`;

  const cacheId = await cache.saveCache([installationPath], versionCacheKey);

  info(`Cached grpc installation @ ${installationPath}`);
  info(`Cache ID: ${cacheId}`);
}

export async function installGrpcVersion(versionSpec: string) {
  info('Cloning grpc repo...');
  await exec('git', [
    'clone',
    '--depth',
    '1',
    '--recurse-submodules',
    '--shallow-submodules',
    '-b',
    'v' + versionSpec,
    'https://github.com/grpc/grpc',
  ]);
}

export async function makeGrpc(installationPath: string) {
  const extPath = 'grpc';
  info(`Configuring in ${extPath}`);
  const buildDir = path.join(extPath, 'build');
  await mkdirP(buildDir);
  await exec('pwd');
  try {
    await mkdirP(installationPath);
  } catch (e) {
    console.log('Folder alreay exist');
    console.log(e);
  }
  await exec(
    'cmake',
    [
      '-DgRPC_INSTALL=ON',
      '-DgRPC_SSL_PROVIDER=package',
      '-DgRPC_BUILD_TESTS=OFF',
      '-DBUILD_SHARED_LIBS=ON',
      `-DCMAKE_INSTALL_PREFIX=${installationPath}`,
      '..',
    ],
    { cwd: buildDir },
  );

  info(`Compiling in ${buildDir}`);
  const jn = cpus().length.toString();
  await exec('make', ['-j', jn], { cwd: buildDir });

  info(`Installing to ${installationPath}`);
  await exec(
    `cmake`,
    ['--install', '.', '--prefix', '../../' + installationPath],
    {
      cwd: buildDir,
    },
  );

  addPath(path.join(installationPath, 'bin'));

  exportVariable('GRPC_ROOT', installationPath);
  addEnvPath('CMAKE_PREFIX_PATH', installationPath);
  addEnvPath('LD_LIBRARY_PATH', path.join(installationPath, 'lib'));
}
