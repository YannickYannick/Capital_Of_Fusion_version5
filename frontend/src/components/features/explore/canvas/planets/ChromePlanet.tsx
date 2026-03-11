"use client";

import { memo } from "react";

interface ChromePlanetProps {
  scale: number;
}

const ChromePlanet = memo(function ChromePlanet({ scale }: ChromePlanetProps) {
  return (
    <mesh scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial roughness={0.05} metalness={1.0} color="#cccccc" />
    </mesh>
  );
});

export default ChromePlanet;
