import { useEffect, useState } from 'react';

import { VIBE_AFTERMOVIE_MP4_SRC } from '@/src/constants/media';
import { getCachedVideoUri, resolveCachedVideoUri } from '@/src/lib/videoCache';

const AFTERMOVIE_CACHE_KEY = 'aftermovie-vibe-2025-fallback';

/**
 * URI aftermovie : cache local 7 j si dispo ; sinon stream + téléchargement en fond.
 */
export function useCachedAftermovieUri(): string | null {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      const local = await getCachedVideoUri(AFTERMOVIE_CACHE_KEY, VIBE_AFTERMOVIE_MP4_SRC);
      if (!active) return;

      if (local) {
        setUri(local);
        return;
      }

      setUri(VIBE_AFTERMOVIE_MP4_SRC);

      const resolved = await resolveCachedVideoUri(AFTERMOVIE_CACHE_KEY, VIBE_AFTERMOVIE_MP4_SRC);
      if (!active) return;

      if (resolved !== VIBE_AFTERMOVIE_MP4_SRC) {
        setUri(resolved);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return uri;
}
