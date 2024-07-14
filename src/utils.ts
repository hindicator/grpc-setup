import * as cache from '@actions/cache';
import { info, exportVariable } from '@actions/core';
import isNil from 'lodash/isNil';
import path from 'path';
import { INSTALLATION_CACHE_KEY } from './consts';

export function addEnvPath(name: string, value: string) {
  if (name in process.env) {
    exportVariable(name, `${process.env[name]}${path.delimiter}${value}`);
  } else {
    exportVariable(name, value);
  }
}

export function parseBooleanInput(input: string): boolean {
  if (input === 'true') {
    return true;
  }
  return false;
}

export async function restoreDepCache(
  versionSpec: string,
  installationPath: string,
  shouldIncludeGoogleTest: boolean,
): Promise<boolean> {
  if (!isNil(installationPath)) {
    const versionCacheKey = `${INSTALLATION_CACHE_KEY}-${shouldIncludeGoogleTest}-${versionSpec}`;

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

export async function createDepCache(
  versionSpec: string,
  installationPath: string,
  shouldIncludeGoogleTest: boolean,
): Promise<void> {
  const versionCacheKey = `${INSTALLATION_CACHE_KEY}-${shouldIncludeGoogleTest}-${versionSpec}`;

  const cacheId = await cache.saveCache([installationPath], versionCacheKey);

  info(`Cached grpc installation @ ${installationPath}`);
  info(`Cache ID: ${cacheId}`);
}
