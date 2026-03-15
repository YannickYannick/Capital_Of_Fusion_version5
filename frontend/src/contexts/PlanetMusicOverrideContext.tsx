"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

/**
 * Override de la musique de fond quand une planète avec musique est sélectionnée sur /explore.
 * Remplace la vidéo d'accueil par la musique de la planète (YouTube ou fichier).
 */
export type PlanetMusicOverride =
  | { type: "youtube"; youtubeUrl: string }
  | { type: "file"; fileUrl: string }
  | null;

interface PlanetMusicOverrideContextValue {
  override: PlanetMusicOverride;
  setOverride: (value: PlanetMusicOverride) => void;
}

const PlanetMusicOverrideContext =
  createContext<PlanetMusicOverrideContextValue | null>(null);

export function PlanetMusicOverrideProvider({ children }: { children: ReactNode }) {
  const [override, setOverrideState] = useState<PlanetMusicOverride>(null);
  const setOverride = useCallback((value: PlanetMusicOverride) => {
    setOverrideState(value);
  }, []);

  return (
    <PlanetMusicOverrideContext.Provider value={{ override, setOverride }}>
      {children}
    </PlanetMusicOverrideContext.Provider>
  );
}

const FALLBACK_MUSIC_OVERRIDE: PlanetMusicOverrideContextValue = {
  override: null,
  setOverride: () => {},
};

export function usePlanetMusicOverride(): PlanetMusicOverrideContextValue {
  const ctx = useContext(PlanetMusicOverrideContext);
  if (ctx) return ctx;
  return FALLBACK_MUSIC_OVERRIDE;
}
