"use client";

import { lazy, Suspense, memo } from "react";
import * as THREE from "three";

// Lazy load chaque type de planète pour réduire le bundle initial
const LazyWirePlanet = lazy(() => import("./WirePlanet"));
const LazyDottedPlanet = lazy(() => import("./DottedPlanet"));
const LazyGlassPlanet = lazy(() => import("./GlassPlanet"));
const LazyChromePlanet = lazy(() => import("./ChromePlanet"));
const LazyNetworkPlanet = lazy(() => import("./NetworkPlanet"));
const LazyStarPlanet = lazy(() => import("./StarPlanet"));
const LazyGlbPlanet = lazy(() => import("./GlbPlanet"));

// Fallback minimal pendant le chargement d'un type de planète
function PlanetFallback({ scale }: { scale: number }) {
  return (
    <mesh scale={scale}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#666666" wireframe transparent opacity={0.3} />
    </mesh>
  );
}

export type PlanetType = "wire" | "dotted" | "glass" | "chrome" | "network" | "star";

interface DynamicPlanetProps {
  type: PlanetType;
  scale: number;
  color: THREE.Color;
  visualSource?: "preset" | "glb" | "gif";
  modelUrl?: string;
  textureUrl?: string;
}

/**
 * Composant unifié qui charge dynamiquement le bon type de planète.
 * Réduit le bundle initial en ne chargeant que les types utilisés.
 */
export const DynamicPlanet = memo(function DynamicPlanet({
  type,
  scale,
  color,
  visualSource = "preset",
  modelUrl,
  textureUrl,
}: DynamicPlanetProps) {
  // GLB model (custom 3D)
  if (visualSource === "glb" && modelUrl) {
    return (
      <Suspense fallback={<PlanetFallback scale={scale} />}>
        <LazyGlbPlanet url={modelUrl} scale={scale} />
      </Suspense>
    );
  }

  // GIF texture (placeholder pour l'instant)
  if (visualSource === "gif" && textureUrl) {
    return (
      <mesh>
        <planeGeometry args={[scale * 2, scale * 2]} />
        <meshBasicMaterial color="#ffffff" transparent side={THREE.DoubleSide} />
      </mesh>
    );
  }

  // Preset planet types
  switch (type) {
    case "wire":
      return (
        <Suspense fallback={<PlanetFallback scale={scale} />}>
          <LazyWirePlanet scale={scale} color={color} />
        </Suspense>
      );
    case "dotted":
      return (
        <Suspense fallback={<PlanetFallback scale={scale} />}>
          <LazyDottedPlanet scale={scale} />
        </Suspense>
      );
    case "chrome":
      return (
        <Suspense fallback={<PlanetFallback scale={scale} />}>
          <LazyChromePlanet scale={scale} />
        </Suspense>
      );
    case "network":
      return (
        <Suspense fallback={<PlanetFallback scale={scale} />}>
          <LazyNetworkPlanet scale={scale} color={color} />
        </Suspense>
      );
    case "star":
      return (
        <Suspense fallback={<PlanetFallback scale={scale} />}>
          <LazyStarPlanet scale={scale} color={color} />
        </Suspense>
      );
    case "glass":
    default:
      return (
        <Suspense fallback={<PlanetFallback scale={scale} />}>
          <LazyGlassPlanet scale={scale} color={color} />
        </Suspense>
      );
  }
});
