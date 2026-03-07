export interface ExplorePresetApi {
    id?: string;
    name: string;
    created_at?: string;
    updated_at?: string;

    // Paramètres 3D (camelCase pour le frontend)
    showOrbits: boolean;
    freezePlanets: boolean;
    showDebugInfo: boolean;
    fishEye: number;
    lightConfig: any;
    orbitSpacing: number;
    globalPlanetScale: number;
    globalShapeOverride: boolean;
    orbitShape: string;
    orbitRoundness: number;
    mouseForce: number;
    collisionForce: number;
    damping: number;
    returnForce: number;
    entryStagger: number;
    entryStartX: number;
    entryStartY: number;
    entryStartZ: number | null;
    entrySpeedStart: number;
    entrySpeedEnd: number;
    entryEasing: string;
    entryDuration: number;
    entryTrajectory: string;
    fanDistance: number;
    orbitSpeedStart: number;
    orbitSpeedTarget: number;
    orbitEasing: string;
    orbitalRampDuration: number;
    globalOrbitSpeed: number;
    grayscaleVideo: boolean;
    enableVideoCycle: boolean;
    videoCycleVisible: number;
    videoCycleHidden: number;
    videoTransition: number;
    showVideoOverlay: boolean;
    showEntryTrajectory: boolean;
    verticalMode: string;
    autoDistributeOrbits: boolean;
    verticalHomogeneousBase: number;
    verticalHomogeneousStep: number;
    verticalJupiterAmplitude: number;
    verticalSphereRadius: number;
    hoverOrbitSpeedRatio: number;
    hoverPlanetSpeedRatio: number;
    hoverOrbitTransitionSpeed: number;
    hoverPlanetTransitionSpeed: number;
    isTransitioningToExplore: boolean;
    autoResetCamera: boolean;
    autoResetDelay: number;

    // Position de la caméra par défaut pour le preset
    cameraX?: number;
    cameraY?: number;
    cameraZ?: number;
    cameraTargetX?: number;
    cameraTargetY?: number;
    cameraTargetZ?: number;
}
