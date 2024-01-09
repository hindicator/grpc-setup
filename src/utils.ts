import * as cache from '@actions/cache';
import { info, getInput, addPath, exportVariable } from '@actions/core';
import isNil from 'lodash/isNil';
import { exec } from '@actions/exec';
import { mkdirP } from '@actions/io';
import {
  downloadTool,
  extractTar,
  find,
  IToolRelease,
  getManifestFromRepo,
  findFromManifest,
  cacheDir,
} from '@actions/tool-cache';
import { cpus, arch } from 'os';
import path from 'path';

const INSTALLATION_CACHE_KEY = 'grpc-setup';
const TOKEN = getInput('token');
const AUTH = `token ${TOKEN}`;
const MANIFEST_REPO_OWNER = 'eWaterCycle';
const MANIFEST_REPO_NAME = 'grpc-versions';
const MANIFEST_REPO_BRANCH = 'main';

function addEnvPath(name: string, value: string) {
  if (name in process.env) {
    exportVariable(name, `${process.env[name]}${path.delimiter}${value}`);
  } else {
    exportVariable(name, value);
  }
}

export async function restoreGrpcInstallation(
  versionSpec: string,
): Promise<boolean> {
  const installationPath = process.env.CMAKE_PREFIX_PATH;
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
): Promise<void> {
  const installationPath = process.env.CMAKE_PREFIX_PATH;
  if (!isNil(installationPath)) {
    const versionCacheKey = `${INSTALLATION_CACHE_KEY}-${versionSpec}`;

    const cacheId = await cache.saveCache([installationPath], versionCacheKey);

    info(`Cached grpc installation @ ${installationPath}`);
    info(`Cache ID: ${cacheId}`);
  }
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

  const extPath = 'grpc';
  info(`Configuring in ${extPath}`);
  const buildDir = path.join(extPath, 'build');
  await mkdirP(buildDir);
  const hostedtoolcache = process.env.AGENT_TOOLSDIRECTORY!;
  const prefixDir = path.join(hostedtoolcache, 'grpc', versionSpec);
  await exec(
    'cmake',
    [
      '-DgRPC_INSTALL=ON',
      '-DgRPC_SSL_PROVIDER=package',
      '-DgRPC_BUILD_TESTS=OFF',
      '-DBUILD_SHARED_LIBS=ON',
      `-DCMAKE_INSTALL_PREFIX=${prefixDir}`,
      '..',
    ],
    { cwd: buildDir },
  );

  info(`Compiling in ${buildDir}`);
  const jn = cpus().length.toString();
  await exec('make', ['-j', jn], { cwd: buildDir });

  info(`Installing to ${prefixDir}`);
  await exec('make install', [], { cwd: buildDir });

  return prefixDir;
}

export async function findReleaseFromManifest(
  semanticVersionSpec: string,
  architecture: string,
): Promise<IToolRelease | undefined> {
  const manifest: IToolRelease[] = await getManifestFromRepo(
    MANIFEST_REPO_OWNER,
    MANIFEST_REPO_NAME,
    AUTH,
    MANIFEST_REPO_BRANCH,
  );
  return findFromManifest(semanticVersionSpec, true, manifest, architecture);
}

export async function makeGrpc(versionSpec: string) {
  let installDir = find('grpc', versionSpec);
  if (installDir) {
    info(`Found in cache @ ${installDir}`);
  } else {
    info(`Version ${versionSpec} was not found in the local cache`);
    const foundRelease = await findReleaseFromManifest(versionSpec, arch());
    if (foundRelease && foundRelease.files.length > 0) {
      info(`Version ${versionSpec} is available for downloading`);
      const downloadUrl = foundRelease.files[0].download_url;
      info(`Download from "${downloadUrl}"`);
      const archive = await downloadTool(downloadUrl, undefined, AUTH);
      info('Extract downloaded archive');
      const extPath = await extractTar(archive);
      info('Adding to the cache ...');
      installDir = await cacheDir(extPath, 'grpc', versionSpec);
      info(`Successfully cached grpc to ${installDir}`);
    } else {
      info('Unable to download binary, falling back to compiling grpc');
      installDir = await installGrpcVersion(versionSpec);
    }
  }

  addPath(path.join(installDir, 'bin'));

  exportVariable('GRPC_ROOT', installDir);
  addEnvPath('CMAKE_PREFIX_PATH', installDir);
  addEnvPath('LD_LIBRARY_PATH', path.join(installDir, 'lib'));
}
