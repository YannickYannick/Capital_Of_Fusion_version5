"use client";

import {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
  type MutableRefObject,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";
import type { OrganizationNodeApi } from "@/types/organization";
import { usePlanetsOptions } from "@/contexts/PlanetsOptionsContext";

// ─────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────

function hexToColor(hex: string): THREE.Color {
  const h = hex?.startsWith("#") ? hex : `#${hex ?? "a855f7"}`;
  return new THREE.Color(h || "#a855f7");
}

/** Calcule la position d'une squircle (carré-cercle) */
function getSquirclePosition(
  t: number,
  radius: number,
  roundness: number
): [number, number] {
  const angle = t * Math.PI * 2;
  const cosT = Math.cos(angle);
  const sinT = Math.sin(angle);
  const r = 1 - roundness;
  const x =
    radius *
    Math.sign(cosT) *
    Math.pow(Math.abs(cosT), r);
  const z =
    radius *
    Math.sign(sinT) *
    Math.pow(Math.abs(sinT), r);
  return [x, z];
}

function getOrbitPosition(
  phase: number,
  radius: number,
  shape: "circle" | "squircle",
  roundness: number
): THREE.Vector3 {
  if (shape === "squircle") {
    const [x, z] = getSquirclePosition(phase / (Math.PI * 2), radius, roundness);
    return new THREE.Vector3(x, 0, z);
  }
  return new THREE.Vector3(
    Math.cos(phase) * radius,
    0,
    Math.sin(phase) * radius
  );
}

// ─────────────────────────────────────────────────────────
//  Orbit ring
// ─────────────────────────────────────────────────────────

function OrbitRing({
  radius,
  shape,
  roundness,
}: {
  radius: number;
  shape: "circle" | "squircle";
  roundness: number;
}) {
  const points = useMemo<[number, number, number][]>(() => {
    const pts: [number, number, number][] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const phase = t * Math.PI * 2;
      if (shape === "squircle") {
        const [x, z] = getSquirclePosition(t, radius, roundness);
        pts.push([x, 0, z]);
      } else {
        pts.push([Math.cos(phase) * radius, 0, Math.sin(phase) * radius]);
      }
    }
    return pts;
  }, [radius, shape, roundness]);

  return (
    <Line points={points} color="#ffffff" opacity={0.1} transparent lineWidth={1} />
  );
}

// ─────────────────────────────────────────────────────────
//  Planet geometries par type
// ─────────────────────────────────────────────────────────

function WirePlanet({ scale, color }: { scale: number; color: THREE.Color }) {
  return (
    <mesh scale={scale}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.6} />
    </mesh>
  );
}

function DottedPlanet({ scale }: { scale: number }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions: number[] = [];
    for (let i = 0; i < 1500; i++) {
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
      <pointsMaterial color="#ffffff" size={0.015} transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

function GlassPlanet({ scale, color }: { scale: number; color: THREE.Color }) {
  return (
    <mesh scale={scale}>
      <sphereGeometry args={[1, 64, 64]} />
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
}

function ChromePlanet({ scale }: { scale: number }) {
  return (
    <mesh scale={scale}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial roughness={0.05} metalness={1.0} color="#cccccc" />
    </mesh>
  );
}

function NetworkPlanet({ scale, color }: { scale: number; color: THREE.Color }) {
  const { points, lines } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 60; i++) {
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
        if (pts[i].distanceTo(pts[j]) < 0.5) {
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
}

function StarPlanet({ scale, color }: { scale: number; color: THREE.Color }) {
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
}

function GlbPlanet({
  url,
  scale,
}: {
  url: string;
  scale: number;
}) {
  const [scene, setScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    if (!url) return;
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => {
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) gltf.scene.scale.setScalar(scale / maxDim);
      setScene(gltf.scene);
    });
  }, [url, scale]);

  if (!scene) {
    return (
      <mesh scale={scale}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#888888" wireframe transparent opacity={0.4} />
      </mesh>
    );
  }
  return <primitive object={scene} />;
}

// ─────────────────────────────────────────────────────────
//  Composant planète unifié (orbital + entrée + physique)
// ─────────────────────────────────────────────────────────

interface PlanetState {
  phase: number;        // phase orbitale courante
  entryProgress: number; // 0 = pas démarré, 1+ = terminé et en orbite
  vel: THREE.Vector3;    // vitesse physique
  hasEnteredOrbit: boolean;
  phaseOffset: number;   // décalage calculé au moment de l'entrée en orbite
}

interface PlanetProps {
  node: OrganizationNodeApi;
  index: number;
  orbitRadius: number;
  orbitShape: "circle" | "squircle";
  orbitRoundness: number;
  frozen: boolean;
  entryStartX: number;
  entryStartY: number;
  entryStartZ: number | null;
  entrySpeed: number;
  entryDelay: number; // ms
  restartKey: number;
  mousePos: MutableRefObject<THREE.Vector3>;
  mouseForce: number;
  collisionForce: number;
  damping: number;
  returnForce: number;
  allPlanetPositions: MutableRefObject<Map<string, THREE.Vector3>>;
  onPositionUpdate?: (id: string, pos: THREE.Vector3) => void;
  onClick: () => void;
  onHover: (v: boolean) => void;
  isHovered: boolean;
  isSelected: boolean;
}

function Planet({
  node,
  index,
  orbitRadius,
  orbitShape,
  orbitRoundness,
  frozen,
  entryStartX,
  entryStartY,
  entryStartZ,
  entrySpeed,
  entryDelay,
  restartKey,
  mousePos,
  mouseForce,
  collisionForce,
  damping,
  returnForce,
  allPlanetPositions,
  onPositionUpdate,
  onClick,
  onHover,
  isHovered,
  isSelected,
}: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const startTime = useRef<number | null>(null);
  const stateRef = useRef<PlanetState>({
    phase: node.orbit_phase ?? (index * 0.7),
    entryProgress: 0,
    vel: new THREE.Vector3(),
    hasEnteredOrbit: false,
    phaseOffset: 0,
  });
  const hasDelayPassed = useRef(false);

  // Réinitialiser l'animation d'entrée au restart
  useEffect(() => {
    stateRef.current = {
      phase: node.orbit_phase ?? (index * 0.7),
      entryProgress: 0,
      vel: new THREE.Vector3(),
      hasEnteredOrbit: false,
      phaseOffset: 0,
    };
    startTime.current = null;
    hasDelayPassed.current = false;
  }, [restartKey, node.orbit_phase, index]);

  const scale = node.planet_scale ?? 0.6;
  const color = hexToColor(node.planet_color || "#a855f7");
  const orbitSpeed = node.orbit_speed ?? 0.1;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.033);
    const s = stateRef.current;

    // Délai d'entrée échelonné
    if (!hasDelayPassed.current) {
      if (startTime.current === null) {
        startTime.current = state.clock.elapsedTime * 1000;
      }
      const elapsed = state.clock.elapsedTime * 1000 - startTime.current;
      if (elapsed < entryDelay) {
        groupRef.current.position.set(entryStartX, entryStartY, entryStartZ ?? orbitRadius);
        return;
      }
      hasDelayPassed.current = true;
    }

    if (!s.hasEnteredOrbit) {
      // Phase 1 : animation d'entrée en ligne droite vers X=0
      const startZ = entryStartZ ?? orbitRadius;
      const targetPhase = node.orbit_phase ?? (index * 0.7);
      const targetPos = getOrbitPosition(targetPhase, orbitRadius, orbitShape, orbitRoundness);

      const speed = entrySpeed * dt;
      const currentX = groupRef.current.position.x;
      const newX = currentX + speed;

      if (newX >= 0) {
        // Entrée en orbite
        s.hasEnteredOrbit = true;
        // Calculer le phaseOffset pour continuité
        s.phaseOffset = targetPhase;
        s.phase = targetPhase;
        groupRef.current.position.copy(targetPos);
      } else {
        // Interpoler Y et Z vers la destination
        const progress = Math.max(0, 1 - (-newX / -entryStartX));
        const currentY = entryStartY + (targetPos.y - entryStartY) * progress;
        const currentZ = startZ + (targetPos.z - startZ) * progress;
        groupRef.current.position.set(newX, currentY, currentZ);
      }
      return;
    }

    // Phase 2 : orbite + physique
    if (!frozen) {
      s.phase += orbitSpeed * dt;
    }

    const nominalPos = getOrbitPosition(s.phase, orbitRadius, orbitShape, orbitRoundness);
    const currentPos = groupRef.current.position.clone();

    // Force de retour (spring)
    const springForce = nominalPos.clone().sub(currentPos).multiplyScalar(returnForce);
    s.vel.add(springForce);

    // Force souris (répulsion)
    if (mouseForce > 0) {
      const MOUSE_RADIUS = 5;
      const toMouse = currentPos.clone().sub(mousePos.current);
      toMouse.y = 0;
      const dist = toMouse.length();
      if (dist < MOUSE_RADIUS && dist > 0.01) {
        const strength = (1 - dist / MOUSE_RADIUS) * mouseForce * 2;
        s.vel.add(toMouse.normalize().multiplyScalar(strength * dt));
      }
    }

    // Force collision inter-planètes
    if (collisionForce > 0) {
      allPlanetPositions.current.forEach((otherPos, otherId) => {
        if (otherId === node.id) return;
        const diff = currentPos.clone().sub(otherPos);
        diff.y = 0;
        const dist = diff.length();
        const minDist = (scale + 1) * 0.8;
        if (dist < minDist && dist > 0.01) {
          const strength = (1 - dist / minDist) * collisionForce;
          s.vel.add(diff.normalize().multiplyScalar(strength * 0.5));
        }
      });
    }

    // Amortissement
    s.vel.multiplyScalar(damping);

    // Appliquer la vitesse
    const newPos = currentPos.add(s.vel);
    groupRef.current.position.copy(newPos);

    // Mettre à jour le registre des positions
    if (onPositionUpdate) {
      onPositionUpdate(node.id, newPos.clone());
    }
  });

  const displayScale = isHovered || isSelected ? scale * 1.15 : scale;
  const visualSource = node.visual_source || "preset";
  const planetType = node.planet_type || "glass";

  return (
    <group
      ref={groupRef}
      position={[entryStartX, entryStartY, entryStartZ ?? orbitRadius]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; onHover(true); }}
      onPointerOut={() => { document.body.style.cursor = "default"; onHover(false); }}
    >
      {visualSource === "glb" && node.model_3d ? (
        <GlbPlanet url={node.model_3d} scale={displayScale} />
      ) : visualSource === "gif" && node.planet_texture ? (
        <mesh>
          <planeGeometry args={[displayScale * 2, displayScale * 2]} />
          <meshBasicMaterial color="#ffffff" transparent side={THREE.DoubleSide} />
        </mesh>
      ) : planetType === "wire" ? (
        <WirePlanet scale={displayScale} color={color} />
      ) : planetType === "dotted" ? (
        <DottedPlanet scale={displayScale} />
      ) : planetType === "chrome" ? (
        <ChromePlanet scale={displayScale} />
      ) : planetType === "network" ? (
        <NetworkPlanet scale={displayScale} color={color} />
      ) : planetType === "star" ? (
        <StarPlanet scale={displayScale} color={color} />
      ) : (
        // glass (default)
        <GlassPlanet scale={displayScale} color={color} />
      )}

      {/* Glow effect au hover/sélection */}
      {(isHovered || isSelected) && (
        <mesh>
          <sphereGeometry args={[displayScale * 1.3, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.08} />
        </mesh>
      )}

      {/* Label */}
      <LabelSprite text={node.name} offsetY={displayScale + 1.2} visible={isHovered || isSelected} />
    </group>
  );
}

// ─────────────────────────────────────────────────────────
//  Label sprite (billboard via CanvasTexture)
// ─────────────────────────────────────────────────────────

function LabelSprite({
  text,
  offsetY,
  visible,
}: {
  text: string;
  offsetY: number;
  visible: boolean;
}) {
  const spriteRef = useRef<THREE.Sprite>(null);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 256, 64);
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.roundRect(4, 4, 248, 56, 12);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 128, 32);
    return new THREE.CanvasTexture(canvas);
  }, [text]);

  useFrame(({ camera }) => {
    if (!spriteRef.current) return;
    const dist = camera.position.length();
    const s = Math.max(0.5, dist * 0.12);
    spriteRef.current.scale.set(s * 1.8, s * 0.45, 1);
  });

  if (!visible) return null;

  return (
    <sprite ref={spriteRef} position={[0, offsetY, 0]}>
      <spriteMaterial map={texture} transparent depthTest={false} />
    </sprite>
  );
}

// ─────────────────────────────────────────────────────────
//  Soleil central (nœud ROOT)
// ─────────────────────────────────────────────────────────

function Sun({
  node,
  frozen,
  onClick,
  isSelected,
  isHovered,
  onHover,
}: {
  node: OrganizationNodeApi;
  frozen: boolean;
  onClick: () => void;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (v: boolean) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = hexToColor(node.planet_color || "#fbbf24");
  const scale = Math.max(node.planet_scale ?? 1.2, 1);

  useFrame((_, delta) => {
    if (!meshRef.current || frozen) return;
    meshRef.current.rotation.y += delta * 0.15;
  });

  const displayScale = isHovered || isSelected ? scale * 1.1 : scale;

  return (
    <group
      position={[0, 0, 0]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; onHover(true); }}
      onPointerOut={() => { document.body.style.cursor = "default"; onHover(false); }}
    >
      <mesh ref={meshRef} scale={displayScale}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.7}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      {/* Halo lumineux */}
      <mesh scale={displayScale * 1.4}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.06} />
      </mesh>
      <LabelSprite text={node.name} offsetY={displayScale + 1.5} visible={isHovered || isSelected} />
    </group>
  );
}

// ─────────────────────────────────────────────────────────
//  Scene Camera Controller (GSAP)
// ─────────────────────────────────────────────────────────

interface CameraControllerProps {
  selectedNodePos: THREE.Vector3 | null;
  selectedNodeScale: number;
  resetKey: number;
  fov: number;
  controlsRef: React.RefObject<{ target: THREE.Vector3; update: () => void } | null>;
  onCameraMove?: (pos: THREE.Vector3, target: THREE.Vector3) => void;
}

function CameraController({
  selectedNodePos,
  selectedNodeScale,
  resetKey,
  fov,
  controlsRef,
  onCameraMove,
}: CameraControllerProps) {
  const { camera } = useThree();
  const isAnimating = useRef(false);
  const prevResetKey = useRef(resetKey);
  const prevSelectedPos = useRef<THREE.Vector3 | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mettre à jour le FOV
  useEffect(() => {
    if ("fov" in camera) {
      (camera as THREE.PerspectiveCamera).fov = fov;
      camera.updateProjectionMatrix();
    }
  }, [camera, fov]);

  // Charger la position caméra depuis localStorage
  useEffect(() => {
    const savedPos = localStorage.getItem("explore_camera_pos");
    const savedTarget = localStorage.getItem("explore_camera_target");
    if (savedPos) {
      try {
        const p = JSON.parse(savedPos);
        camera.position.set(p.x, p.y, p.z);
      } catch { /* ignore */ }
    }
    if (savedTarget && controlsRef.current) {
      try {
        const t = JSON.parse(savedTarget);
        controlsRef.current.target.set(t.x, t.y, t.z);
      } catch { /* ignore */ }
    }
  }, [camera, controlsRef]);

  useFrame(() => {
    // Sauvegarder la position caméra (throttled via saveTimer)
    if (!isAnimating.current) {
      if (!saveTimer.current) {
        saveTimer.current = setTimeout(() => {
          const pos = camera.position;
          const tgt = controlsRef.current?.target;
          localStorage.setItem("explore_camera_pos", JSON.stringify({ x: pos.x, y: pos.y, z: pos.z }));
          if (tgt) localStorage.setItem("explore_camera_target", JSON.stringify({ x: tgt.x, y: tgt.y, z: tgt.z }));
          saveTimer.current = null;
        }, 500);
      }
    }
  });

  // Reset caméra
  useEffect(() => {
    if (prevResetKey.current === resetKey) return;
    prevResetKey.current = resetKey;

    const refX = parseFloat(localStorage.getItem("camera_ref_x") ?? "0");
    const refY = parseFloat(localStorage.getItem("camera_ref_y") ?? "6.84");
    const refZ = parseFloat(localStorage.getItem("camera_ref_z") ?? "18.79");
    const refTX = parseFloat(localStorage.getItem("camera_ref_target_x") ?? "0");
    const refTY = parseFloat(localStorage.getItem("camera_ref_target_y") ?? "0");
    const refTZ = parseFloat(localStorage.getItem("camera_ref_target_z") ?? "0");

    isAnimating.current = true;
    gsap.to(camera.position, {
      x: refX, y: refY, z: refZ,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        if (controlsRef.current) {
          gsap.to(controlsRef.current.target, { x: refTX, y: refTY, z: refTZ, duration: 1.5, ease: "power2.inOut" });
          controlsRef.current.update();
        }
      },
      onComplete: () => { isAnimating.current = false; },
    });
  }, [resetKey, camera, controlsRef]);

  // Zoom sur planète sélectionnée
  useEffect(() => {
    if (!selectedNodePos) return;
    if (prevSelectedPos.current?.equals(selectedNodePos)) return;
    prevSelectedPos.current = selectedNodePos.clone();

    const offset = 8 + (selectedNodeScale * 2);
    const targetX = selectedNodePos.x;
    const targetY = selectedNodePos.y;
    const targetZ = selectedNodePos.z;

    isAnimating.current = true;
    gsap.to(camera.position, {
      x: targetX,
      y: targetY + offset * 0.2,
      z: targetZ + offset,
      duration: 1.5,
      ease: "power2.inOut",
      onComplete: () => { isAnimating.current = false; },
    });
    if (controlsRef.current) {
      gsap.to(controlsRef.current.target, {
        x: targetX, y: targetY, z: targetZ,
        duration: 1.5, ease: "power2.inOut",
        onUpdate: () => controlsRef.current?.update(),
      });
    }
  }, [selectedNodePos, selectedNodeScale, camera, controlsRef]);

  return null;
}

// ─────────────────────────────────────────────────────────
//  Scene Content (intérieur du Canvas)
// ─────────────────────────────────────────────────────────

interface SceneContentProps {
  rootNode: OrganizationNodeApi | null;
  orbitNodes: OrganizationNodeApi[];
  selectedId: string | null;
  onPlanetClick: (node: OrganizationNodeApi) => void;
  showOrbits: boolean;
  frozen: boolean;
  resetKey: number;
  restartKey: number;
  orbitSpacing: number;
  orbitShape: "circle" | "squircle";
  orbitRoundness: number;
  globalShapeOverride: boolean;
  mouseForce: number;
  collisionForce: number;
  damping: number;
  returnForce: number;
  fishEye: number;
  entryStartX: number;
  entryStartY: number;
  entryStartZ: number | null;
  entrySpeed: number;
  controlsRef: React.RefObject<{ target: THREE.Vector3; update: () => void } | null>;
  selectedNodePos: THREE.Vector3 | null;
}

function SceneContent({
  rootNode,
  orbitNodes,
  selectedId,
  onPlanetClick,
  showOrbits,
  frozen,
  resetKey,
  restartKey,
  orbitSpacing,
  orbitShape: globalShape,
  orbitRoundness: globalRoundness,
  globalShapeOverride,
  mouseForce,
  collisionForce,
  damping,
  returnForce,
  fishEye,
  entryStartX,
  entryStartY,
  entryStartZ,
  entrySpeed,
  controlsRef,
  selectedNodePos,
}: SceneContentProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const mousePosRef = useRef(new THREE.Vector3());
  const allPositions = useRef<Map<string, THREE.Vector3>>(new Map());

  // Track mouse position in 3D (plan Y=0)
  const { camera, gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const pt = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, pt);
      mousePosRef.current.copy(pt);
    };
    canvas.addEventListener("mousemove", handleMove);
    return () => canvas.removeEventListener("mousemove", handleMove);
  }, [camera, gl]);

  const selectedNode = orbitNodes.find(n => n.id === selectedId) ?? (rootNode?.id === selectedId ? rootNode : null);
  const selectedScale = selectedNode?.planet_scale ?? 0.6;

  return (
    <>
      {/* Éclairage V4 */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 10]} intensity={2.0} castShadow />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={1.0} color="#7c3aed" />
      <pointLight position={[0, 5, 5]} intensity={1.0} color="#06b6d4" />

      {/* Orbites */}
      {showOrbits &&
        orbitNodes.map((node) => {
          const r = (node.orbit_radius ?? 5) * orbitSpacing;
          const shape = globalShapeOverride ? globalShape : ((node.orbit_shape as "circle" | "squircle") || "circle");
          const roundness = globalShapeOverride ? globalRoundness : (node.orbit_roundness ?? 0.6);
          return (
            <OrbitRing key={`orbit-${node.id}`} radius={r} shape={shape} roundness={roundness} />
          );
        })}

      {/* Soleil ROOT */}
      {rootNode && (
        <Sun
          node={rootNode}
          frozen={frozen}
          onClick={() => onPlanetClick(rootNode)}
          isSelected={selectedId === rootNode.id}
          isHovered={hoveredId === rootNode.id}
          onHover={(v) => setHoveredId(v ? rootNode.id : null)}
        />
      )}

      {/* Planètes */}
      {orbitNodes.map((node, i) => {
        const r = (node.orbit_radius ?? 3 + i * 1.5) * orbitSpacing;
        const shape = globalShapeOverride ? globalShape : ((node.orbit_shape as "circle" | "squircle") || "circle");
        const roundness = globalShapeOverride ? globalRoundness : (node.orbit_roundness ?? 0.6);
        return (
          <Planet
            key={`${node.id}-${restartKey}`}
            node={node}
            index={i}
            orbitRadius={r}
            orbitShape={shape}
            orbitRoundness={roundness}
            frozen={frozen}
            entryStartX={entryStartX}
            entryStartY={entryStartY}
            entryStartZ={entryStartZ}
            entrySpeed={entrySpeed}
            entryDelay={i * 200}
            restartKey={restartKey}
            mousePos={mousePosRef}
            mouseForce={mouseForce}
            collisionForce={collisionForce}
            damping={damping}
            returnForce={returnForce}
            allPlanetPositions={allPositions}
            onPositionUpdate={(id, pos) => allPositions.current.set(id, pos)}
            onClick={() => onPlanetClick(node)}
            onHover={(v) => setHoveredId(v ? node.id : null)}
            isHovered={hoveredId === node.id}
            isSelected={selectedId === node.id}
          />
        );
      })}

      <OrbitControls
        ref={controlsRef as never}
        enableZoom
        enablePan
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={60}
        maxPolarAngle={Math.PI / 1.5}
      />

      <CameraController
        selectedNodePos={selectedNodePos}
        selectedNodeScale={selectedScale}
        resetKey={resetKey}
        fov={fishEye}
        controlsRef={controlsRef}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────
//  ExploreScene — composant principal
// ─────────────────────────────────────────────────────────

export interface ExploreSceneRef {
  getSelectedNode: () => OrganizationNodeApi | null;
}

interface ExploreSceneProps {
  nodes: OrganizationNodeApi[];
  /** Appelé quand l'utilisateur veut voir l'overlay */
  onOpenOverlay: (node: OrganizationNodeApi) => void;
  /** Appelé quand une planète est sélectionnée (1er clic) */
  onSelectNode: (node: OrganizationNodeApi | null) => void;
}

/**
 * ExploreScene V5 — Canvas fullscreen transparent, 6 types de planètes,
 * animation Fan Effect, physique interactive, contrôles caméra GSAP.
 * S'appuie sur PlanetsOptionsContext pour tous les paramètres.
 */
export function ExploreScene({ nodes, onOpenOverlay, onSelectNode }: ExploreSceneProps) {
  const opts = usePlanetsOptions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedIdRef = useRef<string | null>(null); // toujours synchrone, pas de stale closure
  const [selectedNodePos, setSelectedNodePos] = useState<THREE.Vector3 | null>(null);
  const controlsRef = useRef<{ target: THREE.Vector3; update: () => void } | null>(null);

  // Synchroniser la ref avec l'état
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

  const rootNode = useMemo(() => nodes.find((n) => n.type === "ROOT") ?? null, [nodes]);
  const orbitNodes = useMemo(() => nodes.filter((n) => n.type !== "ROOT"), [nodes]);

  const handlePlanetClick = useCallback(
    (node: OrganizationNodeApi) => {
      // Utilise la ref pour éviter le stale closure
      const currentSelectedId = selectedIdRef.current;

      // Si la planète est déjà sélectionnée → ouvrir l'overlay (2ème clic)
      if (currentSelectedId === node.id) {
        onOpenOverlay(node);
        return;
      }

      // Premier clic sur une nouvelle planète → zoom uniquement
      setSelectedId(node.id);
      selectedIdRef.current = node.id;
      opts.set("freezePlanets", true);
      onSelectNode(node);

      // Calculer la position pour la caméra
      if (node.type === "ROOT") {
        setSelectedNodePos(new THREE.Vector3(0, 0, 0));
      } else {
        const i = orbitNodes.findIndex((n) => n.id === node.id);
        const r = (node.orbit_radius ?? 3 + i * 1.5) * opts.orbitSpacing;
        const phase = node.orbit_phase ?? (i * 0.7);
        setSelectedNodePos(getOrbitPosition(phase, r, opts.orbitShape, opts.orbitRoundness));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onOpenOverlay, onSelectNode, opts, orbitNodes] // selectedId retiré → remplacé par ref
  );

  const handleReset = useCallback(() => {
    setSelectedId(null);
    setSelectedNodePos(null);
    opts.set("freezePlanets", false);
    onSelectNode(null);
    opts.triggerReset();
  }, [opts, onSelectNode]);

  if (nodes.length === 0) return null;

  return (
    <Canvas
      camera={{ position: [0, 6.84, 18.79], fov: opts.fishEye }}
      gl={{ alpha: true, antialias: true }}
      shadows
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.5;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        gl.setClearColor(0x000000, 0);
      }}
      // Clic dans le vide → reset
      onClick={(e) => {
        if (e.object === undefined && selectedId) {
          handleReset();
        }
      }}
    >
      <SceneContent
        rootNode={rootNode}
        orbitNodes={orbitNodes}
        selectedId={selectedId}
        onPlanetClick={handlePlanetClick}
        showOrbits={opts.showOrbits}
        frozen={opts.freezePlanets}
        resetKey={opts.resetKey}
        restartKey={opts.restartKey}
        orbitSpacing={opts.orbitSpacing}
        orbitShape={opts.orbitShape}
        orbitRoundness={opts.orbitRoundness}
        globalShapeOverride={opts.globalShapeOverride}
        mouseForce={opts.mouseForce}
        collisionForce={opts.collisionForce}
        damping={opts.damping}
        returnForce={opts.returnForce}
        fishEye={opts.fishEye}
        entryStartX={opts.entryStartX}
        entryStartY={opts.entryStartY}
        entryStartZ={opts.entryStartZ}
        entrySpeed={opts.entrySpeed}
        controlsRef={controlsRef}
        selectedNodePos={selectedNodePos}
      />
    </Canvas>
  );
}
