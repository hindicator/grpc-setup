import { info, getInput, setFailed } from '@actions/core';
import {
  cacheGrpcInstallation,
  makeGrpc,
  restoreGrpcInstallation,
} from './utils';

async function main() {
  const versionSpec = getInput('grpc-version');

  const isInstallationCached = await restoreGrpcInstallation(versionSpec);

  if (isInstallationCached) {
    return;
  }

  info(`Setup grpc version spec ${versionSpec}`);

  await makeGrpc(versionSpec);

  await cacheGrpcInstallation(versionSpec);
}

main()
  .then((msg) => {
    console.log(msg);
  })
  .catch((err) => {
    setFailed(err.message);
  });
