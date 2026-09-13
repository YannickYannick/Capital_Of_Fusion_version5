import AsyncStorage from '@react-native-async-storage/async-storage';

/** Durée de validité du cache local (7 jours). */
export const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const PREFIX = 'pbvf-cache:';

export type CacheEntry<T> = {
  data: T;
  cachedAt: number;
  serverVersion: string | null;
};

export function isTtlExpired(cachedAt: number): boolean {
  return Date.now() - cachedAt > CACHE_TTL_MS;
}

/** Cache périmé si TTL expiré ou version serveur plus récente. */
export function isCacheStale(entry: CacheEntry<unknown>, serverVersion: string | null): boolean {
  if (isTtlExpired(entry.cachedAt)) return true;
  if (!serverVersion) return false;
  if (!entry.serverVersion) return true;
  return serverVersion > entry.serverVersion;
}

export async function readCacheEntry<T>(key: string): Promise<CacheEntry<T> | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry<T>;
  } catch {
    return null;
  }
}

export async function writeCacheEntry<T>(
  key: string,
  data: T,
  serverVersion: string | null,
): Promise<void> {
  const entry: CacheEntry<T> = {
    data,
    cachedAt: Date.now(),
    serverVersion,
  };
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // quota / stockage — ignorer
  }
}

type FetchWithWeekCacheOptions<T> = {
  cacheKey: string;
  serverVersion: string | null;
  fetchFresh: () => Promise<T>;
  fallback?: () => T;
  /** Version à stocker après fetch (ex. updated_at d'un enregistrement). */
  versionFromData?: (data: T) => string | null;
};

/**
 * Cache 7 jours + rechargement si le manifeste serveur a changé.
 * Affiche le cache immédiatement et met à jour en arrière-plan si besoin.
 */
export async function fetchWithWeekCache<T>(options: FetchWithWeekCacheOptions<T>): Promise<T> {
  const { cacheKey, serverVersion, fetchFresh, fallback, versionFromData } = options;
  const cached = await readCacheEntry<T>(cacheKey);

  const refreshInBackground = () => {
    fetchFresh()
      .then((data) => writeCacheEntry(cacheKey, data, serverVersion))
      .catch(() => undefined);
  };

  if (cached && !isCacheStale(cached, serverVersion)) {
    if (serverVersion && cached.serverVersion && serverVersion > cached.serverVersion) {
      refreshInBackground();
    }
    return cached.data;
  }

  try {
    const data = await fetchFresh();
    const version = versionFromData?.(data) ?? serverVersion;
    await writeCacheEntry(cacheKey, data, version);
    return data;
  } catch (error) {
    if (cached && !isTtlExpired(cached.cachedAt)) {
      return cached.data;
    }
    if (fallback) return fallback();
    throw error;
  }
}
