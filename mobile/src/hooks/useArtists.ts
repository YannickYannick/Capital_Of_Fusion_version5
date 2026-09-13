import { useEffect, useState } from 'react';

import { fetchFestivalArtists } from '@/src/lib/api/artists';
import type { ArtistApi } from '@/src/types/api';

/** Artistes festival depuis l'API Django (Railway → Supabase). */
export function useArtists() {
  const [artists, setArtists] = useState<ArtistApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchFestivalArtists()
      .then((data) => {
        if (!cancelled) setArtists(Array.isArray(data) ? data : []);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Impossible de charger les artistes');
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { artists, loading, error };
}
