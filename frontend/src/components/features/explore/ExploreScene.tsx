"use client";

import { useRef, useMemo, useState } from "react";
import type { Mesh } from "three";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import type { OrganizationNodeApi } from "@/types/organization";

export interface ExploreSceneOptions {
  showOrbits?: boolean;
  planetsFrozen?: boolean;
}

interface ExploreSceneProps {
  nodes: OrganizationNodeApi[];
  onSelectNode: (node: OrganizationNodeApi) => void;
  options?: ExploreSceneOptions;
}

function hexToRgb(hex: string): [number, number, number] {
  if (!hex || hex.length < 3) return [0.6, 0.4, 0.8];
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return [r, g, b];
}

/** Cercle d'orbite (radius dans le plan XZ). */
function OrbitRing({ radius }: { radius: number }) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      pts.push([Math.cos(t) * radius, 0, Math.sin(t) * radius]);
    }
    return pts;
  }, [radius]);
  return (
    <Line
      points={points}
      color="#ffffff"
      opacity={0.15}
      transparent
      lineWidth={1}
    />
  );
}

/** Soleil central = noeud racine (OrganizationNode type ROOT). */
function Sun({
  node,
  onClick,
  frozen,
}: {
  node: OrganizationNodeApi;
  onClick: () => void;
  frozen: boolean;
}) {
  const meshRef = useRef<Mesh>(null);
  const color = useMemo(() => hexToRgb(node.planet_color || "#fbbf24"), [node.planet_color]);
  const scale = Math.max(node.planet_scale ?? 1.2, 1);

  useFrame((_, delta) => {
    if (!meshRef.current || frozen) return;
    meshRef.current.rotation.y += delta * 0.15;
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh
        ref={meshRef}
        scale={scale}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "default"; }}
      >
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

function Planet({
  node,
  index,
  onClick,
  isHovered,
  onHover,
  frozen,
}: {
  node: OrganizationNodeApi;
  index: number;
  onClick: () => void;
  isHovered: boolean;
  onHover: (hover: boolean) => void;
  frozen: boolean;
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
    if (!meshRef.current || frozen) return;
    const speed = node.rotation_speed ?? 0.5;
    meshRef.current.rotation.y += delta * speed;
  });

  const displayScale = isHovered ? scale * 1.15 : scale;

  return (
    <group position={[x, 0, z]}>
      <mesh
        ref={meshRef}
        scale={displayScale}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          onHover(true);
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
          onHover(false);
        }}
      >
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={isHovered ? color : [0, 0, 0]}
          emissiveIntensity={isHovered ? 0.4 : 0}
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>
      {isHovered && (
        <Html center distanceFactor={8} style={{ pointerEvents: "none", zIndex: 10 }}>
          <div className="px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 shadow-xl text-white text-sm font-medium whitespace-nowrap">
            {node.name}
          </div>
        </Html>
      )}
    </group>
  );
}

/** Retourne la position 3D d'un noeud (pour la caméra). */
function getNodePosition(
  node: OrganizationNodeApi,
  rootNode: OrganizationNodeApi | null,
  orbitNodes: OrganizationNodeApi[]
): THREE.Vector3 {
  if (rootNode && node.id === rootNode.id) return new THREE.Vector3(0, 0, 0);
  const i = orbitNodes.findIndex((n) => n.id === node.id);
  if (i < 0) return new THREE.Vector3(0, 0, 0);
  const radius = orbitNodes[i].orbit_radius ?? 3 + i * 1.5;
  const angle = (orbitNodes[i].orbit_phase ?? 0) + i * 0.7;
  return new THREE.Vector3(
    Math.cos(angle) * radius,
    0,
    Math.sin(angle) * radius
  );
}

const CAMERA_LERP = 0.08;
const DEFAULT_CAMERA_POS = new THREE.Vector3(0, 5, 10);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);

/** Anime la caméra vers le noeud zoomé ou revient à la vue d'ensemble. */
function CameraAnimator({
  zoomedNode,
  rootNode,
  orbitNodes,
  controlsRef,
}: {
  zoomedNode: OrganizationNodeApi | null;
  rootNode: OrganizationNodeApi | null;
  orbitNodes: OrganizationNodeApi[];
  controlsRef: React.RefObject<unknown>;
}) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  useFrame(() => {
    if (zoomedNode) {
      const pos = getNodePosition(zoomedNode, rootNode, orbitNodes);
      targetLookAt.current.copy(pos);
      targetPos.current.set(pos.x, pos.y + 2, pos.z + 5);
    } else {
      targetPos.current.copy(DEFAULT_CAMERA_POS);
      targetLookAt.current.copy(DEFAULT_TARGET);
    }
    camera.position.lerp(targetPos.current, CAMERA_LERP);
    const c = controlsRef.current as { target: THREE.Vector3 } | null;
    if (c?.target) {
      c.target.lerp(targetLookAt.current, CAMERA_LERP);
    }
  });
  return null;
}

function SceneContent({
  rootNode,
  orbitNodes,
  onPlanetClick,
  hoveredId,
  setHoveredId,
  showOrbits,
  frozen,
  zoomedNode,
  controlsRef,
}: {
  rootNode: OrganizationNodeApi | null;
  orbitNodes: OrganizationNodeApi[];
  onPlanetClick: (node: OrganizationNodeApi) => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  showOrbits: boolean;
  frozen: boolean;
  zoomedNode: OrganizationNodeApi | null;
  controlsRef: React.RefObject<unknown>;
}) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={2} distance={50} decay={2} color="#ffffff" />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#a855f7" />
      <pointLight position={[-10, -10, 5]} intensity={0.3} color="#3b82f6" />
      {showOrbits &&
        orbitNodes.map((node, i) => (
          <OrbitRing key={`orbit-${node.id}`} radius={node.orbit_radius ?? 3 + i * 1.5} />
        ))}
      {rootNode && (
        <Sun
          node={rootNode}
          onClick={() => onPlanetClick(rootNode)}
          frozen={frozen}
        />
      )}
      {orbitNodes.map((node, i) => (
        <Planet
          key={node.id}
          node={node}
          index={i}
          onClick={() => onPlanetClick(node)}
          isHovered={hoveredId === node.id}
          onHover={(hover) => setHoveredId(hover ? node.id : null)}
          frozen={frozen}
        />
      ))}
      <OrbitControls ref={controlsRef as never} enableZoom enablePan />
      <CameraAnimator
        zoomedNode={zoomedNode}
        rootNode={rootNode}
        orbitNodes={orbitNodes}
        controlsRef={controlsRef}
      />
    </>
  );
}

/**
 * Scène Three.js : soleil central (noeud ROOT) + planètes en orbite (noeuds d'organisation).
 * Panneau options (orbites, figer). Premier clic = zoom, bouton Détails = overlay.
 */
export function ExploreScene({ nodes, onSelectNode, options = {} }: ExploreSceneProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [zoomedNode, setZoomedNode] = useState<OrganizationNodeApi | null>(null);
  const [showOrbits, setShowOrbits] = useState(options.showOrbits ?? true);
  const [planetsFrozen, setPlanetsFrozen] = useState(options.planetsFrozen ?? false);
  const controlsRef = useRef<{ target: THREE.Vector3 } | null>(null);

  const rootNode = useMemo(
    () => nodes.find((n) => n.type === "ROOT") ?? null,
    [nodes]
  );
  const orbitNodes = useMemo(
    () => nodes.filter((n) => n.type !== "ROOT"),
    [nodes]
  );

  const handlePlanetClick = (node: OrganizationNodeApi) => {
    setZoomedNode(node);
  };
  const handleOpenDetail = () => {
    if (zoomedNode) {
      onSelectNode(zoomedNode);
      setZoomedNode(null);
    }
  };

  if (nodes.length === 0) return null;

  return (
    <div className="relative w-full h-[400px] sm:h-[60vh] rounded-xl overflow-hidden bg-[#0a0e27] border border-white/10">
      {/* Panneau d'options (orbites, figer planètes) */}
      <div
        className="absolute top-4 left-4 z-10 flex flex-col gap-3 p-3 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 shadow-lg text-sm"
        role="group"
        aria-label="Options de la scène 3D"
      >
        <label className="flex items-center gap-2 text-white/90 cursor-pointer">
          <input
            type="checkbox"
            checked={showOrbits}
            onChange={(e) => setShowOrbits(e.target.checked)}
            className="rounded border-white/30"
          />
          Orbites
        </label>
        <label className="flex items-center gap-2 text-white/90 cursor-pointer">
          <input
            type="checkbox"
            checked={planetsFrozen}
            onChange={(e) => setPlanetsFrozen(e.target.checked)}
            className="rounded border-white/30"
          />
          Figer planètes
        </label>
      </div>

      {/* Boutons zoom : Détails / Vue d'ensemble */}
      {zoomedNode && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          <button
            type="button"
            onClick={handleOpenDetail}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            Détails
          </button>
          <button
            type="button"
            onClick={() => setZoomedNode(null)}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            Vue d'ensemble
          </button>
        </div>
      )}

      <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
        <SceneContent
          rootNode={rootNode}
          orbitNodes={orbitNodes}
          onPlanetClick={handlePlanetClick}
          hoveredId={hoveredId}
          setHoveredId={setHoveredId}
          showOrbits={showOrbits}
          frozen={planetsFrozen}
          zoomedNode={zoomedNode}
          controlsRef={controlsRef}
        />
      </Canvas>
    </div>
  );
}
