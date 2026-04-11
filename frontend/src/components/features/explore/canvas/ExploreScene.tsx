"use client";

import {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
  useDeferredValue,
  type MutableRefObject,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import type { OrganizationNodeApi } from "@/types/organization";
import { usePlanetsOptions } from "@/contexts/PlanetsOptionsContext";
import { DynamicPlanet, type PlanetType } from "./planets";

// ─────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────

function hexToColor(hex: string): THREE.Color {
  const h = hex?.startsWith("#") ? hex : `#${hex ?? "a855f7"}`;
  return new THREE.Color(h || "#a855f7");
}

/** Téléphone / tablette tactile : libellés planètes plus grands et lisibles. */
function useCompactPlanetLabels(): boolean {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const read = () => {
      if (typeof window === "undefined") return false;
      const narrow = window.matchMedia("(max-width: 768px)").matches;
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      return narrow || coarse;
    };
    setCompact(read());
    const mqNarrow = window.matchMedia("(max-width: 768px)");
    const mqCoarse = window.matchMedia("(pointer: coarse)");
    const onChange = () => setCompact(mqNarrow.matches || mqCoarse.matches);
    mqNarrow.addEventListener("change", onChange);
    mqCoarse.addEventListener("change", onChange);
    return () => {
      mqNarrow.removeEventListener("change", onChange);
      mqCoarse.removeEventListener("change", onChange);
    };
  }, []);
  return compact;
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
  orbitY: number = 0,
  verticalMode: string = "manual",
  verticalSphereRadius: number = 30,
  index: number = 0,
  totalNodes: number = 1
): THREE.Vector3 {
  if (verticalMode === "sphere") {
    // Répartition homogène via Sphère de Fibonacci
    const phi = Math.acos(1 - 2 * (index + 0.5) / Math.max(1, totalNodes));
    const theta = Math.PI * (1 + Math.sqrt(5)) * index;
    // La phase globale permet de faire tourner toute la sphère autour de l'axe Y
    return new THREE.Vector3(
      verticalSphereRadius * Math.sin(phi) * Math.cos(theta + phase),
      verticalSphereRadius * Math.cos(phi),
      verticalSphereRadius * Math.sin(phi) * Math.sin(theta + phase)
    );
  }

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
  verticalMode: "manual" | "homogeneous" | "jupiter" | "sphere",
  orbitSpacing: number,
  verticalHomogeneousBase: number = 5,
  verticalHomogeneousStep: number = 20,
  verticalJupiterAmplitude: number = 30,
  verticalSphereRadius: number = 30
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
  } else if (verticalMode === "sphere") {
    // La hauteur individuelle d'orbite n'est plus utilisée, c'est géré globalement
    y = 0;
  }
  return { r, y };
}

/** Multiplicateur max appliqué aux planètes sur la plus grande orbite (compense la perspective). */
const REMOTE_ORBIT_SCALE_MAX = 1.38;

/** Distance caméra–libellé de référence (monde) pour l’échelle des titres sur mobile. */
const LABEL_DISTANCE_REF = 13;
const LABEL_DISTANCE_BOOST_MAX_COMPACT = 2.9;

const _labelWorldScratch = new THREE.Vector3();

/**
 * Distance horizontale max (dans XZ) depuis l'origine jusqu'à une orbite :
 * cercle → r ; squircle → max sur un tour (coins plus loin que r).
 * + marge pour le mesh des planètes. Utilisé pour le disque « zone » et le test de survol.
 */
function computeCircumOrbitRadius(
  orbitNodes: OrganizationNodeApi[],
  verticalMode: "manual" | "homogeneous" | "jupiter" | "sphere",
  autoDistributeOrbits: boolean,
  orbitSpacing: number,
  verticalHomogeneousBase: number,
  verticalHomogeneousStep: number,
  verticalJupiterAmplitude: number,
  verticalSphereRadius: number,
  globalShapeOverride: boolean,
  globalShape: "circle" | "squircle",
  globalRoundness: number,
  globalPlanetScale: number
): number {
  const n = orbitNodes.length;
  if (n === 0) return 0;

  if (verticalMode === "sphere") {
    let maxPlanet = 0;
    for (const node of orbitNodes) {
      maxPlanet = Math.max(maxPlanet, (node.planet_scale ?? 0.8) * globalPlanetScale);
    }
    return verticalSphereRadius + maxPlanet + 2;
  }

  let maxExtent = 0;
  for (let i = 0; i < n; i++) {
    const node = orbitNodes[i];
    const { r } = getDynamicOrbitParams(
      node,
      i,
      n,
      autoDistributeOrbits,
      verticalMode,
      orbitSpacing,
      verticalHomogeneousBase,
      verticalHomogeneousStep,
      verticalJupiterAmplitude,
      verticalSphereRadius
    );
    const shape = globalShapeOverride
      ? globalShape
      : ((node.orbit_shape as "circle" | "squircle") || "circle");
    const roundness = globalShapeOverride ? globalRoundness : (node.orbit_roundness ?? 0.6);
    if (shape === "circle") {
      maxExtent = Math.max(maxExtent, r);
    } else {
      for (let seg = 0; seg <= 64; seg++) {
        const t = seg / 64;
        const [x, z] = getSquirclePosition(t, r, roundness);
        maxExtent = Math.max(maxExtent, Math.hypot(x, z));
      }
    }
  }

  const maxPlanetR = Math.max(
    ...orbitNodes.map((node) => (node.planet_scale ?? 0.8) * globalPlanetScale),
    0.4 * globalPlanetScale
  );
  return maxExtent + maxPlanetR + 3;
}

/** Intersection du rayon avec le plan y = planeY (repère monde). */
function rayIntersectPlaneY(ray: THREE.Ray, planeY: number): THREE.Vector3 | null {
  const dy = ray.direction.y;
  if (Math.abs(dy) < 1e-9) return null;
  const t = (planeY - ray.origin.y) / dy;
  if (t < 0) return null;
  return new THREE.Vector3().copy(ray.origin).addScaledVector(ray.direction, t);
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
  roundness: number,
  orbitY: number = 0,
  verticalMode: string = "manual",
  verticalSphereRadius: number = 30,
  index: number = 0,
  totalNodes: number = 1
): THREE.Vector3 {
  if (shape === "circle" && verticalMode !== "sphere") {
    return new THREE.Vector3(-Math.sin(phase), 0, Math.cos(phase)).normalize();
  }
  // Dérivée numérique pour la squircle et la sphère
  const eps = 0.001;
  const p1 = getOrbitPosition(phase - eps, radius, shape, roundness, orbitY, verticalMode, verticalSphereRadius, index, totalNodes);
  const p2 = getOrbitPosition(phase + eps, radius, shape, roundness, orbitY, verticalMode, verticalSphereRadius, index, totalNodes);
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
//  First Frame Detector (performance monitoring)
// ─────────────────────────────────────────────────────────

function FirstFrameDetector({ onFirstFrame }: { onFirstFrame?: () => void }) {
  const called = useRef(false);
  
  useFrame(() => {
    if (!called.current && onFirstFrame) {
      called.current = true;
      onFirstFrame();
    }
  });
  
  return null;
}

// ─────────────────────────────────────────────────────────
//  Orbit ring (memoized)
// ─────────────────────────────────────────────────────────

import { memo } from "react";

const OrbitRing = memo(function OrbitRing({
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
    const segments = 64;
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
});

/**
 * Zone de ralentissement : disque + anneau, circonscrit les orbites (rayon = orbitZoneRadiusRef).
 * depthTest désactivé pour rester visible au-dessus du fond vidéo / du terrain.
 */
function OrbitZoneIndicator({
  inOrbitZoneRef,
  orbitZoneRadiusRef,
  show,
  color,
  opacity,
}: {
  inOrbitZoneRef: React.MutableRefObject<boolean>;
  orbitZoneRadiusRef: React.MutableRefObject<number>;
  show: boolean;
  color: string;
  opacity: number;
}) {
  const fillRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const colorObj = hexToColor(color);
  const baseFillOpacity = Math.max(0.12, opacity * 0.5);
  const hoverFillOpacity = Math.max(0.22, opacity * 0.85);
  const baseRingOpacity = Math.min(1, Math.max(0.35, opacity * 1.1));
  const hoverRingOpacity = Math.min(1, Math.max(0.55, opacity * 1.35));
  useFrame(() => {
    if (!show) {
      if (fillRef.current) fillRef.current.visible = false;
      if (ringRef.current) ringRef.current.visible = false;
      return;
    }
    const R = orbitZoneRadiusRef.current;
    const vis = R > 0;
    const hover = inOrbitZoneRef.current;
    if (fillRef.current) {
      fillRef.current.visible = vis;
      fillRef.current.scale.setScalar(R);
      const mat = fillRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = hover ? hoverFillOpacity : baseFillOpacity;
    }
    if (ringRef.current) {
      ringRef.current.visible = vis;
      ringRef.current.scale.setScalar(R);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = hover ? hoverRingOpacity : baseRingOpacity;
    }
  });
  return (
    <group position={[0, 0.04, 0]}>
      <mesh ref={fillRef} rotation={[-Math.PI / 2, 0, 0]} visible={false} renderOrder={1000}>
        <circleGeometry args={[1, 96]} />
        <meshBasicMaterial
          transparent
          opacity={baseFillOpacity}
          color={colorObj}
          side={THREE.DoubleSide}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} visible={false} renderOrder={1001}>
        <ringGeometry args={[0.92, 1, 64]} />
        <meshBasicMaterial
          transparent
          opacity={baseRingOpacity}
          color={colorObj}
          side={THREE.DoubleSide}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────
//  Planet geometries - Code splitting via ./planets/
//  Les composants sont chargés dynamiquement via React.lazy()
// ─────────────────────────────────────────────────────────

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
  verticalMode: "manual" | "homogeneous" | "jupiter" | "sphere";
  verticalSphereRadius: number;
  totalNodes: number;
  /** Quand une autre planète est sélectionnée, oscillation verticale sinus (amplitude/fréquence) */
  oscillationAmplitude: number;
  oscillationFrequency: number;
  otherPlanetSelected: boolean;
  /** Appelé quand cette planète a fini son animation d'entrée et est en orbite */
  onEnterOrbit?: () => void;
  /** Appelé à chaque frame en phase d'entrée avec le temps CPU passé dans les calculs de trajectoire (ms) */
  onTrajectoryFrame?: (cpuMs: number) => void;
  /** Option B : ombre sur le label (enableTextShadow) */
  showTextShadow?: boolean;
  /** Ref pour afficher le label seulement quand le curseur est dans la zone des orbites (ou planète survolée/sélectionnée) */
  inOrbitZoneRef?: React.MutableRefObject<boolean>;
  /** 0 = orbite la plus proche du centre, 1 = la plus éloignée — sert à agrandir légèrement l’arrière-plan */
  orbitDepthBlend: number;
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
  verticalMode,
  verticalSphereRadius,
  totalNodes,
  oscillationAmplitude,
  oscillationFrequency,
  otherPlanetSelected,
  onEnterOrbit,
  onTrajectoryFrame,
  showTextShadow,
  inOrbitZoneRef,
  orbitDepthBlend,
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

  /** Mobile (< md) : pas d'oscillation verticale quand une planète est sélectionnée. */
  const skipVerticalOscillationRef = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => {
      skipVerticalOscillationRef.current = mq.matches;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

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

  const perspectiveBoost = THREE.MathUtils.lerp(1, REMOTE_ORBIT_SCALE_MAX, orbitDepthBlend);
  const scale = (node.planet_scale ?? 0.6) * globalPlanetScale * perspectiveBoost;
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
        const tPos = getOrbitPosition(testPhase, orbitRadius, orbitShape, orbitRoundness, orbitY, verticalMode, verticalSphereRadius, index, totalNodes);
        const dist = tPos.distanceTo(startVec);
        if (dist < bestDist) {
          bestDist = dist;
          bestPhase = testPhase;
        }
      }
    }
    const finalPos = getOrbitPosition(bestPhase, orbitRadius, orbitShape, orbitRoundness, orbitY, verticalMode, verticalSphereRadius, index, totalNodes);

    // Calcul du point de départ en mode fan :
    // On part dans la direction opposée à la tangente de l'orbite au point d'arrivée
    let fanStart: THREE.Vector3 | null = null;
    if (entryTrajectory === "fan") {
      const tangent = getOrbitTangent(bestPhase, orbitRadius, orbitShape, orbitRoundness, orbitY, verticalMode, verticalSphereRadius, index, totalNodes);
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
        if (entryStartPos.current) {
          groupRef.current.position.copy(entryStartPos.current);
        } else {
          groupRef.current.position.set(entryStartX, entryStartY, entryStartZ ?? orbitRadius);
        }
        return;
      }
      hasDelayPassed.current = true;
    }

    if (!s.hasEnteredOrbit) {
      // ── Phase 1 : animation d'entrée (mesure CPU pour perf) ──
      const t0 = typeof performance !== "undefined" ? performance.now() : 0;

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

      if (typeof performance !== "undefined" && onTrajectoryFrame) {
        onTrajectoryFrame(performance.now() - t0);
      }

      if (tNorm >= 1) {
        s.hasEnteredOrbit = true;
        s.phase = targetOrbitPhase;
        orbitEntryTime.current = state.clock.elapsedTime;
        groupRef.current.position.copy(targetOrbitPos);
        onEnterOrbit?.();
      } else {
        return; // On attend la frame suivante pour continuer l'approche
      }
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
    const nominalPos = getOrbitPosition(s.phase, orbitRadius, orbitShape, orbitRoundness, orbitY, verticalMode, verticalSphereRadius, index, totalNodes);

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

    // Oscillation verticale (sinus) des autres planètes quand une planète est sélectionnée (désactivée en mobile)
    if (
      otherPlanetSelected &&
      !isSelected &&
      oscillationAmplitude > 0 &&
      oscillationFrequency > 0 &&
      !skipVerticalOscillationRef.current
    ) {
      newPos.y += oscillationAmplitude * Math.sin(2 * Math.PI * oscillationFrequency * state.clock.elapsedTime);
    }

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
      {/* Solution 2: Code splitting - les planètes sont chargées dynamiquement */}
      <DynamicPlanet
        type={(planetType || "glass") as PlanetType}
        scale={displayScale}
        color={color}
        visualSource={visualSource as "preset" | "glb" | "gif"}
        modelUrl={node.model_3d ?? undefined}
        textureUrl={node.planet_texture ?? undefined}
      />

      {/* Glow effect au hover/sélection */}
      {(isHovered || isSelected) && (
        <mesh>
          <sphereGeometry args={[displayScale * 1.3, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.08} />
        </mesh>
      )}

      {/* Label : visible uniquement quand curseur dans la zone ou planète survolée/sélectionnée */}
      <LabelSprite
        text={node.name}
        offsetY={displayScale + 1.2}
        showTextShadow={showTextShadow}
        inOrbitZoneRef={inOrbitZoneRef}
        isHovered={isHovered}
        isSelected={isSelected}
      />
    </group>
  );
}

// ─────────────────────────────────────────────────────────
//  Label sprite (billboard via CanvasTexture)
// ─────────────────────────────────────────────────────────

function LabelSprite({
  text,
  offsetY,
  showTextShadow = false,
  inOrbitZoneRef,
  isHovered = false,
  isSelected = false,
}: {
  text: string;
  offsetY: number;
  /** Option B : ombre portée sur le texte (liée à enableTextShadow du contexte) */
  showTextShadow?: boolean;
  /** Si fourni, le label n’est visible que lorsque le curseur est dans la zone des orbites ou cette planète est survolée/sélectionnée */
  inOrbitZoneRef?: React.MutableRefObject<boolean>;
  isHovered?: boolean;
  isSelected?: boolean;
}) {
  const spriteRef = useRef<THREE.Sprite>(null);
  const isCompact = useCompactPlanetLabels();

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    const w = isCompact ? 640 : 384;
    const h = isCompact ? 144 : 80;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, w, h);
    const fontSize = isCompact ? 36 : 24;
    ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const cx = w / 2;
    const cy = h / 2;
    const strokeW = isCompact ? 5 : 3;
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;
    ctx.strokeStyle = "rgba(0,0,0,0.92)";
    ctx.lineWidth = strokeW;
    ctx.strokeText(text, cx, cy);
    ctx.fillStyle = "#ffffff";
    if (showTextShadow) {
      ctx.shadowColor = "rgba(0,0,0,0.85)";
      ctx.shadowBlur = isCompact ? 12 : 8;
      ctx.shadowOffsetX = isCompact ? 3 : 2;
      ctx.shadowOffsetY = isCompact ? 3 : 2;
    }
    ctx.fillText(text, cx, cy);
    if (showTextShadow) {
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }, [text, showTextShadow, isCompact]);

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  useFrame(({ camera }) => {
    if (!spriteRef.current) return;
    const dist = camera.position.length();
    const s = Math.max(0.5, dist * 0.12);
    const layoutBoost = isCompact ? 1.9 : 1;
    /** Sur smartphone : grossir les libellés des planètes éloignées (sinon la perspective les écrase). */
    let distanceBoost = 1;
    if (isCompact) {
      spriteRef.current.getWorldPosition(_labelWorldScratch);
      const dCam = _labelWorldScratch.distanceTo(camera.position);
      distanceBoost = THREE.MathUtils.clamp(
        dCam / LABEL_DISTANCE_REF,
        1,
        LABEL_DISTANCE_BOOST_MAX_COMPACT
      );
    }
    const total = layoutBoost * distanceBoost;
    spriteRef.current.scale.set(s * 1.8 * total, s * 0.45 * total, 1);
    if (inOrbitZoneRef) {
      spriteRef.current.visible = inOrbitZoneRef.current || isHovered || isSelected;
    }
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
  /** Option B : ombre sur le label (enableTextShadow) */
  showTextShadow?: boolean;
  /** Ref pour afficher le label seulement quand le curseur est dans la zone des orbites (ou soleil survolé/sélectionné) */
  inOrbitZoneRef?: React.MutableRefObject<boolean>;
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
  showTextShadow,
  inOrbitZoneRef,
}: SunProps) {
  const spinRef = useRef<THREE.Group>(null);
  const color = hexToColor(node.planet_color || "#fbbf24");
  const scale = Math.max(node.planet_scale ?? 1.2, 1) * globalPlanetScale;
  const displayScale = isHovered || isSelected ? scale * 1.1 : scale;
  const visualSource = (node.visual_source || "preset") as "preset" | "glb" | "gif";
  const planetType = (node.planet_type || "glass") as PlanetType;
  const useFileVisual =
    (visualSource === "glb" && !!node.model_3d) ||
    (visualSource === "gif" && !!node.planet_texture);

  useFrame((_, delta) => {
    if (!spinRef.current || frozen) return;
    spinRef.current.rotation.y += delta * 0.15 * speedMultiplierRef.current;
  });

  return (
    <group
      position={[0, 0, 0]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; onHover(true); }}
      onPointerOut={() => { document.body.style.cursor = "default"; onHover(false); }}
    >
      <group ref={spinRef}>
        {useFileVisual ? (
          <DynamicPlanet
            type={planetType}
            scale={displayScale}
            color={color}
            visualSource={visualSource}
            modelUrl={node.model_3d ?? undefined}
            textureUrl={node.planet_texture ?? undefined}
          />
        ) : (
          <>
            <mesh scale={displayScale}>
              <sphereGeometry args={[1, 32, 32]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.7}
                roughness={0.3}
                metalness={0.1}
              />
            </mesh>
            <mesh scale={displayScale * 1.4}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshBasicMaterial color={color} transparent opacity={0.06} />
            </mesh>
          </>
        )}
      </group>
      <LabelSprite
        text={node.name}
        offsetY={displayScale + 1.5}
        showTextShadow={showTextShadow}
        inOrbitZoneRef={inOrbitZoneRef}
        isHovered={isHovered}
        isSelected={isSelected}
      />
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
  autoResetCamera?: boolean;
  autoResetDelay?: number;
}

function CameraController({
  selectedNodePos,
  selectedNodeScale,
  resetKey,
  fov,
  controlsRef,
  onCameraMove,
  autoResetCamera,
  autoResetDelay,
}: CameraControllerProps) {
  const { camera } = useThree();
  const opts = usePlanetsOptions();
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

  // Synchronisation avec les réglages du preset (coordonnées de référence)
  useEffect(() => {
    const cam = camera;
    const ctrl = controlsRef.current;
    if (!cam) return;

    // Si on n'est pas en train d'animer (ex: zoom planète), on s'aligne sur le preset
    if (!isAnimating.current) {
      cam.position.set(opts.cameraX, opts.cameraY, opts.cameraZ);
      if (ctrl) {
        ctrl.target.set(opts.cameraTargetX, opts.cameraTargetY, opts.cameraTargetZ);
        ctrl.update();
      }
    }
  }, [camera, controlsRef, opts.cameraX, opts.cameraY, opts.cameraZ, opts.cameraTargetX, opts.cameraTargetY, opts.cameraTargetZ]);

  // Charger la position de la dernière session (si différente du preset par défaut)
  useEffect(() => {
    const savedPos = localStorage.getItem("explore_camera_pos");
    const savedTarget = localStorage.getItem("explore_camera_target");

    // On ne restaure la session que si le preset courant est à ses valeurs par défaut (0, 6.84, 18.79)
    // Cela permet au preset chargé de prendre la priorité si l'utilisateur a configuré une vue spécifique.
    const isDefaultPreset = opts.cameraX === 0 && opts.cameraY === 6.84 && opts.cameraZ === 18.79;

    if (savedPos && isDefaultPreset) {
      try {
        const p = JSON.parse(savedPos);
        camera.position.set(p.x, p.y, p.z);
      } catch { /* ignore */ }
    }
    if (savedTarget && controlsRef.current && isDefaultPreset) {
      try {
        const t = JSON.parse(savedTarget);
        controlsRef.current.target.set(t.x, t.y, t.z);
        controlsRef.current.update();
      } catch { /* ignore */ }
    }
  }, [camera, controlsRef]); // On ne met pas opts.cameraX en dep ici pour ne pas relancer le chargement LS à chaque changement de preset

  useFrame(() => {
    if (!isAnimating.current) {
      const pos = camera.position;
      const tgt = controlsRef.current?.target;

      // 1. Mettre à jour la ref globale pour la capture du preset (OptionsPanel)
      if (opts.cameraRef) {
        if (!opts.cameraRef.current) {
          (opts.cameraRef as any).current = { x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0 };
        }
        opts.cameraRef.current.x = pos.x;
        opts.cameraRef.current.y = pos.y;
        opts.cameraRef.current.z = pos.z;
        if (tgt) {
          opts.cameraRef.current.tx = tgt.x;
          opts.cameraRef.current.ty = tgt.y;
          opts.cameraRef.current.tz = tgt.z;
        }
      }

      // 2. Sauvegarder dans LocalStorage (throttled)
      if (!saveTimer.current) {
        saveTimer.current = setTimeout(() => {
          localStorage.setItem("explore_camera_pos", JSON.stringify({ x: pos.x, y: pos.y, z: pos.z }));
          if (tgt) localStorage.setItem("explore_camera_target", JSON.stringify({ x: tgt.x, y: tgt.y, z: tgt.z }));
          saveTimer.current = null;
        }, 500);
      }
    }
  });

  // Reset caméra (déclenché par resetKey manuel ou autoReset) — une seule animation vers le preset (opts)
  const executeReset = useCallback(() => {
    const refX = opts.cameraX;
    const refY = opts.cameraY;
    const refZ = opts.cameraZ;
    const refTX = opts.cameraTargetX;
    const refTY = opts.cameraTargetY;
    const refTZ = opts.cameraTargetZ;

    isAnimating.current = true;
    gsap.to(camera.position, {
      x: refX, y: refY, z: refZ,
      duration: 1.5,
      ease: "power2.inOut",
      onComplete: () => { isAnimating.current = false; },
      overwrite: "auto"
    });
    if (controlsRef.current) {
      gsap.to(controlsRef.current.target, {
        x: refTX, y: refTY, z: refTZ,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => controlsRef.current?.update(),
        overwrite: "auto"
      });
    }
  }, [camera, controlsRef, opts.cameraX, opts.cameraY, opts.cameraZ, opts.cameraTargetX, opts.cameraTargetY, opts.cameraTargetZ]);

  // Détection du resetKey (bouton de l'interface)
  useEffect(() => {
    if (prevResetKey.current === resetKey) return;
    prevResetKey.current = resetKey;
    executeReset();
  }, [resetKey, executeReset]);

  // Fonction globale attachée sur window pour permettre l'appel manuel depuis OrbitControls onEnd
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__exploreCameraReset = executeReset;
    }
  }, [executeReset]);

  // Zoom sur planète sélectionnée — caméra sur la droite (0,0,0) → planète pour que l'origine reste derrière
  useEffect(() => {
    if (!selectedNodePos || !controlsRef.current) return;
    if (prevSelectedPos.current?.equals(selectedNodePos)) return;
    prevSelectedPos.current = selectedNodePos.clone();

    const offset = 8 + (selectedNodeScale * 2);
    const targetX = selectedNodePos.x;
    const targetY = selectedNodePos.y;
    const targetZ = selectedNodePos.z;
    const isRoot = targetX === 0 && targetY === 0 && targetZ === 0;

    let camX: number;
    let camY: number;
    let camZ: number;

    if (isRoot) {
      // Soleil au centre : pas de direction unique, garder un placement fixe
      camX = targetX;
      camY = targetY + offset * 0.2;
      camZ = targetZ + offset;
    } else {
      // Planète en orbite : caméra sur la demi-droite origine → planète, au-delà de la planète
      const dir = new THREE.Vector3(targetX, targetY, targetZ).normalize();
      camX = targetX + offset * dir.x;
      camY = targetY + offset * dir.y;
      camZ = targetZ + offset * dir.z;
    }

    isAnimating.current = true;
    gsap.to(camera.position, {
      x: camX,
      y: camY,
      z: camZ,
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
  /** Callback pour positionner le cadre de sélection au centre de la planète (coords écran) */
  onSelectedPlanetScreenPosition?: (x: number, y: number) => void;
  showEntryTrajectory: boolean;
  verticalMode: "manual" | "homogeneous" | "jupiter" | "sphere";
  autoDistributeOrbits: boolean;
  globalPlanetScale: number;
  hoverOrbitSpeedRatio: number;
  hoverPlanetSpeedRatio: number;
  hoverOrbitTransitionSpeed: number;
  hoverPlanetTransitionSpeed: number;
  verticalHomogeneousBase: number;
  verticalHomogeneousStep: number;
  verticalJupiterAmplitude: number;
  verticalSphereRadius: number;
  allPositions?: React.MutableRefObject<Map<string, THREE.Vector3>>;
  onFirstFrame?: () => void;
  /** Appelé quand toutes les planètes (orbitNodes) ont fini leur animation d'entrée */
  onAllPlanetsOnOrbit?: (trajectoryCpuMs?: number) => void;
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
  onSelectedPlanetScreenPosition,
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
  verticalSphereRadius,
  allPositions: externalAllPositions,
  onFirstFrame,
  onAllPlanetsOnOrbit,
}: SceneContentProps) {
  const router = useRouter();
  const opts = usePlanetsOptions();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const mousePosRef = useRef(new THREE.Vector3());
  const localAllPositions = useRef<Map<string, THREE.Vector3>>(new Map());
  const allPositions = externalAllPositions || localAllPositions;
  const planetsOnOrbitCount = useRef(0);
  const allPlanetsOnOrbitCalled = useRef(false);
  const trajectoryCpuMsRef = useRef(0);

  const handlePlanetEnterOrbit = useCallback(() => {
    if (allPlanetsOnOrbitCalled.current || !onAllPlanetsOnOrbit) return;
    planetsOnOrbitCount.current += 1;
    if (planetsOnOrbitCount.current >= orbitNodes.length) {
      allPlanetsOnOrbitCalled.current = true;
      onAllPlanetsOnOrbit(trajectoryCpuMsRef.current);
    }
  }, [onAllPlanetsOnOrbit, orbitNodes.length]);

  const handleTrajectoryFrame = useCallback((cpuMs: number) => {
    trajectoryCpuMsRef.current += cpuMs;
  }, []);

  useEffect(() => {
    planetsOnOrbitCount.current = 0;
    allPlanetsOnOrbitCalled.current = false;
    trajectoryCpuMsRef.current = 0;
  }, [restartKey]);

  // Track mouse position in 3D (plan Y=0)
  const { camera, gl, size } = useThree();

  // Projeter le centre de la planète sélectionnée en coordonnées écran (pour aligner le cadre)
  useFrame(() => {
    if (!onSelectedPlanetScreenPosition || !selectedNodePos) return;
    const v = selectedNodePos.clone().project(camera);
    const rect = gl.domElement.getBoundingClientRect();
    const x = rect.left + (v.x * 0.5 + 0.5) * size.width;
    const y = rect.top + (1 - (v.y * 0.5 + 0.5)) * size.height;
    onSelectedPlanetScreenPosition(x, y);
  });
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
  // Raycaster : rayon 3D depuis la caméra vers la souris. Sert à savoir si le pointeur
  // vise la zone des orbites (distance à l'origine, hauteur Y) pour adapter la vitesse
  // de rotation (hoverOrbitSpeedRatio / hoverPlanetSpeedRatio). Pas utilisé pour les clics
  // (gérés par R3F sur les meshes).
  const raycasterRef = useRef(new THREE.Raycaster());
  // Refs pour l’indicateur visuel de la zone de ralentissement (affiché quand inOrbitZone)
  const inOrbitZoneRef = useRef(false);
  const orbitZoneRadiusRef = useRef(0);

  useFrame((state, delta) => {
    // Reconstruire le rayon depuis le dernier NDC pointé
    raycasterRef.current.setFromCamera(pointerNDC.current, state.camera);
    const ray = raycasterRef.current.ray;

    let inOrbitZone = false;

    const orbitZoneRadius = computeCircumOrbitRadius(
      orbitNodes,
      verticalMode,
      autoDistributeOrbits,
      orbitSpacing,
      verticalHomogeneousBase,
      verticalHomogeneousStep,
      verticalJupiterAmplitude,
      verticalSphereRadius,
      globalShapeOverride,
      globalShape,
      globalRoundness,
      globalPlanetScale
    );

    // Zone = disque horizontal (y=0) : intersection souris / plan, distance XZ depuis l'origine
    const hitPlane = rayIntersectPlaneY(ray, 0);
    if (hitPlane && orbitZoneRadius > 0) {
      const d = Math.hypot(hitPlane.x, hitPlane.z);
      if (d <= orbitZoneRadius && d >= 0.05) {
        inOrbitZone = true;
      }
    } else if (orbitZoneRadius > 0) {
      // Rayon quasi parallèle au sol : repli sur la distance minimale rayon ↔ axe Y
      const distanceToOrigin = ray.distanceToPoint(new THREE.Vector3(0, 0, 0));
      if (distanceToOrigin <= orbitZoneRadius && distanceToOrigin >= 0.1) {
        let maxY = 5;
        if (verticalMode === "homogeneous") {
          const step = verticalHomogeneousStep / Math.max(1, Math.floor(orbitNodes.length / 2));
          maxY = step * Math.floor(orbitNodes.length / 2) + verticalHomogeneousBase;
        } else if (verticalMode === "jupiter") {
          maxY = verticalJupiterAmplitude;
        } else if (verticalMode === "manual" && orbitNodes.length > 0) {
          maxY = Math.max(...orbitNodes.map((n) => Math.abs(n.orbit_position_y || 0)), 5);
        }
        const pointCible = new THREE.Vector3();
        ray.closestPointToPoint(new THREE.Vector3(0, 0, 0), pointCible);
        if (Math.abs(pointCible.y) <= maxY + 15) {
          inOrbitZone = true;
        }
      }
    }

    inOrbitZoneRef.current = inOrbitZone;
    orbitZoneRadiusRef.current = orbitZoneRadius;

    // Si une planète est pointée -> multiplier = hoverPlanetSpeedRatio
    // Si zone d'orbite survolée -> multiplier = hoverOrbitSpeedRatio
    // Sinon -> multiplier = 1.0
    const targetMultiplier = hoveredId !== null ? hoverPlanetSpeedRatio : (inOrbitZone ? hoverOrbitSpeedRatio : 1.0);
    const lerpSpeed = hoveredId !== null ? hoverPlanetTransitionSpeed : hoverOrbitTransitionSpeed;
    speedMultiplierRef.current = THREE.MathUtils.lerp(speedMultiplierRef.current, targetMultiplier, delta * lerpSpeed);
  });

  const selectedNode = orbitNodes.find(n => n.id === selectedId) ?? (rootNode?.id === selectedId ? rootNode : null);
  const selectedScale = selectedNode?.planet_scale ?? 0.6;

  const orbitDepthBlendsByIndex = useMemo(() => {
    const n = orbitNodes.length;
    if (n === 0) return [];
    const radii: number[] = [];
    for (let i = 0; i < n; i++) {
      const { r } = getDynamicOrbitParams(
        orbitNodes[i],
        i,
        n,
        autoDistributeOrbits,
        verticalMode,
        orbitSpacing,
        verticalHomogeneousBase,
        verticalHomogeneousStep,
        verticalJupiterAmplitude,
        verticalSphereRadius
      );
      radii.push(r);
    }
    const rMin = Math.min(...radii);
    const rMax = Math.max(...radii);
    const span = rMax - rMin;
    return radii.map((r) => (span < 1e-6 ? 0 : (r - rMin) / span));
  }, [
    orbitNodes,
    autoDistributeOrbits,
    verticalMode,
    orbitSpacing,
    verticalHomogeneousBase,
    verticalHomogeneousStep,
    verticalJupiterAmplitude,
    verticalSphereRadius,
  ]);

  return (
    <>
      {/* Détecteur de première frame (performance monitoring) */}
      <FirstFrameDetector onFirstFrame={onFirstFrame} />

      {/* Éclairage Dynamique V5 */}
      {opts.lightConfig && (
        <>
          <ambientLight intensity={opts.lightConfig.ambientIntensity} />
          <directionalLight position={opts.lightConfig.dirPosition} intensity={opts.lightConfig.dirIntensity} castShadow />
          <pointLight position={opts.lightConfig.p1Position} intensity={opts.lightConfig.p1Intensity} color={opts.lightConfig.p1Color} />
          <pointLight position={opts.lightConfig.p2Position} intensity={opts.lightConfig.p2Intensity} color={opts.lightConfig.p2Color} />
          <pointLight position={opts.lightConfig.p3Position} intensity={opts.lightConfig.p3Intensity} color={opts.lightConfig.p3Color} />
        </>
      )}

      {/* Orbites (masquées en mode Sphère car elles n'ont pas de sens physique 2D) */}
      {showOrbits && verticalMode !== "sphere" &&
        orbitNodes.map((node, i) => {
          const { r, y } = getDynamicOrbitParams(node, i, orbitNodes.length, autoDistributeOrbits, verticalMode, orbitSpacing, verticalHomogeneousBase, verticalHomogeneousStep, verticalJupiterAmplitude, verticalSphereRadius);
          const shape = globalShapeOverride ? globalShape : ((node.orbit_shape as "circle" | "squircle") || "circle");
          const roundness = globalShapeOverride ? globalRoundness : (node.orbit_roundness ?? 0.6);
          return (
            <OrbitRing key={`orbit-${node.id}`} radius={r} shape={shape} roundness={roundness} orbitY={y} />
          );
        })}

      {/* Zone de ralentissement au survol : anneau visible quand la souris est dans la zone des orbites (config. admin) */}
      {verticalMode !== "sphere" && (
        <OrbitZoneIndicator
          inOrbitZoneRef={inOrbitZoneRef}
          orbitZoneRadiusRef={orbitZoneRadiusRef}
          show={opts.showOrbitZoneIndicator ?? true}
          color={opts.orbitZoneIndicatorColor ?? "#a855f7"}
          opacity={opts.orbitZoneIndicatorOpacity ?? 0.28}
        />
      )}

      {/* Soleil ROOT */}
      {rootNode && (
        <Sun
          node={rootNode}
          frozen={frozen}
          globalPlanetScale={globalPlanetScale}
          onClick={() => onPlanetClick(rootNode)}
          onDoubleClick={() => {
            if (rootNode.cta_url) router.push(rootNode.cta_url);
            else router.push(`/organisation/noeuds/${encodeURIComponent(rootNode.slug)}`);
          }}
          isSelected={selectedId === rootNode.id}
          isHovered={hoveredId === rootNode.id}
          onHover={(v) => setHoveredId(v ? rootNode.id : null)}
          speedMultiplierRef={speedMultiplierRef}
          inOrbitZoneRef={inOrbitZoneRef}
        />
      )}

      {/* Planètes */}
      {orbitNodes.map((node, i) => {
        const { r, y } = getDynamicOrbitParams(node, i, orbitNodes.length, autoDistributeOrbits, verticalMode, orbitSpacing, verticalHomogeneousBase, verticalHomogeneousStep, verticalJupiterAmplitude, verticalSphereRadius);
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
            entryDelay={i * opts.entryStagger}
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
              else router.push(`/organisation/noeuds/${encodeURIComponent(node.slug)}`);
            }}
            onHover={(v) => setHoveredId(v ? node.id : null)}
            isHovered={hoveredId === node.id}
            isSelected={selectedId === node.id}
            showEntryTrajectory={showEntryTrajectory}
            speedMultiplierRef={speedMultiplierRef}
            verticalMode={verticalMode}
            verticalSphereRadius={verticalSphereRadius}
            totalNodes={orbitNodes.length}
            oscillationAmplitude={opts.oscillationAmplitude ?? 0.3}
            oscillationFrequency={opts.oscillationFrequency ?? 0.5}
            otherPlanetSelected={selectedId != null}
            onEnterOrbit={handlePlanetEnterOrbit}
            onTrajectoryFrame={handleTrajectoryFrame}
            showTextShadow={opts.enableTextShadow}
            inOrbitZoneRef={inOrbitZoneRef}
            orbitDepthBlend={orbitDepthBlendsByIndex[i] ?? 0}
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
        onStart={() => {
          if ((window as any).__autoResetTimer) {
            clearTimeout((window as any).__autoResetTimer);
            (window as any).__autoResetTimer = null;
          }
        }}
        onEnd={() => {
          // Ne pas lancer le retour auto tant qu'une planète est sélectionnée
          if (opts.autoResetCamera && !selectedId) {
            if ((window as any).__autoResetTimer) clearTimeout((window as any).__autoResetTimer);
            (window as any).__autoResetTimer = setTimeout(() => {
              if ((window as any).__exploreCameraReset) {
                (window as any).__exploreCameraReset();
              }
            }, (opts.autoResetDelay ?? 5) * 1000);
          }
        }}
      />

      <CameraController
        selectedNodePos={selectedNodePos}
        selectedNodeScale={selectedScale}
        resetKey={resetKey}
        fov={fishEye}
        controlsRef={controlsRef}
        autoResetCamera={opts.autoResetCamera}
        autoResetDelay={opts.autoResetDelay}
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
  /** Position 2D écran du centre de la planète sélectionnée (pour aligner le cadre) */
  onSelectedPlanetScreenPosition?: (x: number, y: number) => void;
  controlsRef?: React.MutableRefObject<any>;
  cameraRef?: React.MutableRefObject<any>;
  /** Callbacks de performance */
  onFirstFrame?: () => void;
  onSceneReady?: () => void;
  onPlanetsLoaded?: (count: number) => void;
  /** Appelé quand toutes les planètes sont en orbite (fin phase d'entrée) */
  onAllPlanetsOnOrbit?: (trajectoryCpuMs?: number) => void;
}

/**
 * ExploreScene V5 — Canvas fullscreen transparent, 6 types de planètes,
 * animation Fan Effect, physique interactive, contrôles caméra GSAP.
 * S'appuie sur PlanetsOptionsContext pour tous les paramètres.
 */
export function ExploreScene({ nodes, onOpenOverlay, onSelectNode, onSelectedPlanetScreenPosition, controlsRef: externalControlsRef, cameraRef, onFirstFrame, onSceneReady, onPlanetsLoaded, onAllPlanetsOnOrbit }: ExploreSceneProps) {
  const opts = usePlanetsOptions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedIdRef = useRef<string | null>(null); // toujours synchrone, pas de stale closure
  const [selectedNodePos, setSelectedNodePos] = useState<THREE.Vector3 | null>(null);
  const localControlsRef = useRef<{ target: THREE.Vector3; update: () => void } | null>(null);
  const controlsRef = externalControlsRef || localControlsRef;
  const allPositions = useRef<Map<string, THREE.Vector3>>(new Map());
  const firstFrameCalled = useRef(false);
  const sceneReadyCalled = useRef(false);

  // Solution 3: Utiliser useDeferredValue pour ne pas bloquer l'UI pendant les calculs
  const deferredNodes = useDeferredValue(nodes);
  
  // Marquer les planètes comme chargées quand les nodes sont prêts
  useEffect(() => {
    if (deferredNodes.length > 0 && onPlanetsLoaded) {
      onPlanetsLoaded(deferredNodes.length);
    }
  }, [deferredNodes.length, onPlanetsLoaded]);

  // Synchroniser la ref avec l'état
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

  const rootNode = useMemo(() => deferredNodes.find((n) => n.type === "ROOT") ?? null, [deferredNodes]);
  const orbitNodes = useMemo(() => deferredNodes.filter((n) => n.type !== "ROOT"), [deferredNodes]);

  const handlePlanetClick = useCallback(
    (node: OrganizationNodeApi) => {
      // Utilise la ref pour éviter le stale closure
      const currentSelectedId = selectedIdRef.current;

      // Si la planète est déjà sélectionnée → ouvrir l'overlay (2ème clic)
      if (currentSelectedId === node.id) {
        onOpenOverlay(node);
        return;
      }

      // Premier clic sur une nouvelle planète → annuler le retour auto et zoom
      if (typeof window !== "undefined" && (window as any).__autoResetTimer) {
        clearTimeout((window as any).__autoResetTimer);
        (window as any).__autoResetTimer = null;
      }
      setSelectedId(node.id);
      selectedIdRef.current = node.id;
      opts.set("freezePlanets", true);
      onSelectNode(node);

      // Calculer la position pour la caméra
      if (node.type === "ROOT") {
        setSelectedNodePos(new THREE.Vector3(0, 0, 0));
      } else {
        const currentPos = allPositions.current.get(node.id);
        if (currentPos) {
          setSelectedNodePos(currentPos.clone());
        } else {
          const i = orbitNodes.findIndex((n) => n.id === node.id);
          const { r, y } = getDynamicOrbitParams(node, i, orbitNodes.length, opts.autoDistributeOrbits, opts.verticalMode as "manual" | "homogeneous" | "jupiter" | "sphere", opts.orbitSpacing, opts.verticalHomogeneousBase, opts.verticalHomogeneousStep, opts.verticalJupiterAmplitude, opts.verticalSphereRadius);
          const phase = node.orbit_phase ?? (i * 0.7);
          const fbPos = getOrbitPosition(phase, r, opts.globalShapeOverride ? opts.orbitShape : ((node.orbit_shape as any) || "circle"), opts.globalShapeOverride ? opts.orbitRoundness : (node.orbit_roundness ?? 0.6), y, opts.verticalMode as any, opts.verticalSphereRadius, i, orbitNodes.length);
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
        
        // Marquer la scène comme prête
        if (!sceneReadyCalled.current && onSceneReady) {
          sceneReadyCalled.current = true;
          onSceneReady();
        }
      }}
      frameloop="always"
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
        onSelectedPlanetScreenPosition={onSelectedPlanetScreenPosition}
        showEntryTrajectory={opts.showEntryTrajectory}
        verticalMode={opts.verticalMode as "manual" | "homogeneous" | "jupiter" | "sphere"}
        autoDistributeOrbits={opts.autoDistributeOrbits}
        globalPlanetScale={opts.globalPlanetScale}
        hoverOrbitSpeedRatio={opts.hoverOrbitSpeedRatio}
        hoverPlanetSpeedRatio={opts.hoverPlanetSpeedRatio}
        hoverOrbitTransitionSpeed={opts.hoverOrbitTransitionSpeed}
        hoverPlanetTransitionSpeed={opts.hoverPlanetTransitionSpeed}
        verticalHomogeneousBase={opts.verticalHomogeneousBase}
        verticalHomogeneousStep={opts.verticalHomogeneousStep}
        verticalJupiterAmplitude={opts.verticalJupiterAmplitude}
        verticalSphereRadius={opts.verticalSphereRadius}
        allPositions={allPositions}
        onFirstFrame={() => {
          if (!firstFrameCalled.current && onFirstFrame) {
            firstFrameCalled.current = true;
            onFirstFrame();
          }
        }}
        onAllPlanetsOnOrbit={onAllPlanetsOnOrbit}
      />

    </Canvas>
  );
}
