"use client";

import { memo, useMemo } from "react";
import * as THREE from "three";

interface DottedPlanetProps {
  scale: number;
}

const DottedPlanet = memo(function DottedPlanet({ scale }: DottedPlanetProps) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions: number[] = [];
    for (let i = 0; i < 600; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      positions.push(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      );
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, []);

  return (
    <points geometry={geo} scale={scale}>
      <pointsMaterial color="#ffffff" size={0.02} transparent opacity={0.8} sizeAttenuation />
    </points>
  );
});

export default DottedPlanet;
