"use client";

import { useLayoutEffect, useState } from "react";

/** Aligné sur ExploreScene (labels tactiles) : étroit ou pointeur grossier. */
export function isExploreCompactViewport(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(max-width: 768px)").matches ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

export type ExploreLayoutMode = "unknown" | "compact" | "wide";

/**
 * Mode mise en page Explore : `unknown` jusqu’au premier layout client (évite une frame desktop puis mobile).
 */
export function useExploreLayoutMode(): ExploreLayoutMode {
  const [mode, setMode] = useState<ExploreLayoutMode>("unknown");

  useLayoutEffect(() => {
    const read = (): ExploreLayoutMode =>
      isExploreCompactViewport() ? "compact" : "wide";

    setMode(read());

    const mqNarrow = window.matchMedia("(max-width: 768px)");
    const mqCoarse = window.matchMedia("(pointer: coarse)");
    const onChange = () => setMode(read());
    mqNarrow.addEventListener("change", onChange);
    mqCoarse.addEventListener("change", onChange);
    return () => {
      mqNarrow.removeEventListener("change", onChange);
      mqCoarse.removeEventListener("change", onChange);
    };
  }, []);

  return mode;
}

export function useExploreCompactLayout(): boolean {
  return useExploreLayoutMode() === "compact";
}
