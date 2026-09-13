import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

import { isTtlExpired } from '@/src/lib/offlineCache';

const META_PREFIX = 'pbvf-cache:video:';

type VideoCacheMeta = {
  cachedAt: number;
  remoteUrl: string;
  localUri: string;
};

function metaKey(cacheKey: string): string {
  return `${META_PREFIX}${cacheKey}`;
}

function localPath(cacheKey: string): string {
  return `${FileSystem.cacheDirectory ?? ''}pbvf-${cacheKey}.mp4`;
}

async function readMeta(cacheKey: string): Promise<VideoCacheMeta | null> {
  try {
    const raw = await AsyncStorage.getItem(metaKey(cacheKey));
    if (!raw) return null;
    return JSON.parse(raw) as VideoCacheMeta;
  } catch {
    return null;
  }
}

async function writeMeta(cacheKey: string, meta: VideoCacheMeta): Promise<void> {
  try {
    await AsyncStorage.setItem(metaKey(cacheKey), JSON.stringify(meta));
  } catch {
    // ignore
  }
}

/** URI locale si cache valide (< 7 j), sinon null. */
export async function getCachedVideoUri(cacheKey: string, remoteUrl: string): Promise<string | null> {
  const meta = await readMeta(cacheKey);
  const path = localPath(cacheKey);

  if (!meta || meta.remoteUrl !== remoteUrl || isTtlExpired(meta.cachedAt)) {
    return null;
  }

  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) return null;
  return path;
}

/** Télécharge la vidéo en cache (7 j) et retourne l'URI locale. */
export async function resolveCachedVideoUri(cacheKey: string, remoteUrl: string): Promise<string> {
  const cached = await getCachedVideoUri(cacheKey, remoteUrl);
  if (cached) return cached;

  const path = localPath(cacheKey);

  try {
    const result = await FileSystem.downloadAsync(remoteUrl, path);
    await writeMeta(cacheKey, {
      cachedAt: Date.now(),
      remoteUrl,
      localUri: result.uri,
    });
    return result.uri;
  } catch {
    return remoteUrl;
  }
}
