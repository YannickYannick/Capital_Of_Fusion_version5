"use client";

import { useEffect, useRef } from "react";

let globalPrefetchDone = false;

/**
 * Précharge immédiatement Three.js + ExploreScene (chunk lourd).
 * Appelable au survol du CTA « Explorer » ou au montage de /explore pour chevaucher le réseau.
 */
export function prefetchExploreModules(): void {
  if (typeof window === "undefined" || globalPrefetchDone) return;
  globalPrefetchDone = true;

  import("three").catch(() => {});
  import("@react-three/fiber").catch(() => {});
  import("@react-three/drei").catch(() => {});
  import("@/components/features/explore/canvas/ExploreScene").catch(() => {});
  import("gsap").catch(() => {});

  if (process.env.NODE_ENV === "development") {
    console.log("[Prefetch] Three.js et ExploreScene — préchargement lancé");
  }
}

/**
 * Hook pour précharger les modules Three.js/ExploreScene en arrière-plan.
 * Utilise requestIdleCallback pour ne pas bloquer le main thread.
 *
 * @param delayMs - Délai avant de lancer le prefetch (défaut: 600ms, plus court qu'avant pour /explore plus réactif)
 * @param enabled - Active/désactive le prefetch (défaut: true)
 */
export function usePrefetchExplore(delayMs = 600, enabled = true) {
  const hasPrefetched = useRef(false);

  useEffect(() => {
    if (!enabled || hasPrefetched.current) return;

    let idleId: number | undefined;

    const prefetchModules = () => {
      if (hasPrefetched.current) return;
      hasPrefetched.current = true;
      prefetchExploreModules();
    };

    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(prefetchModules, { timeout: 3000 });
      } else {
        prefetchModules();
      }
    }, delayMs);

    return () => {
      clearTimeout(timer);
      if (idleId !== undefined) cancelIdleCallback(idleId);
    };
  }, [delayMs, enabled]);
}
