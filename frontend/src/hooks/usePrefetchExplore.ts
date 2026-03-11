"use client";

import { useEffect, useRef } from "react";

/**
 * Hook pour précharger les modules Three.js/ExploreScene en arrière-plan.
 * Utilise requestIdleCallback pour ne pas bloquer le main thread.
 * 
 * @param delayMs - Délai avant de lancer le prefetch (défaut: 3000ms)
 * @param enabled - Active/désactive le prefetch (défaut: true)
 */
export function usePrefetchExplore(delayMs = 3000, enabled = true) {
  const hasPrefetched = useRef(false);

  useEffect(() => {
    if (!enabled || hasPrefetched.current) return;

    const prefetchModules = () => {
      if (hasPrefetched.current) return;
      hasPrefetched.current = true;

      // Précharge Three.js et ses dépendances
      import("three").catch(() => {});
      
      // Précharge @react-three/fiber
      import("@react-three/fiber").catch(() => {});
      
      // Précharge @react-three/drei
      import("@react-three/drei").catch(() => {});
      
      // Précharge le composant ExploreScene (inclut toute la logique 3D)
      import("@/components/features/explore/canvas/ExploreScene").catch(() => {});
      
      // Précharge GSAP pour les animations de caméra
      import("gsap").catch(() => {});

      if (process.env.NODE_ENV === "development") {
        console.log("[Prefetch] Three.js et ExploreScene préchargés en arrière-plan");
      }
    };

    const timer = setTimeout(() => {
      // Utilise requestIdleCallback si disponible, sinon setTimeout
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        (window as any).requestIdleCallback(prefetchModules, { timeout: 5000 });
      } else {
        prefetchModules();
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs, enabled]);
}
