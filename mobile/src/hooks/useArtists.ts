import { useEffect, useState } from 'react';

import artistsSeed from '@/src/data/artists.seed.json';
import { fetchFestivalArtists, sortArtistsLikeWeb } from '@/src/lib/api/artists';
import type { ArtistApi } from '@/src/types/api';

const SEED = sortArtistsLikeWeb(artistsSeed as ArtistApi[]);

/**
 * Artistes — seed immédiat (pas de spinner bloquant), refresh API en arrière-plan.
 * Évite l’attente CORS / cold start Railway sur PWA locale.
 */
export function useArtists() {
  const [artists, setArtists] = useState<ArtistApi[]>(SEED);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchFestivalArtists()
      .then((data) => {
        if (cancelled) return;
        const next = sortArtistsLikeWeb(Array.isArray(data) ? data : []);
        if (next.length > 0) setArtists(next);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Impossible de charger les artistes');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { artists, loading, error };
}
