import { useEffect, useState } from 'react';

import { fetchFestivalArtist } from '@/src/lib/api/artists';
import type { ArtistApi } from '@/src/types/api';

/** Détail artiste par username (API Django). */
export function useArtist(username: string | undefined) {
  const [artist, setArtist] = useState<ArtistApi | null>(null);
  const [loading, setLoading] = useState(Boolean(username));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setArtist(null);
      setLoading(false);
      setError('Artiste introuvable');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchFestivalArtist(username)
      .then((data) => {
        if (!cancelled) setArtist(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Impossible de charger cet artiste');
          setArtist(null);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  return { artist, loading, error };
}
