"use client";

import { useEffect, useRef, useCallback } from "react";

export interface ExplorePerformanceMetrics {
  pageLoadStart: number;
  nodesApiMs: number | null;   // temps de réponse GET /api/organization/nodes/
  canvasInitMs: number | null;
  firstFrameMs: number | null;
  sceneReadyMs: number | null;
  planetsLoadedMs: number | null;
  /** Temps (depuis page load) jusqu'à ce que toutes les planètes soient en orbite (fin de l'animation d'entrée). */
  entryPhaseDoneMs: number | null;
  /** Structure : temps entre canvas prêt et première frame (scene graph + meshes + orbites). */
  structureMs: number | null;
  /** Trajectoires : temps CPU cumulé passé dans les calculs d'entrée (useFrame phase entrée). */
  trajectoryCpuMs: number | null;
  avgFps: number | null;
  minFps: number | null;
  maxFps: number | null;
  frameCount: number;
  totalRenderTime: number;
}

interface UseExplorePerformanceOptions {
  debug?: boolean;
  trackFps?: boolean;
  fpsSampleDuration?: number; // en secondes
  onMetricsReady?: (metrics: ExplorePerformanceMetrics) => void;
}

const PERF_KEY = "explore_perf_metrics";

export function useExplorePerformance(options: UseExplorePerformanceOptions = {}) {
  const { debug = false, trackFps = true, fpsSampleDuration = 5, onMetricsReady } = options;

  const metricsRef = useRef<ExplorePerformanceMetrics>({
    pageLoadStart: performance.now(),
    nodesApiMs: null,
    canvasInitMs: null,
    firstFrameMs: null,
    sceneReadyMs: null,
    planetsLoadedMs: null,
    entryPhaseDoneMs: null,
    structureMs: null,
    trajectoryCpuMs: null,
    avgFps: null,
    minFps: null,
    maxFps: null,
    frameCount: 0,
    totalRenderTime: 0,
  });

  const fpsHistory = useRef<number[]>([]);
  const lastFrameTime = useRef<number>(0);
  const fpsSampleStart = useRef<number | null>(null);
  const isTracking = useRef(false);
  const rafId = useRef<number | null>(null);

  const log = useCallback((message: string, data?: unknown) => {
    if (debug) {
      console.log(`[ExplorePerf] ${message}`, data ?? "");
    }
  }, [debug]);

  // Temps de réponse de l'API nœuds (GET /api/organization/nodes/)
  const setNodesApiMs = useCallback((ms: number) => {
    if (metricsRef.current.nodesApiMs != null) return; // garder la 1ère valeur
    metricsRef.current.nodesApiMs = ms;
    log("Nodes API loaded", { nodesApiMs: `${ms.toFixed(0)} ms` });
  }, [log]);

  // Marquer le début de l'initialisation du Canvas
  const markCanvasInit = useCallback(() => {
    performance.mark("explore-canvas-init");
    log("Canvas initialization started");
  }, [log]);

  // Marquer quand le Canvas est prêt (contexte WebGL créé)
  const markCanvasReady = useCallback(() => {
    performance.mark("explore-canvas-ready");
    const initTime = performance.now() - metricsRef.current.pageLoadStart;
    metricsRef.current.canvasInitMs = initTime;
    log("Canvas ready", { canvasInitMs: initTime.toFixed(2) });
  }, [log]);

  // Marquer la première frame rendue
  const markFirstFrame = useCallback(() => {
    if (metricsRef.current.firstFrameMs !== null) return; // déjà marqué
    
    performance.mark("explore-first-frame");
    const time = performance.now() - metricsRef.current.pageLoadStart;
    metricsRef.current.firstFrameMs = time;
    log("First frame rendered", { firstFrameMs: time.toFixed(2) });

    // Commencer le tracking FPS après la première frame
    if (trackFps && !isTracking.current) {
      isTracking.current = true;
      fpsSampleStart.current = performance.now();
      lastFrameTime.current = performance.now();
      trackFrameRate();
    }
  }, [log, trackFps]);

  // Marquer quand toutes les planètes sont chargées (on ne garde que la 1ère valeur < 60s pour éviter les rappels tardifs)
  const markPlanetsLoaded = useCallback((count: number) => {
    const time = performance.now() - metricsRef.current.pageLoadStart;
    const prev = metricsRef.current.planetsLoadedMs;
    if (prev != null && time > 60000) return; // ignorer les rappels après 60s (re-renders)
    if (prev != null && time > prev) return;   // garder la première valeur
    performance.mark("explore-planets-loaded");
    metricsRef.current.planetsLoadedMs = time;
    log("All planets loaded", { planetsLoadedMs: `${time.toFixed(0)} ms`, count });
  }, [log]);

  // Marquer quand la scène est complètement prête
  const markSceneReady = useCallback(() => {
    performance.mark("explore-scene-ready");
    const time = performance.now() - metricsRef.current.pageLoadStart;
    metricsRef.current.sceneReadyMs = time;
    log("Scene fully ready", { sceneReadyMs: time.toFixed(2) });
  }, [log]);

  // Marquer quand toutes les planètes sont en orbite (fin de l'animation d'entrée / physique au démarrage)
  const markAllPlanetsOnOrbit = useCallback((trajectoryCpuMs?: number) => {
    if (metricsRef.current.entryPhaseDoneMs != null) return;
    performance.mark("explore-all-planets-on-orbit");
    const time = performance.now() - metricsRef.current.pageLoadStart;
    metricsRef.current.entryPhaseDoneMs = time;
    if (typeof trajectoryCpuMs === "number") {
      metricsRef.current.trajectoryCpuMs = trajectoryCpuMs;
    }
    // Structure = temps entre canvas prêt et première frame
    const { canvasInitMs, firstFrameMs } = metricsRef.current;
    if (canvasInitMs != null && firstFrameMs != null) {
      metricsRef.current.structureMs = firstFrameMs - canvasInitMs;
    }
    log("All planets on orbit (entry phase done)", { entryPhaseDoneMs: `${time.toFixed(0)} ms`, trajectoryCpuMs });
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log("[ExplorePerf] Phase d'entrée terminée — toutes les planètes en orbite en", `${time.toFixed(0)} ms`, trajectoryCpuMs != null ? `(CPU trajectoires: ${trajectoryCpuMs.toFixed(0)} ms)` : "");
    }
  }, [log]);

  // Tracker le FPS pendant une durée donnée
  const trackFrameRate = useCallback(() => {
    const now = performance.now();
    const elapsed = now - (fpsSampleStart.current ?? now);

    if (elapsed < fpsSampleDuration * 1000) {
      // Calculer le FPS de cette frame
      const delta = now - lastFrameTime.current;
      if (delta > 0) {
        const fps = 1000 / delta;
        fpsHistory.current.push(fps);
        metricsRef.current.frameCount++;
        metricsRef.current.totalRenderTime += delta;
      }
      lastFrameTime.current = now;
      rafId.current = requestAnimationFrame(trackFrameRate);
    } else {
      // Fin du sampling
      finalizeFpsMetrics();
    }
  }, [fpsSampleDuration]);

  const finalizeFpsMetrics = useCallback(() => {
    const fps = fpsHistory.current;
    if (fps.length === 0) return;

    const avg = fps.reduce((a, b) => a + b, 0) / fps.length;
    const min = Math.min(...fps);
    const max = Math.max(...fps);

    metricsRef.current.avgFps = avg;
    metricsRef.current.minFps = min;
    metricsRef.current.maxFps = max;

    log("FPS metrics finalized", {
      avgFps: avg.toFixed(1),
      minFps: min.toFixed(1),
      maxFps: max.toFixed(1),
      frameCount: metricsRef.current.frameCount,
    });

    // Sauvegarder les métriques
    const metrics = { ...metricsRef.current };
    localStorage.setItem(PERF_KEY, JSON.stringify(metrics));

    // Callback
    onMetricsReady?.(metrics);

    // Log final en console (toujours visible, même sans debug)
    const m = metricsRef.current;
    const structureMs = m.structureMs ?? (m.firstFrameMs != null && m.canvasInitMs != null ? m.firstFrameMs - m.canvasInitMs : null);
    console.table({
      "Nodes API (GET /nodes/)": `${m.nodesApiMs?.toFixed(0) ?? "N/A"} ms`,
      "Page Load → Canvas Init": `${m.canvasInitMs?.toFixed(0) ?? "N/A"} ms`,
      "Structure (canvas → 1ère frame)": `${structureMs != null ? structureMs.toFixed(0) : "N/A"} ms`,
      "Lumière (setup, inclus Structure)": "incluse",
      "Trajectoires (CPU cumulé)": `${m.trajectoryCpuMs?.toFixed(0) ?? "N/A"} ms`,
      "Page Load → First Frame": `${m.firstFrameMs?.toFixed(0) ?? "N/A"} ms`,
      "Page Load → Scene Ready": `${m.sceneReadyMs?.toFixed(0) ?? "N/A"} ms`,
      "Page Load → Planets Loaded": `${m.planetsLoadedMs?.toFixed(0) ?? "N/A"} ms`,
      "Page Load → All planets on orbit": `${m.entryPhaseDoneMs?.toFixed(0) ?? "N/A"} ms`,
      "Average FPS": `${avg.toFixed(1)} fps`,
      "Min FPS": `${min.toFixed(1)} fps`,
      "Max FPS": `${max.toFixed(1)} fps`,
      "Frames sampled": m.frameCount,
    });
  }, [log, onMetricsReady]);

  // Enregistrer un temps de frame (appelé depuis useFrame dans R3F)
  const recordFrame = useCallback((deltaMs: number) => {
    metricsRef.current.frameCount++;
    metricsRef.current.totalRenderTime += deltaMs;
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  // Récupérer les dernières métriques sauvegardées
  const getLastMetrics = useCallback((): ExplorePerformanceMetrics | null => {
    try {
      const saved = localStorage.getItem(PERF_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  return {
    setNodesApiMs,
    markCanvasInit,
    markCanvasReady,
    markFirstFrame,
    markPlanetsLoaded,
    markSceneReady,
    markAllPlanetsOnOrbit,
    recordFrame,
    getLastMetrics,
    metrics: metricsRef.current,
  };
}
