"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useRef,
    type ReactNode,
} from "react";

// ─────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────

export type EasingType = "linear" | "easeIn" | "easeOut" | "easeInOut";

export interface PlanetsOptionsState {
    showOrbits: boolean;
    freezePlanets: boolean;
    showDebugInfo: boolean;
    fishEye: number;
    orbitSpacing: number;
    globalPlanetScale: number;
    globalShapeOverride: boolean;
    orbitShape: "circle" | "squircle";
    orbitRoundness: number;
    mouseForce: number;
    collisionForce: number;
    damping: number;
    returnForce: number;
    entryStartX: number;
    entryStartY: number;
    entryStartZ: number | null;
    // ── Cinématique Entrée ──
    entrySpeedStart: number;   // vitesse initiale (unités/s)
    entrySpeedEnd: number;     // vitesse cible à l'arrivée sur l'orbite
    entryEasing: EasingType;   // courbe de rampe entre start et end
    entryDuration: number;     // durée totale de la phase d'entrée (s, 0 = automatique)
    entryTrajectory: "linear" | "arc" | "ellipse" | "scurve" | "spiral" | "corkscrew" | "wave" | "fan";
    /** Distance de départ en mode éventail (fan), en unités-monde */
    fanDistance: number;
    // ── Cinématique Orbite ──
    orbitSpeedStart: number;   // vitesse angulaire initiale (rad/s) au raccord
    orbitSpeedTarget: number;  // vitesse angulaire nominale cible
    orbitEasing: EasingType;   // courbe de rampe orbitale
    orbitalRampDuration: number; // durée de la rampe orbitale (s, 0 = instantané)
    /** @deprecated utiliser orbitSpeedTarget */
    globalOrbitSpeed: number;
    grayscaleVideo: boolean;
    enableVideoCycle: boolean;
    videoCycleVisible: number;
    videoCycleHidden: number;
    videoTransition: number;
    isTransitioningToExplore: boolean;
    showVideoOverlay: boolean;
    showEntryTrajectory: boolean;
    // ── Nouveaux Modes ──
    verticalMode: "manual" | "homogeneous" | "jupiter";
    autoDistributeOrbits: boolean;
    // ── Vitesse de survol (Hover) ──
    hoverOrbitSpeedRatio: number;
    hoverPlanetSpeedRatio: number;
    hoverOrbitTransitionSpeed: number;
    hoverPlanetTransitionSpeed: number;
}

export interface PlanetsOptionsContextValue extends PlanetsOptionsState {
    set: <K extends keyof PlanetsOptionsState>(
        key: K,
        value: PlanetsOptionsState[K]
    ) => void;
    triggerRestart: () => void;
    triggerReset: () => void;
    restartKey: number;
    resetKey: number;
    /** Ref exposée pour mettre à jour la position de référence caméra depuis la scène */
    cameraRef: React.RefObject<{
        x: number; y: number; z: number;
        tx: number; ty: number; tz: number;
    }>;
}

// ─────────────────────────────────────────────────────────
//  Defaults + LS helpers
// ─────────────────────────────────────────────────────────

const DEFAULTS: PlanetsOptionsState = {
    showOrbits: true,
    freezePlanets: false,
    showDebugInfo: false,
    fishEye: 50,
    orbitSpacing: 1.0,
    globalPlanetScale: 1.0,
    globalShapeOverride: false,
    orbitShape: "circle",
    orbitRoundness: 0.6,
    mouseForce: 0.5,
    collisionForce: 0.3,
    damping: 0.92,
    returnForce: 0.08,
    entryStartX: -60,
    entryStartY: 0,
    entryStartZ: null,
    // ── Cinématique Entrée ──
    // Vitesses en unités-monde/seconde [0–10 u/s].
    // entrySpeedStart = vitesse au moment du départ (point hors-écran)
    // entrySpeedEnd   = vitesse visée à l'arrivée sur l'orbite (raccord)
    entrySpeedStart: 2,
    entrySpeedEnd: 8,
    entryEasing: "easeOut",
    entryDuration: 0,
    entryTrajectory: "linear",
    fanDistance: 30,
    // ── Cinématique Orbite ──
    // Vitesses en unités-monde/seconde [0–10 u/s].
    // Converties en rad/s via ω = v/r dans le moteur (ExploreScene).
    // orbitSpeedStart = vitesse ang. initiale (0 = calc. auto depuis fin entrée)
    // orbitSpeedTarget = vitesse ang. nominale atteinte après la rampe
    orbitSpeedStart: 0,
    orbitSpeedTarget: 0.5,
    orbitEasing: "easeOut",
    orbitalRampDuration: 10,
    globalOrbitSpeed: 0.5,
    grayscaleVideo: true,
    enableVideoCycle: true,
    videoCycleVisible: 10,
    videoCycleHidden: 10,
    videoTransition: 1500,
    isTransitioningToExplore: false,
    showVideoOverlay: true,
    showEntryTrajectory: false,
    verticalMode: "manual",
    autoDistributeOrbits: false,
    hoverOrbitSpeedRatio: 0.333,
    hoverPlanetSpeedRatio: 0.1,
    hoverOrbitTransitionSpeed: 2,
    hoverPlanetTransitionSpeed: 10,
};

const LS_KEYS: Partial<Record<keyof PlanetsOptionsState, string>> = {
    showOrbits: "planets_showOrbits",
    freezePlanets: "planets_freezePlanets",
    showDebugInfo: "planets_showDebugInfo",
    fishEye: "planets_fishEye",
    orbitSpacing: "planets_orbitSpacing",
    globalPlanetScale: "planets_globalPlanetScale",
    globalShapeOverride: "planets_globalShapeOverride",
    orbitShape: "planets_orbitShape",
    orbitRoundness: "planets_orbitRoundness",
    mouseForce: "planets_mouseForce",
    collisionForce: "planets_collisionForce",
    damping: "planets_damping",
    returnForce: "planets_returnForce",
    entryStartX: "planets_entryStartX",
    entryStartY: "planets_entryStartY",
    entryStartZ: "planets_entryStartZ",
    entrySpeedStart: "planets_entrySpeedStart",
    entrySpeedEnd: "planets_entrySpeedEnd",
    entryEasing: "planets_entryEasing",
    entryDuration: "planets_entryDuration",
    entryTrajectory: "planets_entryTrajectory",
    fanDistance: "planets_fanDistance",
    orbitSpeedStart: "planets_orbitSpeedStart",
    orbitSpeedTarget: "planets_orbitSpeedTarget",
    orbitEasing: "planets_orbitEasing",
    orbitalRampDuration: "planets_orbitalRampDuration",
    globalOrbitSpeed: "planets_globalOrbitSpeed",
    grayscaleVideo: "planets_grayscaleVideo",
    enableVideoCycle: "planets_enableVideoCycle",
    videoCycleVisible: "video_cycleVisible",
    videoCycleHidden: "video_cycleHidden",
    videoTransition: "video_transitionDuration",
    showVideoOverlay: "video_showOverlay",
    showEntryTrajectory: "planets_showEntryTrajectory",
    verticalMode: "planets_verticalMode",
    autoDistributeOrbits: "planets_autoDistributeOrbits",
    hoverOrbitSpeedRatio: "planets_hoverOrbitSpeedRatio",
    hoverPlanetSpeedRatio: "planets_hoverPlanetSpeedRatio",
    hoverOrbitTransitionSpeed: "planets_hoverOrbitTransitionSpeed",
    hoverPlanetTransitionSpeed: "planets_hoverPlanetTransitionSpeed",
};

function lsGet<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

function lsSet(key: string, value: unknown) {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
}

function loadFromLS(): PlanetsOptionsState {
    return {
        showOrbits: lsGet(LS_KEYS.showOrbits!, DEFAULTS.showOrbits),
        freezePlanets: lsGet(LS_KEYS.freezePlanets!, DEFAULTS.freezePlanets),
        showDebugInfo: lsGet(LS_KEYS.showDebugInfo!, DEFAULTS.showDebugInfo),
        fishEye: lsGet(LS_KEYS.fishEye!, DEFAULTS.fishEye),
        orbitSpacing: lsGet(LS_KEYS.orbitSpacing!, DEFAULTS.orbitSpacing),
        globalPlanetScale: lsGet(LS_KEYS.globalPlanetScale!, DEFAULTS.globalPlanetScale),
        globalShapeOverride: lsGet(LS_KEYS.globalShapeOverride!, DEFAULTS.globalShapeOverride),
        orbitShape: lsGet(LS_KEYS.orbitShape!, DEFAULTS.orbitShape),
        orbitRoundness: lsGet(LS_KEYS.orbitRoundness!, DEFAULTS.orbitRoundness),
        mouseForce: lsGet(LS_KEYS.mouseForce!, DEFAULTS.mouseForce),
        collisionForce: lsGet(LS_KEYS.collisionForce!, DEFAULTS.collisionForce),
        damping: lsGet(LS_KEYS.damping!, DEFAULTS.damping),
        returnForce: lsGet(LS_KEYS.returnForce!, DEFAULTS.returnForce),
        entryStartX: lsGet(LS_KEYS.entryStartX!, DEFAULTS.entryStartX),
        entryStartY: lsGet(LS_KEYS.entryStartY!, DEFAULTS.entryStartY),
        entryStartZ: lsGet(LS_KEYS.entryStartZ!, DEFAULTS.entryStartZ),
        entrySpeedStart: lsGet(LS_KEYS.entrySpeedStart!, DEFAULTS.entrySpeedStart),
        entrySpeedEnd: lsGet(LS_KEYS.entrySpeedEnd!, DEFAULTS.entrySpeedEnd),
        entryEasing: lsGet(LS_KEYS.entryEasing!, DEFAULTS.entryEasing),
        entryDuration: lsGet(LS_KEYS.entryDuration!, DEFAULTS.entryDuration),
        entryTrajectory: lsGet(LS_KEYS.entryTrajectory!, DEFAULTS.entryTrajectory),
        fanDistance: lsGet(LS_KEYS.fanDistance!, DEFAULTS.fanDistance),
        orbitSpeedStart: lsGet(LS_KEYS.orbitSpeedStart!, DEFAULTS.orbitSpeedStart),
        orbitSpeedTarget: lsGet(LS_KEYS.orbitSpeedTarget!, DEFAULTS.orbitSpeedTarget),
        orbitEasing: lsGet(LS_KEYS.orbitEasing!, DEFAULTS.orbitEasing),
        orbitalRampDuration: lsGet(LS_KEYS.orbitalRampDuration!, DEFAULTS.orbitalRampDuration),
        globalOrbitSpeed: lsGet(LS_KEYS.globalOrbitSpeed!, DEFAULTS.globalOrbitSpeed),
        grayscaleVideo: lsGet(LS_KEYS.grayscaleVideo!, DEFAULTS.grayscaleVideo),
        enableVideoCycle: lsGet(LS_KEYS.enableVideoCycle!, DEFAULTS.enableVideoCycle),
        videoCycleVisible: lsGet(LS_KEYS.videoCycleVisible!, DEFAULTS.videoCycleVisible),
        videoCycleHidden: lsGet(LS_KEYS.videoCycleHidden!, DEFAULTS.videoCycleHidden),
        videoTransition: lsGet(LS_KEYS.videoTransition!, DEFAULTS.videoTransition),
        showVideoOverlay: lsGet(LS_KEYS.showVideoOverlay!, DEFAULTS.showVideoOverlay),
        showEntryTrajectory: lsGet(LS_KEYS.showEntryTrajectory!, DEFAULTS.showEntryTrajectory),
        verticalMode: lsGet(LS_KEYS.verticalMode!, DEFAULTS.verticalMode),
        autoDistributeOrbits: lsGet(LS_KEYS.autoDistributeOrbits!, DEFAULTS.autoDistributeOrbits),
        hoverOrbitSpeedRatio: lsGet(LS_KEYS.hoverOrbitSpeedRatio!, DEFAULTS.hoverOrbitSpeedRatio),
        hoverPlanetSpeedRatio: lsGet(LS_KEYS.hoverPlanetSpeedRatio!, DEFAULTS.hoverPlanetSpeedRatio),
        hoverOrbitTransitionSpeed: lsGet(LS_KEYS.hoverOrbitTransitionSpeed!, DEFAULTS.hoverOrbitTransitionSpeed),
        hoverPlanetTransitionSpeed: lsGet(LS_KEYS.hoverPlanetTransitionSpeed!, DEFAULTS.hoverPlanetTransitionSpeed),
        isTransitioningToExplore: false,
    };
}

// ─────────────────────────────────────────────────────────
//  Context
// ─────────────────────────────────────────────────────────

const PlanetsOptionsContext = createContext<PlanetsOptionsContextValue | null>(null);

export function PlanetsOptionsProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<PlanetsOptionsState>(DEFAULTS);
    const [restartKey, setRestartKey] = useState(0);
    const [resetKey, setResetKey] = useState(0);
    const cameraRef = useRef({ x: 0, y: 6.84, z: 18.79, tx: 0, ty: 0, tz: 0 });

    // Hydrate depuis localStorage côté client (safe SSR)
    useEffect(() => {
        setState(loadFromLS());
    }, []);

    const set = useCallback(
        <K extends keyof PlanetsOptionsState>(key: K, value: PlanetsOptionsState[K]) => {
            setState((prev) => {
                const next = { ...prev, [key]: value };
                if (key !== "isTransitioningToExplore") {
                    const lsKey = LS_KEYS[key];
                    if (lsKey) lsSet(lsKey, value);
                }
                return next;
            });
        },
        []
    );

    const triggerRestart = useCallback(() => {
        setRestartKey((k) => k + 1);
    }, []);

    const triggerReset = useCallback(() => {
        setResetKey((k) => k + 1);
    }, []);

    const value: PlanetsOptionsContextValue = {
        ...state,
        set,
        triggerRestart,
        triggerReset,
        restartKey,
        resetKey,
        cameraRef,
    };

    return (
        <PlanetsOptionsContext.Provider value={value}>
            {children}
        </PlanetsOptionsContext.Provider>
    );
}

export function usePlanetsOptions(): PlanetsOptionsContextValue {
    const ctx = useContext(PlanetsOptionsContext);
    if (!ctx) throw new Error("usePlanetsOptions must be used within PlanetsOptionsProvider");
    return ctx;
}
