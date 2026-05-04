"use client";

import { createElement, useEffect, useState } from "react";

export interface PlanetCarouselModelViewerProps {
  src: string;
  /** Affiché pendant le chargement du GLB (souvent photo profil / couverture). */
  poster?: string | null;
  /** Vitesse de rotation automatique (aperçu carrousel). */
  rotationPerSecond?: string;
  className?: string;
}

/**
 * Aperçu GLB léger pour le carrousel mobile (`@google/model-viewer`).
 * `pointer-events: none` pour laisser passer les gestes swipe du carrousel.
 */
export function PlanetCarouselModelViewer({
  src,
  poster,
  rotationPerSecond = "16deg",
  className = "",
}: PlanetCarouselModelViewerProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void import("@google/model-viewer").then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className={`relative h-full w-full overflow-hidden rounded-full bg-transparent ${className}`}>
        {poster ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={poster} alt="" className="absolute inset-0 h-full w-full object-contain opacity-50" />
        ) : null}
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.07] to-transparent" />
      </div>
    );
  }

  return createElement("model-viewer", {
    key: src,
    src,
    poster: poster ?? undefined,
    alt: "",
    "camera-controls": false,
    "auto-rotate": true,
    "rotation-per-second": rotationPerSecond,
    "shadow-intensity": "0",
    exposure: "1.05",
    /** Réduit la zone « vide » autour du mesh dans le cercle. */
    "field-of-view": "28deg",
    "interaction-prompt": "none",
    "touch-action": "none",
    tabIndex: -1,
    className: `h-full w-full bg-transparent ${className}`,
    style: {
      pointerEvents: "none" as const,
      backgroundColor: "transparent",
    },
  });
}
