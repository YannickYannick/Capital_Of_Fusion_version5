"use client";

import { useEffect, useRef } from "react";

let globalPrefetchDone = false;

const PREFETCH_MODULES = [
  { module: "three", load: () => import("three") },
  { module: "@react-three/fiber", load: () => import("@react-three/fiber") },
  { module: "@react-three/drei", load: () => import("@react-three/drei") },
  { module: "ExploreScene", load: () => import("@/components/features/explore/canvas/ExploreScene") },
  { module: "gsap", load: () => import("gsap") },
] as const;

/**
 * Précharge immédiatement Three.js + ExploreScene (chunk lourd).
 * Appelable au survol du CTA « Explorer » ou au montage de /explore pour chevaucher le réseau.
 */
export function prefetchExploreModules(): void {
  if (typeof window === "undefined" || globalPrefetchDone) return;
  globalPrefetchDone = true;

  if (process.env.NODE_ENV === "development") {
    console.log("[Prefetch] Three.js et ExploreScene — préchargement lancé");
    const wallStart = performance.now();
    void Promise.all(
      PREFETCH_MODULES.map(async ({ module: name, load }) => {
        const t0 = performance.now();
        try {
          await load();
          return { Module: name, "Durée (ms)": Math.round(performance.now() - t0) };
        } catch {
          return { Module: name, "Durée (ms)": "erreur" as const };
        }
      })
    ).then((rows) => {
      const wallMs = Math.round(performance.now() - wallStart);
      // eslint-disable-next-line no-console
      console.log("[Prefetch] Temps par module (chargés en parallèle) :");
      // eslint-disable-next-line no-console
      console.table([
        ...rows,
        { Module: "— mur (tous en parallèle) —", "Durée (ms)": wallMs },
      ]);
    });
    return;
  }

  for (const { load } of PREFETCH_MODULES) {
    load().catch(() => {});
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
