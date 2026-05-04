"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AmbientVideoSoundApi = {
  muted: boolean;
  /** Pas de contrôle (route sans vidéo, fond noir, suspension explore sans override, etc.) */
  disabled: boolean;
  toggle: () => void;
};

const DEFAULT_API: AmbientVideoSoundApi = {
  muted: true,
  disabled: true,
  toggle: () => {},
};

type Ctx = {
  api: AmbientVideoSoundApi;
  setApi: (next: AmbientVideoSoundApi) => void;
};

const AmbientVideoSoundContext = createContext<Ctx | null>(null);

export function AmbientVideoSoundProvider({ children }: { children: ReactNode }) {
  const [api, setApiState] = useState<AmbientVideoSoundApi>(DEFAULT_API);
  const setApi = useCallback((next: AmbientVideoSoundApi) => {
    setApiState(next);
  }, []);
  const value = useMemo(() => ({ api, setApi }), [api, setApi]);
  return (
    <AmbientVideoSoundContext.Provider value={value}>
      {children}
    </AmbientVideoSoundContext.Provider>
  );
}

export function useAmbientVideoSound(): AmbientVideoSoundApi {
  const ctx = useContext(AmbientVideoSoundContext);
  return ctx?.api ?? DEFAULT_API;
}

export function useAmbientVideoSoundSetter(): (next: AmbientVideoSoundApi) => void {
  const ctx = useContext(AmbientVideoSoundContext);
  return ctx?.setApi ?? (() => {});
}

export { DEFAULT_API as DEFAULT_AMBIENT_VIDEO_SOUND_API };
