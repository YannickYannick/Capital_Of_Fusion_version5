import { apiGet } from '@/src/lib/api';
import { fetchCacheManifest, manifestVersion } from '@/src/lib/api/cacheManifest';
import { fetchWithWeekCache } from '@/src/lib/offlineCache';
import type { ArtistApi } from '@/src/types/api';
import { FESTIVAL } from '@/src/lib/festival-data';

/**
 * Liste publique des artistes (cache 7 j — refresh si manifeste artists change).
 */
export function fetchFestivalArtists(signal?: AbortSignal): Promise<ArtistApi[]> {
  return fetchCacheManifest().then((manifest) =>
    fetchWithWeekCache({
      cacheKey: `artists:${FESTIVAL.edition}`,
      serverVersion: manifestVersion(manifest, 'artists'),
      fetchFresh: () => apiGet<ArtistApi[]>('/api/users/artists/', { signal }),
    }),
  );
}

/** Détail artiste — cache 7 j (refresh si un artiste est modifié côté admin). */
export function fetchFestivalArtist(username: string, signal?: AbortSignal): Promise<ArtistApi> {
  return fetchCacheManifest().then((manifest) =>
    fetchWithWeekCache({
      cacheKey: `artist:${username}`,
      serverVersion: manifestVersion(manifest, 'artists'),
      fetchFresh: () =>
        apiGet<ArtistApi>(`/api/users/artists/${encodeURIComponent(username)}/`, { signal }),
    }),
  );
}

export function artistDisplayName(artist: ArtistApi): string {
  const full = `${artist.first_name ?? ''} ${artist.last_name ?? ''}`.trim();
  return full || artist.username;
}

export function artistSubtitle(artist: ArtistApi): string {
  return artist.professions.map((p) => p.name).join(' · ') || 'Artiste';
}
