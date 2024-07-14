import { info } from '@actions/core';
import { exec } from '@actions/exec';
import { mkdirP } from '@actions/io';
import { cpus } from 'os';
import path from 'path';

export async function cloneGrpcRepo(versionSpec: string) {
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

export async function makeBuildGrpc(grpcInstallationPath: string) {
  const extPath = 'grpc';
  info(`Configuring in ${extPath}`);
  const buildDir = path.join(extPath, 'build');
  await mkdirP(buildDir);

  await exec(
    'cmake',
    [
      '-DgRPC_INSTALL=ON',
      '-DgRPC_BUILD_TESTS=OFF',
      `-DCMAKE_INSTALL_PREFIX=${grpcInstallationPath}`,
      '-DBUILD_SHARED_LIBS=ON',
      '..',
    ],
    { cwd: buildDir },
  );

  info(`Compiling in ${buildDir}`);
  const jn = cpus().length.toString();
  await exec('make', ['-j', jn], { cwd: buildDir });
  await exec(`make install`, [], {
    cwd: buildDir,
  });
}

export async function buildGrpc(binPath: string, grpcVersion: string) {
  info(`Setup grpc version spec ${grpcVersion}`);

  info(`Cloning gRPC repo with tag ${grpcVersion}`);
  await cloneGrpcRepo(grpcVersion);

  info(`Make gRPC binaries ${grpcVersion}`);
  await makeBuildGrpc(binPath);
}
