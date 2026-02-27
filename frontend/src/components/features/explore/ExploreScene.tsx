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
import { useRouter } from "next/navigation";
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
  roundness: number,
  orbitY: number = 0
): THREE.Vector3 {
  if (shape === "squircle") {
    const [x, z] = getSquirclePosition(phase / (Math.PI * 2), radius, roundness);
    return new THREE.Vector3(x, orbitY, z);
  }
  return new THREE.Vector3(
    Math.cos(phase) * radius,
    orbitY,
    Math.sin(phase) * radius
  );
}

export function getDynamicOrbitParams(
  node: OrganizationNodeApi,
  i: number,
  total: number,
  autoDistribute: boolean,
  verticalMode: "manual" | "homogeneous" | "jupiter",
  orbitSpacing: number,
  verticalHomogeneousBase: number = 5,
  verticalHomogeneousStep: number = 20,
  verticalJupiterAmplitude: number = 30
): { r: number; y: number } {
  const r0 = autoDistribute ? 3 + i * 2.5 : (node.orbit_radius ?? 3 + i * 1.5);
  const r = r0 * orbitSpacing;

  let y = 0;
  if (verticalMode === "manual") {
    y = node.orbit_position_y || 0;
  } else if (verticalMode === "homogeneous") {
    const sign = i % 2 === 0 ? 1 : -1;
    const step = verticalHomogeneousStep / Math.max(1, Math.floor(total / 2));
    y = sign * (step * Math.floor(i / 2) + verticalHomogeneousBase);
  } else if (verticalMode === "jupiter") {
    const amplitude = verticalJupiterAmplitude * (1 - i / Math.max(1, total));
    const sign = i % 2 === 0 ? 1 : -1;
    y = sign * amplitude;
  }
  return { r, y };
}

// ─────────────────────────────────────────────────────────
//  Fonctions de trajectoire d'entrée
// ─────────────────────────────────────────────────────────

/**
 * Calcule la tangente unitaire à l'orbite en un point donné (phase).
 * Pour un cercle : tangente = (-sin(phase), 0, cos(phase))
 * Pour une squircle : dérivée numérique.
 */
function getOrbitTangent(
  phase: number,
  radius: number,
  shape: "circle" | "squircle",
  roundness: number
): THREE.Vector3 {
  if (shape === "circle") {
    return new THREE.Vector3(-Math.sin(phase), 0, Math.cos(phase)).normalize();
  }
  // Dérivée numérique pour la squircle
  const eps = 0.001;
  const p1 = getOrbitPosition(phase - eps, radius, shape, roundness);
  const p2 = getOrbitPosition(phase + eps, radius, shape, roundness);
  return p2.clone().sub(p1).normalize();
}

export type EntryTrajectory = "linear" | "arc" | "ellipse" | "scurve" | "spiral" | "corkscrew" | "wave" | "fan";
export type EasingType = "linear" | "easeIn" | "easeOut" | "easeInOut";

/**
 * Applique une courbe d'easing sur t ∈ [0..1].
 */
function applyEasing(t: number, easing: EasingType): number {
  const c = Math.max(0, Math.min(1, t));
  if (easing === "linear") return c;
  if (easing === "easeIn") return c * c * c;
  if (easing === "easeOut") return 1 - Math.pow(1 - c, 3);
  // easeInOut
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

/**
 * Retourne la position selon la trajectoire d'entrée.
 * @param t      Avancement normalisé [0..1] (0=départ, 1=cible)
 * @param start  Position de départ
 * @param end    Position d'arrivée (sur l'orbite)
 * @param index  Index de la planète (pour varier les trajectoires)
 */
function getEntryPosition(
  t: number,
  start: THREE.Vector3,
  end: THREE.Vector3,
  trajectory: EntryTrajectory,
  index: number
): THREE.Vector3 {
  // En mode "fan", le point de départ est déjà calé sur la tangente dans Planet ;
  // la trajectoire elle-même est un simple lerp linéaire.
  if (trajectory === "fan") {
    return start.clone().lerp(end, t);
  }

  if (trajectory === "linear") {
    return start.clone().lerp(end, t);
  }

  if (trajectory === "arc") {
    // Courbe bézier quadratique — point de contrôle perpendiculaire
    const mid = start.clone().lerp(end, 0.5);
    const perp = new THREE.Vector3(-(end.z - start.z), 0, end.x - start.x).normalize();
    const sign = index % 2 === 0 ? 1 : -1;
    const curveStrength = start.distanceTo(end) * 0.4;
    const ctrl = mid.clone().addScaledVector(perp, sign * curveStrength);
    // Bézier quadratique : (1-t)²·P0 + 2(1-t)t·P1 + t²·P2
    const it = 1 - t;
    return new THREE.Vector3(
      it * it * start.x + 2 * it * t * ctrl.x + t * t * end.x,
      it * it * start.y + 2 * it * t * ctrl.y + t * t * end.y,
      it * it * start.z + 2 * it * t * ctrl.z + t * t * end.z,
    );
  }

  if (trajectory === "ellipse") {
    // Demi-ellipse : montée verticale en arc de cercle (θ de π à 0)
    const dist = start.distanceTo(end);
    const height = dist * 0.5; // hauteur max du sommet de l'ellipse
    const angle = Math.PI * (1 - t); // commence à angle=π (top), finit à 0
    // interpolation horizontale linéaire + offset vertical elliptique
    const base = start.clone().lerp(end, t);
    base.y += Math.sin(angle) * height;
    return base;
  }

  if (trajectory === "scurve") {
    // Courbe en S : bezier cubique avec 2 points de contrôle opposés
    const dist = start.distanceTo(end);
    const perp = new THREE.Vector3(-(end.z - start.z), 0, end.x - start.x).normalize();
    const sign = index % 2 === 0 ? 1 : -1;
    const strength = dist * 0.45;
    // P0=start, P1=ctrl1 (1/3), P2=ctrl2 (2/3), P3=end
    const ctrl1 = start.clone().lerp(end, 0.33).addScaledVector(perp, sign * strength);
    const ctrl2 = start.clone().lerp(end, 0.67).addScaledVector(perp, -sign * strength);
    // Bézier cubique
    const it = 1 - t;
    return new THREE.Vector3(
      it * it * it * start.x + 3 * it * it * t * ctrl1.x + 3 * it * t * t * ctrl2.x + t * t * t * end.x,
      it * it * it * start.y + 3 * it * it * t * ctrl1.y + 3 * it * t * t * ctrl2.y + t * t * t * end.y,
      it * it * it * start.z + 3 * it * it * t * ctrl1.z + 3 * it * t * t * ctrl2.z + t * t * t * end.z,
    );
  }

  if (trajectory === "wave") {
    // Vague : oscillation latérale horizontale qui s'amortit à l'arrivée
    const base = start.clone().lerp(end, t);
    const dist = start.distanceTo(end);
    const freq = 2.5;
    const amplitude = dist * 0.2 * (1 - t); // amorti vers 0
    const dir = end.clone().sub(start).normalize();
    const perp = new THREE.Vector3(-dir.z, 0, dir.x);
    const sign = index % 2 === 0 ? 1 : -1;
    base.addScaledVector(perp, Math.sin(t * freq * Math.PI * 2) * amplitude * sign);
    return base;
  }

  if (trajectory === "spiral") {
    // Spirale : la planète tourne autour de l'axe Y en avançant vers la cible
    const base = start.clone().lerp(end, t);
    const dist = start.distanceTo(end);
    // Nombre de tours diminue vers la fin pour s'aligner proprement
    const turns = 1.5 * (1 - t);
    const phase = turns * Math.PI * 2;
    const radius = dist * 0.3 * (1 - t);
    // Vecteur perpendiculaire dans le plan XZ
    const dir = end.clone().sub(start).normalize();
    const perp = new THREE.Vector3(-dir.z, 0, dir.x);
    const up = new THREE.Vector3(0, 1, 0);
    base.addScaledVector(perp, Math.cos(phase) * radius);
    base.addScaledVector(up, Math.sin(phase) * radius * 0.5);
    return base;
  }

  if (trajectory === "corkscrew") {
    // Tire-bouchon : oscillation hélicoïdale Y qui s'amortit en arrivant
    const base = start.clone().lerp(end, t);
    const dist = start.distanceTo(end);
    const freq = 3; // nombre de spires
    const amplitude = dist * 0.25 * (1 - t); // s'amortit vers 0
    const phase = t * freq * Math.PI * 2;
    const dir = end.clone().sub(start).normalize();
    const perp = new THREE.Vector3(-dir.z, 0, dir.x);
    const up = new THREE.Vector3(0, 1, 0);
    base.addScaledVector(perp, Math.cos(phase) * amplitude);
    base.addScaledVector(up, Math.sin(phase) * amplitude);
    return base;
  }

  return start.clone().lerp(end, t);
}

// ─────────────────────────────────────────────────────────
//  Orbit ring
// ─────────────────────────────────────────────────────────

function OrbitRing({
  radius,
  shape,
  roundness,
  orbitY = 0,
}: {
  radius: number;
  shape: "circle" | "squircle";
  roundness: number;
  orbitY?: number;
}) {
  const points = useMemo<[number, number, number][]>(() => {
    const pts: [number, number, number][] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const phase = t * Math.PI * 2;
      if (shape === "squircle") {
        const [x, z] = getSquirclePosition(t, radius, roundness);
        pts.push([x, orbitY, z]);
      } else {
        pts.push([Math.cos(phase) * radius, orbitY, Math.sin(phase) * radius]);
      }
    }
    return pts;
  }, [radius, shape, roundness, orbitY]);

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
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.8} />
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
  phase: number;           // phase orbitale courante
  vel: THREE.Vector3;      // vitesse physique
  hasEnteredOrbit: boolean;
}

interface PlanetProps {
  node: OrganizationNodeApi;
  index: number;
  orbitRadius: number;
  orbitY: number;
  orbitShape: "circle" | "squircle";
  orbitRoundness: number;
  globalPlanetScale: number;
  frozen: boolean;
  entryStartX: number;
  entryStartY: number;
  entryStartZ: number | null;
  // ── Cinématique Entrée ──
  entrySpeedStart: number;
  entrySpeedEnd: number;
  entryEasing: EasingType;
  entryDuration: number;       // 0 = automatique (basé sur la distance)
  entryTrajectory: EntryTrajectory;
  /** Distance de départ pour le mode éventail (fan), en unités-monde */
  fanDistance: number;
  // ── Cinématique Orbite ──
  orbitSpeedStart: number;
  orbitSpeedTarget: number;
  orbitEasing: EasingType;
  orbitalRampDuration: number;
  // misc
  entryDelay: number;          // ms
  restartKey: number;
  mousePos: MutableRefObject<THREE.Vector3>;
  mouseForce: number;
  collisionForce: number;
  damping: number;
  returnForce: number;
  allPlanetPositions: MutableRefObject<Map<string, THREE.Vector3>>;
  onPositionUpdate?: (id: string, pos: THREE.Vector3) => void;
  onClick: () => void;
  onDoubleClick?: () => void;
  onHover: (v: boolean) => void;
  isHovered: boolean;
  isSelected: boolean;
  showEntryTrajectory: boolean;
  speedMultiplierRef: React.MutableRefObject<number>;
}

function Planet({
  node,
  index,
  orbitRadius,
  orbitY,
  orbitShape,
  orbitRoundness,
  globalPlanetScale,
  frozen,
  entryStartX,
  entryStartY,
  entryStartZ,
  entrySpeedStart,
  entrySpeedEnd,
  entryEasing,
  entryDuration,
  entryTrajectory,
  fanDistance,
  orbitSpeedStart,
  orbitSpeedTarget,
  orbitEasing,
  orbitalRampDuration,
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
  onDoubleClick,
  onHover,
  isHovered,
  isSelected,
  showEntryTrajectory,
  speedMultiplierRef,
}: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const startTime = useRef<number | null>(null);       // temps (ms) après délai
  const entryElapsed = useRef<number>(0);               // temps écoulé depuis début de l'entrée (s)
  const stateRef = useRef<PlanetState>({
    phase: node.orbit_phase ?? (index * 0.7),
    vel: new THREE.Vector3(),
    hasEnteredOrbit: false,
  });
  const orbitEntryTime = useRef<number | null>(null);
  const entryFinalSpeed = useRef<number>(0);            // vitesse linéaire réelle à l'arrivée
  const totalEntryDistance = useRef<number>(0);
  const entryStartPos = useRef<THREE.Vector3 | null>(null);
  const hasDelayPassed = useRef(false);
  const entryTParam = useRef<number>(0);               // paramètre t [0..1] pour les trajectoires

  // Réinitialiser l'animation d'entrée au restart
  useEffect(() => {
    stateRef.current = {
      phase: node.orbit_phase ?? (index * 0.7),
      vel: new THREE.Vector3(),
      hasEnteredOrbit: false,
    };
    startTime.current = null;
    orbitEntryTime.current = null;
    hasDelayPassed.current = false;
    entryStartPos.current = null;
    entryElapsed.current = 0;
    entryTParam.current = 0;
    entryFinalSpeed.current = 0;
  }, [restartKey, node.orbit_phase, index]);

  const scale = (node.planet_scale ?? 0.6) * globalPlanetScale;
  const color = hexToColor(node.planet_color || "#a855f7");

  const { targetOrbitPos, targetOrbitPhase, fanStartPos } = useMemo(() => {
    // ── Mode éventail : phase déterminée par index (répartition uniforme sur l'orbite)
    let bestPhase: number;
    if (entryTrajectory === "fan") {
      // On répartit les planètes uniformément sur l'orbite en mode fan
      bestPhase = (index / Math.max(1, 8)) * Math.PI * 2; // 8 positions max sur un tour
    } else {
      const startVec = new THREE.Vector3(entryStartX, entryStartY, entryStartZ ?? orbitRadius);
      bestPhase = 0;
      let bestDist = Infinity;
      const STEPS = 128;
      for (let k = 0; k < STEPS; k++) {
        const testPhase = (k / STEPS) * Math.PI * 2;
        const tPos = getOrbitPosition(testPhase, orbitRadius, orbitShape, orbitRoundness, orbitY);
        const dist = tPos.distanceTo(startVec);
        if (dist < bestDist) {
          bestDist = dist;
          bestPhase = testPhase;
        }
      }
    }
    const finalPos = getOrbitPosition(bestPhase, orbitRadius, orbitShape, orbitRoundness, orbitY);

    // Calcul du point de départ en mode fan :
    // On part dans la direction opposée à la tangente de l'orbite au point d'arrivée
    let fanStart: THREE.Vector3 | null = null;
    if (entryTrajectory === "fan") {
      const tangent = getOrbitTangent(bestPhase, orbitRadius, orbitShape, orbitRoundness);
      // Départ = point d'arrivée - distance * tangente (on arrive « depuis » la direction tangente)
      fanStart = finalPos.clone().addScaledVector(tangent, -fanDistance);
      fanStart.y = entryStartY; // on garde le Y configuré
    }

    return {
      targetOrbitPos: finalPos,
      targetOrbitPhase: bestPhase,
      fanStartPos: fanStart,
    };
  }, [entryTrajectory, entryStartX, entryStartY, entryStartZ, orbitRadius, orbitY, orbitShape, orbitRoundness, index, fanDistance]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.033);
    const s = stateRef.current;

    // Délai d'entrée échelonné
    if (!hasDelayPassed.current) {
      if (startTime.current === null) {
        startTime.current = state.clock.elapsedTime * 1000;
        // En mode fan, le point de départ est calé sur la tangente
        entryStartPos.current = fanStartPos
          ? fanStartPos.clone()
          : new THREE.Vector3(entryStartX, entryStartY, entryStartZ ?? orbitRadius);
        totalEntryDistance.current = entryStartPos.current.distanceTo(targetOrbitPos);
      }
      const elapsed = state.clock.elapsedTime * 1000 - startTime.current;
      if (elapsed < entryDelay) {
        groupRef.current.position.set(entryStartX, entryStartY, entryStartZ ?? orbitRadius);
        return;
      }
      hasDelayPassed.current = true;
    }

    if (!s.hasEnteredOrbit) {
      // ── Phase 1 : animation d'entrée ──
      entryElapsed.current += dt;
      const start = entryStartPos.current ?? new THREE.Vector3(entryStartX, entryStartY, entryStartZ ?? orbitRadius);

      // Paramètre t normalisé [0..1] selon la durée ou la distance
      let tNorm: number;
      if (entryDuration > 0) {
        // Durée fixée manuellement
        tNorm = Math.min(entryElapsed.current / entryDuration, 1);
      } else {
        // Durée automatique : vitesse interpolée * distance
        // On avance t en utilisant la vitesse instantanée courante
        const easedT = applyEasing(entryTParam.current, entryEasing);
        const currentSpeed = entrySpeedStart + (entrySpeedEnd - entrySpeedStart) * easedT;
        const distTotal = totalEntryDistance.current;
        const step = currentSpeed * dt;
        if (distTotal > 0) {
          entryTParam.current = Math.min(entryTParam.current + step / distTotal, 1);
        } else {
          entryTParam.current = 1;
        }
        tNorm = entryTParam.current;
      }

      // Position via la courbe d'easing sur t
      const tEased = entryDuration > 0 ? applyEasing(tNorm, entryEasing) : tNorm;
      const newPos = getEntryPosition(tEased, start, targetOrbitPos, entryTrajectory, index);
      groupRef.current.position.copy(newPos);

      // Vitesse en fin d'entrée (pour raccord orbital)
      const lastEased = applyEasing(Math.max(0, tNorm - 0.01), entryEasing);
      entryFinalSpeed.current = entrySpeedStart + (entrySpeedEnd - entrySpeedStart) * lastEased;

      if (tNorm >= 1) {
        s.hasEnteredOrbit = true;
        s.phase = targetOrbitPhase;
        orbitEntryTime.current = state.clock.elapsedTime;
        groupRef.current.position.copy(targetOrbitPos);
      }
      return;
    }

    // ── Phase 2 : orbite + physique ──
    // Conversion u/s → rad/s : ω = v / r
    const toAngular = orbitRadius > 0 ? 1 / orbitRadius : 1;
    const nominalAngularSpeed = orbitSpeedTarget * toAngular;

    if (!frozen) {
      let currentAngularSpeed = nominalAngularSpeed;
      if (orbitalRampDuration > 0 && orbitEntryTime.current !== null) {
        const timeSinceOrbit = state.clock.elapsedTime - orbitEntryTime.current;
        if (timeSinceOrbit < orbitalRampDuration) {
          const rawT = timeSinceOrbit / orbitalRampDuration;
          const easedT = applyEasing(rawT, orbitEasing);
          // Vitesse angulaire de départ (u/s → rad/s)
          const startAngular = orbitSpeedStart > 0
            ? orbitSpeedStart * toAngular
            : (orbitRadius > 0 ? entryFinalSpeed.current / orbitRadius : nominalAngularSpeed);
          currentAngularSpeed = startAngular + (nominalAngularSpeed - startAngular) * easedT;
        }
      }
      s.phase += currentAngularSpeed * speedMultiplierRef.current * dt;
    }

    // Position nominale sur l'orbite (déterministe, forme respectée)
    const nominalPos = getOrbitPosition(s.phase, orbitRadius, orbitShape, orbitRoundness, orbitY);

    // Force souris (répulsion) — perturbation temporaire via vélocité
    if (mouseForce > 0) {
      const MOUSE_RADIUS = 5;
      const toMouse = nominalPos.clone().sub(mousePos.current);
      toMouse.y = 0;
      const dist = toMouse.length();
      if (dist < MOUSE_RADIUS && dist > 0.01) {
        const strength = (1 - dist / MOUSE_RADIUS) * mouseForce * 2;
        s.vel.add(toMouse.normalize().multiplyScalar(strength * dt));
      }
    }

    // Force collision inter-planètes
    if (collisionForce > 0) {
      const currentPos = groupRef.current.position.clone();
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

    // Amortissement de la vélocité de perturbation
    s.vel.multiplyScalar(damping);

    // Position finale = orbite nominale + perturbation amortie
    // La perturbation s'amortit naturellement vers 0, donc la planète
    // revient toujours sur l'orbite sans springForce explicite
    const newPos = nominalPos.clone().add(s.vel);
    groupRef.current.position.copy(newPos);

    // Mettre à jour le registre des positions
    if (onPositionUpdate) {
      onPositionUpdate(node.id, newPos.clone());
    }
  });

  const displayScale = isHovered || isSelected ? scale * 1.15 : scale;
  const visualSource = node.visual_source || "preset";
  const planetType = node.planet_type || "glass";

  // En mode fan, la position initiale du groupe est sur le point de départ tangentiel
  const entryPoint: [number, number, number] = fanStartPos
    ? [fanStartPos.x, fanStartPos.y, fanStartPos.z]
    : [entryStartX, entryStartY, entryStartZ ?? orbitRadius];
  const targetOrbitPosArray = useMemo(() => {
    return [targetOrbitPos.x, targetOrbitPos.y, targetOrbitPos.z] as [number, number, number];
  }, [targetOrbitPos]);

  return (
    <group
      ref={groupRef}
      position={entryPoint}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; onHover(true); }}
      onPointerOut={() => { document.body.style.cursor = "default"; onHover(false); }}
    >
      {/* Trajectoire d'arrivée (de entryStart vers l'orbite) */}
      {showEntryTrajectory && !stateRef.current.hasEnteredOrbit && (
        <Line
          points={[entryPoint, targetOrbitPosArray]}
          color="#a855f7"
          opacity={0.25}
          transparent
          lineWidth={1}
          dashed
          dashSize={0.5}
          gapSize={0.3}
        />
      )}
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
      <LabelSprite text={node.name} offsetY={displayScale + 1.2} />
    </group>
  );
}

// ─────────────────────────────────────────────────────────
//  Label sprite (billboard via CanvasTexture)
// ─────────────────────────────────────────────────────────

function LabelSprite({
  text,
  offsetY,
}: {
  text: string;
  offsetY: number;
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

  return (
    <sprite ref={spriteRef} position={[0, offsetY, 0]}>
      <spriteMaterial map={texture} transparent depthTest={false} />
    </sprite>
  );
}

// ─────────────────────────────────────────────────────────
//  Soleil central (nœud ROOT)
// ─────────────────────────────────────────────────────────

interface SunProps {
  node: OrganizationNodeApi;
  frozen: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
  isSelected: boolean;
  isHovered: boolean;
  globalPlanetScale: number;
  onHover: (v: boolean) => void;
  speedMultiplierRef: React.MutableRefObject<number>;
}

function Sun({
  node,
  frozen,
  onClick,
  onDoubleClick,
  isSelected,
  isHovered,
  onHover,
  globalPlanetScale,
  speedMultiplierRef,
}: SunProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = hexToColor(node.planet_color || "#fbbf24");
  const scale = Math.max(node.planet_scale ?? 1.2, 1) * globalPlanetScale;

  useFrame((_, delta) => {
    if (!meshRef.current || frozen) return;
    meshRef.current.rotation.y += delta * 0.15 * speedMultiplierRef.current;
  });

  const displayScale = isHovered || isSelected ? scale * 1.1 : scale;

  return (
    <group
      position={[0, 0, 0]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick?.(); }}
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
      <LabelSprite text={node.name} offsetY={displayScale + 1.5} />
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
    console.log("CameraController useEffect check:", {
      hasSelectedNodePos: !!selectedNodePos,
      selectedNodePosTarget: selectedNodePos,
      hasControlsRef: !!controlsRef,
      controlsRefCurrent: controlsRef?.current
    });
    if (!selectedNodePos || !controlsRef.current) return;
    if (prevSelectedPos.current?.equals(selectedNodePos)) return;
    prevSelectedPos.current = selectedNodePos.clone();

    const offset = 8 + (selectedNodeScale * 2);
    // Quand on sélectionne une planète, on l'approche
    // Le zoom va se placer juste devant la planète.
    const targetX = selectedNodePos.x;
    const targetY = selectedNodePos.y;
    const targetZ = selectedNodePos.z;
    console.log("CameraController received targetPos:", { x: targetX, y: targetY, z: targetZ });

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
  // ── Cinématique Entrée ──
  entrySpeedStart: number;
  entrySpeedEnd: number;
  entryEasing: EasingType;
  entryDuration: number;
  entryTrajectory: EntryTrajectory;
  /** Distance de départ pour le mode éventail (fan) */
  fanDistance: number;
  // ── Cinématique Orbite ──
  orbitSpeedStart: number;
  orbitSpeedTarget: number;
  orbitEasing: EasingType;
  orbitalRampDuration: number;
  controlsRef: React.RefObject<{ target: THREE.Vector3; update: () => void } | null>;
  selectedNodePos: THREE.Vector3 | null;
  showEntryTrajectory: boolean;
  verticalMode: "manual" | "homogeneous" | "jupiter";
  autoDistributeOrbits: boolean;
  globalPlanetScale: number;
  hoverOrbitSpeedRatio: number;
  hoverPlanetSpeedRatio: number;
  hoverOrbitTransitionSpeed: number;
  hoverPlanetTransitionSpeed: number;
  verticalHomogeneousBase: number;
  verticalHomogeneousStep: number;
  verticalJupiterAmplitude: number;
  allPositions?: React.MutableRefObject<Map<string, THREE.Vector3>>;
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
  entrySpeedStart,
  entrySpeedEnd,
  entryEasing,
  entryDuration,
  entryTrajectory,
  fanDistance,
  orbitSpeedStart,
  orbitSpeedTarget,
  orbitEasing,
  orbitalRampDuration,
  controlsRef,
  selectedNodePos,
  showEntryTrajectory,
  verticalMode,
  autoDistributeOrbits,
  globalPlanetScale,
  hoverOrbitSpeedRatio,
  hoverPlanetSpeedRatio,
  hoverOrbitTransitionSpeed,
  hoverPlanetTransitionSpeed,
  verticalHomogeneousBase,
  verticalHomogeneousStep,
  verticalJupiterAmplitude,
  allPositions: externalAllPositions,
}: SceneContentProps) {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const mousePosRef = useRef(new THREE.Vector3());
  const localAllPositions = useRef<Map<string, THREE.Vector3>>(new Map());
  const allPositions = externalAllPositions || localAllPositions;

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

      // Enregistrer le raycaster directement, car on veut évaluer 
      // la distance aux planètes en 3D volumétrique
      mousePosRef.current.copy(raycaster.ray.direction);
      // On stocke origin dans le x,y,z d'un attribut custom ou on garde juste le NDc pour refaire le raycast côté frame
    };
    canvas.addEventListener("mousemove", handleMove);
    return () => canvas.removeEventListener("mousemove", handleMove);
  }, [camera, gl]);

  const pointerNDC = useRef(new THREE.Vector2());
  useEffect(() => {
    const canvas = gl.domElement;
    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerNDC.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    canvas.addEventListener("mousemove", handleMove);
    return () => canvas.removeEventListener("mousemove", handleMove);
  }, [gl]);

  // Vitesse globale (ralentit au survol des orbites et s'arrête si planète pointée)
  const speedMultiplierRef = useRef(1);
  const raycasterRef = useRef(new THREE.Raycaster());

  useFrame((state, delta) => {
    // Reconstruire le rayon depuis le dernier NDC pointé
    raycasterRef.current.setFromCamera(pointerNDC.current, state.camera);
    const ray = raycasterRef.current.ray;

    let inOrbitZone = false;

    // Déterminer la distance max (rayon + marge)
    let maxR = 0;
    if (orbitNodes.length > 0) {
      maxR = getDynamicOrbitParams(orbitNodes[orbitNodes.length - 1], orbitNodes.length - 1, orbitNodes.length, autoDistributeOrbits, verticalMode, orbitSpacing, verticalHomogeneousBase, verticalHomogeneousStep, verticalJupiterAmplitude).r;
    }

    // Le centre du système est à [0,0,0]. 
    // On trouve approximativement la distance la plus courte entre le rayon (écran) et l'origine (système central)
    const distanceToOrigin = ray.distanceToPoint(new THREE.Vector3(0, 0, 0));

    // Si le pointeur vise à l'intérieur du disque global d'orbites
    if (distanceToOrigin <= maxR + 5 && distanceToOrigin >= 0.1) {
      // On vérifie que la hauteur du rayon (Y) lorsqu'il "croise" l'orbite 
      // est à l'intérieur de l'amplitude verticale maximale des planètes

      // Calcul de l'amplitude max Y
      let maxY = 5; // valeur par défaut minimale
      if (verticalMode === "homogeneous") {
        const step = verticalHomogeneousStep / Math.max(1, Math.floor(orbitNodes.length / 2));
        maxY = (step * Math.floor(orbitNodes.length / 2) + verticalHomogeneousBase);
      } else if (verticalMode === "jupiter") {
        maxY = verticalJupiterAmplitude;
      } else if (verticalMode === "manual") {
        maxY = Math.max(...orbitNodes.map(n => Math.abs(n.orbit_position_y || 0)), 5);
      }

      // Le point le plus proche entre le rayon et l'axe (0,y,0)
      // Pour simplifier, on trouve le point du rayon le plus près de l'origine
      const pointCible = new THREE.Vector3();
      ray.closestPointToPoint(new THREE.Vector3(0, 0, 0), pointCible);

      // On se donne une large marge verticale tolérée (hauteur des orbites + 30 visuellement)
      if (Math.abs(pointCible.y) <= maxY + 15) {
        inOrbitZone = true;
      }
    }

    // Si une planète est pointée -> multiplier = hoverPlanetSpeedRatio
    // Si zone d'orbite survolée -> multiplier = hoverOrbitSpeedRatio
    // Sinon -> multiplier = 1.0
    const targetMultiplier = hoveredId !== null ? hoverPlanetSpeedRatio : (inOrbitZone ? hoverOrbitSpeedRatio : 1.0);
    const lerpSpeed = hoveredId !== null ? hoverPlanetTransitionSpeed : hoverOrbitTransitionSpeed;
    speedMultiplierRef.current = THREE.MathUtils.lerp(speedMultiplierRef.current, targetMultiplier, delta * lerpSpeed);
  });

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
        orbitNodes.map((node, i) => {
          const { r, y } = getDynamicOrbitParams(node, i, orbitNodes.length, autoDistributeOrbits, verticalMode, orbitSpacing, verticalHomogeneousBase, verticalHomogeneousStep, verticalJupiterAmplitude);
          const shape = globalShapeOverride ? globalShape : ((node.orbit_shape as "circle" | "squircle") || "circle");
          const roundness = globalShapeOverride ? globalRoundness : (node.orbit_roundness ?? 0.6);
          return (
            <OrbitRing key={`orbit-${node.id}`} radius={r} shape={shape} roundness={roundness} orbitY={y} />
          );
        })}

      {/* Soleil ROOT */}
      {rootNode && (
        <Sun
          node={rootNode}
          frozen={frozen}
          globalPlanetScale={globalPlanetScale}
          onClick={() => onPlanetClick(rootNode)}
          onDoubleClick={() => {
            if (rootNode.cta_url) router.push(rootNode.cta_url);
            else router.push(`/${rootNode.slug}`);
          }}
          isSelected={selectedId === rootNode.id}
          isHovered={hoveredId === rootNode.id}
          onHover={(v) => setHoveredId(v ? rootNode.id : null)}
          speedMultiplierRef={speedMultiplierRef}
        />
      )}

      {/* Planètes */}
      {orbitNodes.map((node, i) => {
        const { r, y } = getDynamicOrbitParams(node, i, orbitNodes.length, autoDistributeOrbits, verticalMode, orbitSpacing, verticalHomogeneousBase, verticalHomogeneousStep, verticalJupiterAmplitude);
        const shape = globalShapeOverride ? globalShape : ((node.orbit_shape as "circle" | "squircle") || "circle");
        const roundness = globalShapeOverride ? globalRoundness : (node.orbit_roundness ?? 0.6);
        return (
          <Planet
            key={`${node.id}-${restartKey}`}
            node={node}
            index={i}
            orbitRadius={r}
            orbitY={y}
            orbitShape={shape}
            orbitRoundness={roundness}
            globalPlanetScale={globalPlanetScale}
            frozen={frozen}
            entryStartX={entryStartX}
            entryStartY={entryStartY}
            entryStartZ={entryStartZ}
            entrySpeedStart={entrySpeedStart}
            entrySpeedEnd={entrySpeedEnd}
            entryEasing={entryEasing}
            entryDuration={entryDuration}
            entryTrajectory={entryTrajectory}
            fanDistance={fanDistance}
            orbitSpeedStart={orbitSpeedStart}
            orbitSpeedTarget={orbitSpeedTarget}
            orbitEasing={orbitEasing}
            orbitalRampDuration={orbitalRampDuration}
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
            onDoubleClick={() => {
              if (node.cta_url) router.push(node.cta_url);
              else router.push(`/${node.slug}`);
            }}
            onHover={(v) => setHoveredId(v ? node.id : null)}
            isHovered={hoveredId === node.id}
            isSelected={selectedId === node.id}
            showEntryTrajectory={showEntryTrajectory}
            speedMultiplierRef={speedMultiplierRef}
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
  controlsRef?: React.MutableRefObject<any>;
  cameraRef?: React.MutableRefObject<any>;
}

/**
 * ExploreScene V5 — Canvas fullscreen transparent, 6 types de planètes,
 * animation Fan Effect, physique interactive, contrôles caméra GSAP.
 * S'appuie sur PlanetsOptionsContext pour tous les paramètres.
 */
export function ExploreScene({ nodes, onOpenOverlay, onSelectNode, controlsRef: externalControlsRef, cameraRef }: ExploreSceneProps) {
  const opts = usePlanetsOptions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedIdRef = useRef<string | null>(null); // toujours synchrone, pas de stale closure
  const [selectedNodePos, setSelectedNodePos] = useState<THREE.Vector3 | null>(null);
  const localControlsRef = useRef<{ target: THREE.Vector3; update: () => void } | null>(null);
  const controlsRef = externalControlsRef || localControlsRef;
  const allPositions = useRef<Map<string, THREE.Vector3>>(new Map());

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
        console.log("Zooming to ROOT");
        setSelectedNodePos(new THREE.Vector3(0, 0, 0));
      } else {
        const currentPos = allPositions.current.get(node.id);
        if (currentPos) {
          console.log(`Zooming to planet LIVE POS: ${node.name}`, currentPos);
          setSelectedNodePos(currentPos.clone());
        } else {
          const i = orbitNodes.findIndex((n) => n.id === node.id);
          const { r, y } = getDynamicOrbitParams(node, i, orbitNodes.length, opts.autoDistributeOrbits, opts.verticalMode, opts.orbitSpacing);
          const phase = node.orbit_phase ?? (i * 0.7);
          const fbPos = getOrbitPosition(phase, r, opts.globalShapeOverride ? opts.orbitShape : ((node.orbit_shape as any) || "circle"), opts.globalShapeOverride ? opts.orbitRoundness : (node.orbit_roundness ?? 0.6), y);
          console.log(`Zooming to planet FALLBACK POS: ${node.name}`, fbPos);
          setSelectedNodePos(fbPos);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onOpenOverlay, onSelectNode, opts, orbitNodes] // selectedId retiré → remplacé par ref
  );

  const handleReset = useCallback(() => {
    console.log("handleReset triggered, resetting camera to origin");
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
      onCreated={({ gl, camera }) => {
        if (cameraRef) cameraRef.current = camera;
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.5;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        gl.setClearColor(0x000000, 0);
      }}
      // Clic dans le vide → reset
      onPointerMissed={() => {
        if (selectedId) handleReset();
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
        entryTrajectory={opts.entryTrajectory as EntryTrajectory}
        fanDistance={opts.fanDistance ?? 30}
        entrySpeedStart={opts.entrySpeedStart}
        entrySpeedEnd={opts.entrySpeedEnd}
        entryEasing={opts.entryEasing}
        entryDuration={opts.entryDuration}
        orbitSpeedStart={opts.orbitSpeedStart}
        orbitSpeedTarget={opts.orbitSpeedTarget}
        orbitEasing={opts.orbitEasing}
        orbitalRampDuration={opts.orbitalRampDuration}
        controlsRef={controlsRef}
        selectedNodePos={selectedNodePos}
        showEntryTrajectory={opts.showEntryTrajectory}
        verticalMode={opts.verticalMode}
        autoDistributeOrbits={opts.autoDistributeOrbits}
        globalPlanetScale={opts.globalPlanetScale}
        hoverOrbitSpeedRatio={opts.hoverOrbitSpeedRatio}
        hoverPlanetSpeedRatio={opts.hoverPlanetSpeedRatio}
        hoverOrbitTransitionSpeed={opts.hoverOrbitTransitionSpeed}
        hoverPlanetTransitionSpeed={opts.hoverPlanetTransitionSpeed}
        verticalHomogeneousBase={opts.verticalHomogeneousBase}
        verticalHomogeneousStep={opts.verticalHomogeneousStep}
        verticalJupiterAmplitude={opts.verticalJupiterAmplitude}
        allPositions={allPositions}
      />
    </Canvas>
  );
}
