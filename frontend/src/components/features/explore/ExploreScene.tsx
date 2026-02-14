"use client";

import { useRef, useMemo } from "react";
import type { Mesh } from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrganizationNodeApi } from "@/types/organization";

interface ExploreSceneProps {
  nodes: OrganizationNodeApi[];
  onSelectNode: (node: OrganizationNodeApi) => void;
}

function hexToRgb(hex: string): [number, number, number] {
  if (!hex || hex.length < 3) return [0.6, 0.4, 0.8];
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return [r, g, b];
}

function Planet({
  node,
  index,
  onClick,
}: {
  node: OrganizationNodeApi;
  index: number;
  onClick: () => void;
}) {
  const meshRef = useRef<Mesh>(null);
  const radius = node.orbit_radius ?? 3 + index * 1.5;
  const angle = (node.orbit_phase ?? 0) + index * 0.7;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const scale = (node.planet_scale ?? 0.5) || 0.4 + index * 0.1;
  const color = useMemo(
    () => hexToRgb(node.planet_color || "#a855f7"),
    [node.planet_color]
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const speed = node.rotation_speed ?? 0.5;
    meshRef.current.rotation.y += delta * speed;
  });

  return (
    <group position={[x, 0, z]}>
      <mesh
        ref={meshRef}
        scale={scale}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function SceneContent({
  nodes,
  onSelectNode,
}: {
  nodes: OrganizationNodeApi[];
  onSelectNode: (node: OrganizationNodeApi) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, 5]} intensity={0.3} />
      {nodes.map((node, i) => (
        <Planet
          key={node.id}
          node={node}
          index={i}
          onClick={() => onSelectNode(node)}
        />
      ))}
      <OrbitControls enableZoom enablePan />
    </>
  );
}

/**
 * Scène Three.js : une sphère par noeud, orbites, clic → callback.
 */
export function ExploreScene({ nodes, onSelectNode }: ExploreSceneProps) {
  if (nodes.length === 0) return null;

  return (
    <div className="w-full h-[400px] sm:h-[60vh] rounded-xl overflow-hidden bg-[#0a0e27] border border-white/10">
      <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
        <SceneContent nodes={nodes} onSelectNode={onSelectNode} />
      </Canvas>
    </div>
  );
}
