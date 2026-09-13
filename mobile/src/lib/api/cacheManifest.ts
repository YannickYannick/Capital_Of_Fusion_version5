import { apiGet } from '@/src/lib/api';
import { FESTIVAL } from '@/src/lib/festival-data';

export type FestivalCacheManifest = {
  edition: string;
  artists: string | null;
  program: string | null;
  shuttles: string | null;
};

let manifestMemo: { at: number; edition: string; data: FestivalCacheManifest } | null = null;
const MANIFEST_MEMO_MS = 30_000;

/** Horodatages serveur pour détecter les mises à jour partielles. */
export async function fetchCacheManifest(edition = FESTIVAL.edition): Promise<FestivalCacheManifest | null> {
  const now = Date.now();
  if (manifestMemo && manifestMemo.edition === edition && now - manifestMemo.at < MANIFEST_MEMO_MS) {
    return manifestMemo.data;
  }

  try {
    const data = await apiGet<FestivalCacheManifest>('/api/festival/cache-manifest/', {
      params: { edition },
    });
    manifestMemo = { at: now, edition, data };
    return data;
  } catch {
    return null;
  }
}

export function manifestVersion(
  manifest: FestivalCacheManifest | null,
  key: 'artists' | 'program' | 'shuttles',
): string | null {
  if (!manifest) return null;
  return manifest[key];
}
