/** Web / PWA : stream HTTP uniquement (pas de FileSystem). */

export async function getCachedVideoUri(_cacheKey: string, _remoteUrl: string): Promise<string | null> {
  return null;
}

export async function resolveCachedVideoUri(_cacheKey: string, remoteUrl: string): Promise<string> {
  return remoteUrl;
}
