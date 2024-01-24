import { existsSync } from 'fs';
import { info, getInput } from '@actions/core';
import {
  INPUT_GRPC_VERSION,
  INPUT_INSTALLATION_PATH,
  cacheGrpcInstallation,
  installGrpcVersion,
  makeGrpc,
  restoreGrpcInstallation,
} from './utils';

export async function run(): Promise<void> {
  const versionSpec = getInput(INPUT_GRPC_VERSION);
  const installationPath = 'cache/' + getInput(INPUT_INSTALLATION_PATH);

  const isInstallationCached = await restoreGrpcInstallation(
    versionSpec,
    installationPath,
  );

  if (isInstallationCached) {
    return;
  }

  info(`Setup grpc version spec ${versionSpec}`);

  if (existsSync('grpc')) {
    info(`Found cloned grpc repo`);
  } else {
    await installGrpcVersion(versionSpec);
  }
  await makeGrpc(installationPath);

  await cacheGrpcInstallation(versionSpec, installationPath);
}

// main()
//   .then((msg) => {
//     console.log(msg);
//   })
//   .catch((err) => {
//     setFailed(err.message);
//   });
