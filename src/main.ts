import { info, getInput, addPath, exportVariable } from '@actions/core';
import {
  addEnvPath,
  createDepCache,
  parseBooleanInput,
  restoreDepCache,
} from './utils';
import path from 'path';
import { mkdirP } from '@actions/io';
import {
  INPUT_GOOGLE_TEST_VERSION,
  INPUT_GRPC_VERSION,
  INPUT_INCLUDE_GOOGLE_TEST,
  INPUT_INSTALLATION_PATH,
} from './consts';
import { buildGrpc } from './grpcUtils';
import { buildGoogleTest } from './googleTestUtils';

export async function run(): Promise<void> {
  const grpcVersionSpec = getInput(INPUT_GRPC_VERSION);
  const installationPath = getInput(INPUT_INSTALLATION_PATH);
  const googleTestVersion = getInput(INPUT_GOOGLE_TEST_VERSION);
  const shouldIncludeGoogleTest = parseBooleanInput(
    getInput(INPUT_INCLUDE_GOOGLE_TEST),
  );

  const binPath = `${process.env.GITHUB_WORKSPACE}/cache/${installationPath}`;

  info(`Setting dependencies in ${binPath}`);

  const isInstallationCached = await restoreDepCache(
    binPath,
    grpcVersionSpec,
    shouldIncludeGoogleTest,
    googleTestVersion,
  );

  if (!isInstallationCached) {
    info(`Setup dependencies to cache`);
    await mkdirP(binPath);

    await buildGrpc(binPath, grpcVersionSpec);
    if (shouldIncludeGoogleTest) {
      await buildGoogleTest(binPath, googleTestVersion);
    }

    await createDepCache(
      binPath,
      grpcVersionSpec,
      shouldIncludeGoogleTest,
      googleTestVersion,
    );
  }

  // Setting env variables
  addPath(path.join(binPath, 'bin'));
  exportVariable('GRPC_ROOT', binPath);
  addEnvPath('CMAKE_PREFIX_PATH', binPath);
  addEnvPath('LD_LIBRARY_PATH', path.join(binPath, 'lib'));

  info(`Successfully setup grpc version ${grpcVersionSpec}`);
}
