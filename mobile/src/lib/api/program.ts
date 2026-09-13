import { apiGet } from '@/src/lib/api';
import { fetchCacheManifest, manifestVersion } from '@/src/lib/api/cacheManifest';
import { fetchWithWeekCache } from '@/src/lib/offlineCache';
import type { FestivalProgramApi } from '@/src/types/api';
import programSeed from '@/src/data/program.seed.json';
import { FESTIVAL } from '@/src/lib/festival-data';

function localProgramFallback(): FestivalProgramApi {
  return programSeed as FestivalProgramApi;
}

/** Planning workshops / soirées — cache 7 j + refresh partiel via manifeste. */
export async function fetchFestivalProgram(edition = FESTIVAL.edition): Promise<FestivalProgramApi> {
  const manifest = await fetchCacheManifest(edition);

  return fetchWithWeekCache({
    cacheKey: `program:${edition}`,
    serverVersion: manifestVersion(manifest, 'program'),
    fetchFresh: () =>
      apiGet<FestivalProgramApi>('/api/festival/program/', { params: { edition } }),
    fallback: localProgramFallback,
  });
}
