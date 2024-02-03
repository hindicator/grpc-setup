import { existsSync } from 'fs';
import { info, getInput, addPath, exportVariable } from '@actions/core';
import {
  INPUT_GRPC_VERSION,
  INPUT_INSTALLATION_PATH,
  addEnvPath,
  cacheGrpcInstallation,
  installGrpcVersion,
  makeGrpc,
  restoreGrpcInstallation,
} from './utils';
import path from 'path';
import { mkdirP } from '@actions/io';

export async function run(): Promise<void> {
  const versionSpec = getInput(INPUT_GRPC_VERSION);
  const installationPath = getInput(INPUT_INSTALLATION_PATH);
  const grpcInstallationPath = `${process.env.GITHUB_WORKSPACE}/cache/${installationPath}`;

  const isInstallationCached = await restoreGrpcInstallation(
    versionSpec,
    grpcInstallationPath,
  );

  if (!isInstallationCached) {
    info(`Setup grpc version spec ${versionSpec}`);
    await mkdirP(grpcInstallationPath);

    if (existsSync('grpc')) {
      info(`Found cloned grpc repo`);
    } else {
      await installGrpcVersion(versionSpec);
    }

    await makeGrpc(grpcInstallationPath);

    await cacheGrpcInstallation(versionSpec, grpcInstallationPath);
  }

  info(`Setting env variables`);
  addPath(path.join(grpcInstallationPath, 'bin'));

  exportVariable('GRPC_ROOT', grpcInstallationPath);
  addEnvPath('CMAKE_PREFIX_PATH', grpcInstallationPath);
  addEnvPath('LD_LIBRARY_PATH', path.join(grpcInstallationPath, 'lib'));

  info(`Successfully setup grpc version ${versionSpec}`);
}
