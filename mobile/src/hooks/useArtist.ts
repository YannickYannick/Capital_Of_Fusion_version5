import { useEffect, useState } from 'react';

import artistsSeed from '@/src/data/artists.seed.json';
import { fetchFestivalArtist } from '@/src/lib/api/artists';
import type { ArtistApi } from '@/src/types/api';

/**
 * Détail artiste — seed immédiat si dispo, puis refresh API.
 */
export function useArtist(username: string | undefined) {
  const seedHit =
    username != null
      ? (artistsSeed as ArtistApi[]).find((a) => a.username === username) ?? null
      : null;

  const [artist, setArtist] = useState<ArtistApi | null>(seedHit);
  const [loading, setLoading] = useState(Boolean(username) && !seedHit);
  const [error, setError] = useState<string | null>(username ? null : 'Artiste introuvable');

  useEffect(() => {
    if (!username) {
      setArtist(null);
      setLoading(false);
      setError('Artiste introuvable');
      return;
    }

    let cancelled = false;
    const local = (artistsSeed as ArtistApi[]).find((a) => a.username === username) ?? null;
    if (local) {
      setArtist(local);
      setLoading(false);
      setError(null);
    } else {
      setLoading(true);
      setError(null);
    }

    fetchFestivalArtist(username)
      .then((data) => {
        if (!cancelled) {
          setArtist(data);
          setError(null);
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        if (!local) {
          setError(e instanceof Error ? e.message : 'Impossible de charger cet artiste');
          setArtist(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  return { artist, loading, error };
}
