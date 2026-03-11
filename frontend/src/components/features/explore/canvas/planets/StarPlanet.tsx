"use client";

import { memo, useMemo } from "react";
import * as THREE from "three";

interface StarPlanetProps {
  scale: number;
  color: THREE.Color;
}

const StarPlanet = memo(function StarPlanet({ scale, color }: StarPlanetProps) {
  const particles = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < 20; i++) {
      pts.push([
        (Math.random() - 0.5) * scale * 3,
        (Math.random() - 0.5) * scale * 3,
        (Math.random() - 0.5) * scale * 3,
      ]);
    }
    return pts;
  }, [scale]);

  return (
    <group>
      <mesh scale={scale}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.6} />
      </mesh>
      {particles.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[scale * 0.1, 6, 6]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
});

export default StarPlanet;
