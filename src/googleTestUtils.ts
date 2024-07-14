import { info } from '@actions/core';
import { exec } from '@actions/exec';
import { mkdirP } from '@actions/io';
import path from 'path';

export async function cloneGoogleTest(versionSpec: string) {
  info('Cloning grpc repo...');
  await exec('git', [
    'clone',
    'https://github.com/google/googletest.git',
    '-b',
    'v' + versionSpec,
  ]);
}

export async function makeBuildGoogleTest(binPath: string) {
  info(`Setup googletest binaries`);
  const extPath = 'googletest';
  const buildDir = path.join(extPath, 'build');
  await mkdirP(buildDir);

  await exec('cmake', [`-DCMAKE_INSTALL_PREFIX=${binPath}`, '..'], {
    cwd: buildDir,
  });
  await exec('make', [], { cwd: buildDir });
  await exec(`make install`, [], {
    cwd: buildDir,
  });
}

export async function buildGoogleTest(
  binPath: string,
  googleTestVersion: string,
) {
  info(`Cloning googleTest repo with tag ${googleTestVersion}`);
  await cloneGoogleTest(googleTestVersion);

  info(`Make GoogleTest binaries ${googleTestVersion}`);
  await makeBuildGoogleTest(binPath);
}
