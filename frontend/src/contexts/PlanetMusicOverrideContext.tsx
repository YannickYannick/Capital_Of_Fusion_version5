"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

/**
 * Override de la musique de fond quand une planète avec musique est sélectionnée sur /explore,
 * ou une fiche structure partenaire avec musique dédiée.
 * Remplace le son des vidéos d'accueil (YouTube / MP4 du site).
 *
 * `youtubeAmbientSuspended` : lorsque pertinent, garde les vidéos d'accueil muettes ; levée sur `/`
 * et `/explore`. La musique d'une fiche structure peut persister sur d'autres routes tant que
 * le fond vidéo global est monté ; l'accueil et Explore réinitialisent l'override.
 * En mode musique **site** (`backgroundMusicMode`), voir `docs/features/musique-fond-mode-accueil.md` :
 * pas d'override effectif ; bande-son = `main_video` partout sauf comportement cycle sur `/explore`.
 */
export type PlanetMusicOverride =
  | { type: "youtube"; youtubeUrl: string }
  | { type: "file"; fileUrl: string }
  | null;

interface PlanetMusicOverrideContextValue {
  override: PlanetMusicOverride;
  setOverride: (value: PlanetMusicOverride) => void;
  youtubeAmbientSuspended: boolean;
  setYoutubeAmbientSuspended: (value: boolean) => void;
}

const PlanetMusicOverrideContext =
  createContext<PlanetMusicOverrideContextValue | null>(null);

export function PlanetMusicOverrideProvider({ children }: { children: ReactNode }) {
  const [override, setOverrideState] = useState<PlanetMusicOverride>(null);
  const [youtubeAmbientSuspended, setYoutubeAmbientSuspendedState] = useState(false);
  const setOverride = useCallback((value: PlanetMusicOverride) => {
    setOverrideState(value);
  }, []);
  const setYoutubeAmbientSuspended = useCallback((value: boolean) => {
    setYoutubeAmbientSuspendedState(value);
  }, []);

  return (
    <PlanetMusicOverrideContext.Provider
      value={{
        override,
        setOverride,
        youtubeAmbientSuspended,
        setYoutubeAmbientSuspended,
      }}
    >
      {children}
    </PlanetMusicOverrideContext.Provider>
  );
}

const FALLBACK_MUSIC_OVERRIDE: PlanetMusicOverrideContextValue = {
  override: null,
  setOverride: () => {},
  youtubeAmbientSuspended: false,
  setYoutubeAmbientSuspended: () => {},
};

export function usePlanetMusicOverride(): PlanetMusicOverrideContextValue {
  const ctx = useContext(PlanetMusicOverrideContext);
  if (ctx) return ctx;
  return FALLBACK_MUSIC_OVERRIDE;
}
