import * as cache from '@actions/cache';
import { info, exportVariable } from '@actions/core';
import isNil from 'lodash/isNil';
import { exec } from '@actions/exec';
import { mkdirP } from '@actions/io';
import { cpus } from 'os';
import path from 'path';

export const INSTALLATION_CACHE_KEY = 'grpc-setup';
export const INPUT_GRPC_VERSION = 'grpc-version';
export const INPUT_INSTALLATION_PATH = 'grpc-installation-path';

export function addEnvPath(name: string, value: string) {
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

export async function makeGrpc(grpcInstallationPath: string) {
  const extPath = 'grpc';
  info(`Configuring in ${extPath}`);
  const buildDir = path.join(extPath, 'build');
  const grpcLocalPath = path.join(grpcInstallationPath, '.local');
  await mkdirP(buildDir);
  await exec('pwd');
  try {
    await mkdirP(grpcInstallationPath);
    await mkdirP(grpcLocalPath);
  } catch (e) {
    console.log('Folder alreay exist');
    console.log(e);
  }
  await exec(
    'cmake',
    [
      '-DgRPC_INSTALL=ON',
      '-DgRPC_BUILD_TESTS=OFF',
      `-DCMAKE_INSTALL_PREFIX="${grpcLocalPath}"`,
      '-DBUILD_SHARED_LIBS=ON',
      '..',
    ],
    { cwd: buildDir },
  );

  info(`Compiling in ${buildDir}`);
  const jn = cpus().length.toString();
  await exec('make', ['-j', jn], { cwd: buildDir });

  info(`Installing to ${grpcInstallationPath}`);
  await exec(`cmake`, ['--install', '.', '--prefix', grpcInstallationPath], {
    cwd: buildDir,
  });
  await exec(`make`, [], {
    cwd: buildDir,
  });
}
