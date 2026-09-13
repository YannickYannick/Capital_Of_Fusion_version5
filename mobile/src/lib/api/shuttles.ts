import { apiGet } from '@/src/lib/api';
import { fetchCacheManifest, manifestVersion } from '@/src/lib/api/cacheManifest';
import { fetchWithWeekCache } from '@/src/lib/offlineCache';
import type { ShuttleDayScheduleApi } from '@/src/types/api';
import shuttleSeed from '@/src/data/shuttles.seed.json';
import { FESTIVAL } from '@/src/lib/festival-data';

function localShuttleFallback(): ShuttleDayScheduleApi[] {
  return shuttleSeed.days as ShuttleDayScheduleApi[];
}

/** Horaires navettes — cache 7 j + refresh partiel via manifeste. */
export async function fetchShuttleSchedules(edition = FESTIVAL.edition): Promise<ShuttleDayScheduleApi[]> {
  const manifest = await fetchCacheManifest(edition);

  return fetchWithWeekCache({
    cacheKey: `shuttles:${edition}`,
    serverVersion: manifestVersion(manifest, 'shuttles'),
    fetchFresh: () =>
      apiGet<ShuttleDayScheduleApi[]>('/api/festival/shuttles/', { params: { edition } }),
    fallback: localShuttleFallback,
  });
}
