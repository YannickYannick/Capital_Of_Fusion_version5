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

export interface PlanetsOptionsState {
    showOrbits: boolean;
    freezePlanets: boolean;
    showDebugInfo: boolean;
    fishEye: number;
    orbitSpacing: number;
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
    entrySpeed: number;
    grayscaleVideo: boolean;
    enableVideoCycle: boolean;
    videoCycleVisible: number;
    videoCycleHidden: number;
    videoTransition: number;
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
    entrySpeed: 30,
    grayscaleVideo: true,
    enableVideoCycle: true,
    videoCycleVisible: 10,
    videoCycleHidden: 10,
    videoTransition: 1500,
};

const LS_KEYS: Record<keyof PlanetsOptionsState, string> = {
    showOrbits: "planets_showOrbits",
    freezePlanets: "planets_freezePlanets",
    showDebugInfo: "planets_showDebugInfo",
    fishEye: "planets_fishEye",
    orbitSpacing: "planets_orbitSpacing",
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
    entrySpeed: "planets_entrySpeed",
    grayscaleVideo: "planets_grayscaleVideo",
    enableVideoCycle: "planets_enableVideoCycle",
    videoCycleVisible: "video_cycleVisible",
    videoCycleHidden: "video_cycleHidden",
    videoTransition: "video_transitionDuration",
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
        showOrbits: lsGet(LS_KEYS.showOrbits, DEFAULTS.showOrbits),
        freezePlanets: lsGet(LS_KEYS.freezePlanets, DEFAULTS.freezePlanets),
        showDebugInfo: lsGet(LS_KEYS.showDebugInfo, DEFAULTS.showDebugInfo),
        fishEye: lsGet(LS_KEYS.fishEye, DEFAULTS.fishEye),
        orbitSpacing: lsGet(LS_KEYS.orbitSpacing, DEFAULTS.orbitSpacing),
        globalShapeOverride: lsGet(LS_KEYS.globalShapeOverride, DEFAULTS.globalShapeOverride),
        orbitShape: lsGet(LS_KEYS.orbitShape, DEFAULTS.orbitShape),
        orbitRoundness: lsGet(LS_KEYS.orbitRoundness, DEFAULTS.orbitRoundness),
        mouseForce: lsGet(LS_KEYS.mouseForce, DEFAULTS.mouseForce),
        collisionForce: lsGet(LS_KEYS.collisionForce, DEFAULTS.collisionForce),
        damping: lsGet(LS_KEYS.damping, DEFAULTS.damping),
        returnForce: lsGet(LS_KEYS.returnForce, DEFAULTS.returnForce),
        entryStartX: lsGet(LS_KEYS.entryStartX, DEFAULTS.entryStartX),
        entryStartY: lsGet(LS_KEYS.entryStartY, DEFAULTS.entryStartY),
        entryStartZ: lsGet(LS_KEYS.entryStartZ, DEFAULTS.entryStartZ),
        entrySpeed: lsGet(LS_KEYS.entrySpeed, DEFAULTS.entrySpeed),
        grayscaleVideo: lsGet(LS_KEYS.grayscaleVideo, DEFAULTS.grayscaleVideo),
        enableVideoCycle: lsGet(LS_KEYS.enableVideoCycle, DEFAULTS.enableVideoCycle),
        videoCycleVisible: lsGet(LS_KEYS.videoCycleVisible, DEFAULTS.videoCycleVisible),
        videoCycleHidden: lsGet(LS_KEYS.videoCycleHidden, DEFAULTS.videoCycleHidden),
        videoTransition: lsGet(LS_KEYS.videoTransition, DEFAULTS.videoTransition),
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
                lsSet(LS_KEYS[key], value);
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
