"use client";

import { memo } from "react";
import * as THREE from "three";

interface GlassPlanetProps {
  scale: number;
  color: THREE.Color;
}

const GlassPlanet = memo(function GlassPlanet({ scale, color }: GlassPlanetProps) {
  return (
    <mesh scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhysicalMaterial
        color={color}
        transmission={0.9}
        roughness={0.1}
        metalness={0.9}
        clearcoat={1}
        transparent
      />
    </mesh>
  );
});

export default GlassPlanet;
