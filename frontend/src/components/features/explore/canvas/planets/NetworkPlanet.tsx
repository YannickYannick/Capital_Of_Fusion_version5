"use client";

import { memo, useMemo } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";

interface NetworkPlanetProps {
  scale: number;
  color: THREE.Color;
}

const NetworkPlanet = memo(function NetworkPlanet({ scale, color }: NetworkPlanetProps) {
  const { points, lines } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 30; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      pts.push(
        new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta),
          Math.sin(phi) * Math.sin(theta),
          Math.cos(phi)
        )
      );
    }
    const lns: Array<[number, number, number][]> = [];
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        if (pts[i].distanceTo(pts[j]) < 0.6) {
          lns.push([pts[i].toArray() as [number, number, number], pts[j].toArray() as [number, number, number]]);
        }
      }
    }
    return { points: pts, lines: lns };
  }, []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setFromPoints(points);
    return g;
  }, [points]);

  return (
    <group scale={scale}>
      <points geometry={geo}>
        <pointsMaterial color={color} size={0.04} transparent opacity={0.4} />
      </points>
      {lines.map((pair, i) => (
        <Line key={i} points={pair} color={color} opacity={0.4} transparent lineWidth={0.5} />
      ))}
    </group>
  );
});

export default NetworkPlanet;
