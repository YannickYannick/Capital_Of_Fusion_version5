"use client";

import { memo } from "react";
import * as THREE from "three";

interface WirePlanetProps {
  scale: number;
  color: THREE.Color;
}

const WirePlanet = memo(function WirePlanet({ scale, color }: WirePlanetProps) {
  return (
    <mesh scale={scale}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.8} />
    </mesh>
  );
});

export default WirePlanet;
