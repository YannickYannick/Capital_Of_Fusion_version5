import { apiGet } from '@/src/lib/api';
import { fetchCacheManifest, manifestVersion } from '@/src/lib/api/cacheManifest';
import { fetchWithWeekCache } from '@/src/lib/offlineCache';
import type { ArtistApi } from '@/src/types/api';
import artistsSeed from '@/src/data/artists.seed.json';
import { FESTIVAL } from '@/src/lib/festival-data';

function localArtistsFallback(): ArtistApi[] {
  return artistsSeed as ArtistApi[];
}

/**
 * Liste publique des artistes (cache 7 j — refresh si manifeste artists change).
 * Repli seed si CORS / réseau KO (PWA locale).
 */
export function fetchFestivalArtists(signal?: AbortSignal): Promise<ArtistApi[]> {
  return fetchCacheManifest()
    .then((manifest) =>
      fetchWithWeekCache({
        cacheKey: `artists:${FESTIVAL.edition}:v2`,
        serverVersion: manifestVersion(manifest, 'artists'),
        fetchFresh: () => apiGet<ArtistApi[]>('/api/users/artists/', { signal }),
        fallback: localArtistsFallback,
      }),
    )
    .catch(() => localArtistsFallback());
}

/** Détail artiste — cache 7 j (refresh si un artiste est modifié côté admin). */
export function fetchFestivalArtist(username: string, signal?: AbortSignal): Promise<ArtistApi> {
  return fetchCacheManifest()
    .then((manifest) =>
      fetchWithWeekCache({
        cacheKey: `artist:${username}:v2`,
        serverVersion: manifestVersion(manifest, 'artists'),
        fetchFresh: () =>
          apiGet<ArtistApi>(`/api/users/artists/${encodeURIComponent(username)}/`, { signal }),
        fallback: () => {
          const found = localArtistsFallback().find((a) => a.username === username);
          if (!found) throw new Error('Artiste introuvable');
          return found;
        },
      }),
    )
    .catch(() => {
      const found = localArtistsFallback().find((a) => a.username === username);
      if (!found) return Promise.reject(new Error('Artiste introuvable'));
      return found;
    });
}

export function artistDisplayName(artist: ArtistApi): string {
  const full = `${artist.first_name ?? ''} ${artist.last_name ?? ''}`.trim();
  return full || artist.username;
}

export function artistSubtitle(artist: ArtistApi): string {
  return artist.professions.map((p) => p.name).join(' · ') || 'Artiste';
}

/**
 * Ordre page web / API : artist_display_order → prénom → nom → username.
 */
export function sortArtistsLikeWeb(artists: ArtistApi[]): ArtistApi[] {
  return [...artists].sort((a, b) => {
    const orderA = a.artist_display_order ?? 0;
    const orderB = b.artist_display_order ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    const nameA = `${a.first_name ?? ''} ${a.last_name ?? ''}`.trim().toLowerCase() || a.username;
    const nameB = `${b.first_name ?? ''} ${b.last_name ?? ''}`.trim().toLowerCase() || b.username;
    const byName = nameA.localeCompare(nameB, 'fr');
    if (byName !== 0) return byName;
    return a.username.localeCompare(b.username, 'fr');
  });
}
