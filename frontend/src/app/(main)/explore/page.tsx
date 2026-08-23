"use client";

import dynamic from "next/dynamic";
import { Suspense, useState, useCallback, useEffect, useRef, startTransition, useDeferredValue, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type * as THREE from "three";
import { getOrganizationNodeBySlug, getOrganizationNodes, getSiteConfig } from "@/lib/api";
import type { OrganizationNodeApi } from "@/types/organization";
import { usePlanetsOptions } from "@/contexts/PlanetsOptionsContext";
import { usePlanetMusicOverride } from "@/contexts/PlanetMusicOverrideContext";
import { useAuth } from "@/contexts/AuthContext";
import { PlanetOverlay } from "@/components/features/explore/components/PlanetOverlay";
import { ExploreMobileCarousel } from "@/components/features/explore/components/ExploreMobileCarousel";
import { useExplorePerformance } from "@/hooks/useExplorePerformance";
import { useExploreLayoutMode } from "@/hooks/useExploreCompactLayout";
import { getExploreOrbitNodes } from "@/lib/exploreOrbitNodes";
import { ExploreLoadingModal } from "@/components/features/explore/components/ExploreLoadingModal";

const OptionsPanel = dynamic(
  () => import("@/components/features/explore/components/OptionsPanel").then((m) => ({ default: m.OptionsPanel })),
  { ssr: false, loading: () => null }
);
const GlobalPlanetConfigPanel = dynamic(
  () => import("@/components/features/explore/components/GlobalPlanetConfigPanel").then((m) => ({ default: m.GlobalPlanetConfigPanel })),
  { ssr: false, loading: () => null }
);
const DebugPanel = dynamic(
  () => import("@/components/features/explore/components/DebugPanel").then((m) => ({ default: m.DebugPanel })),
  { ssr: false, loading: () => null }
);

// Chargement dynamique de ExploreScene (Three.js) sans SSR
const ExploreScene = dynamic(
  () =>
    import("@/components/features/explore/canvas/ExploreScene").then(
      (mod) => ({ default: mod.ExploreScene })
    ),
  { ssr: false, loading: () => null }
);

// ─────────────────────────────────────────────────────────
//  Skeleton de chargement (orbites CSS animées)
// ─────────────────────────────────────────────────────────

function ExploreSkeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Soleil central pulsant */}
      <div className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 animate-pulse shadow-lg shadow-amber-500/50" />

      {/* Orbites animées */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border border-white/10 animate-spin"
          style={{
            width: `${80 + i * 60}px`,
            height: `${80 + i * 60}px`,
            animationDuration: `${8 + i * 4}s`,
            animationDirection: i % 2 === 0 ? "reverse" : "normal",
          }}
        >
          {/* Planète sur l'orbite */}
          <div
            className="absolute w-3 h-3 rounded-full bg-purple-500/80 shadow-md shadow-purple-500/50"
            style={{
              top: "50%",
              left: "-6px",
              transform: "translateY(-50%)",
            }}
          />
        </div>
      ))}

      {/* Texte de chargement */}
      <div className="absolute bottom-1/4 text-white/40 text-sm tracking-widest uppercase animate-pulse">
        Initialisation du système solaire...
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  Inner page (inside Provider)
// ─────────────────────────────────────────────────────────

function ExplorePageInner({ initialNodeSlug }: { initialNodeSlug: string | null }) {
  const layoutMode = useExploreLayoutMode();
  const opts = usePlanetsOptions();
  const { setBatch, showExploreLoadingModal, isTransitioningToExplore } = opts;
  const controlsRef = useRef<{ target: THREE.Vector3; update: () => void } | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const [nodes, setNodes] = useState<OrganizationNodeApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overlayNode, setOverlayNode] = useState<OrganizationNodeApi | null>(null);
  const [planetConfigOpen, setPlanetConfigOpen] = useState(false);

  /** Desktop uniquement : canvas WebGL monté. */
  const [webglMounted, setWebglMounted] = useState(false);
  /** Desktop : première frame WebGL rendue (scène visible). */
  const [sceneFirstFrame, setSceneFirstFrame] = useState(false);

  const deferredNodes = useDeferredValue(nodes);

  const perf = useExplorePerformance({
    debug: process.env.NODE_ENV === "development",
    trackFps: true,
    fpsSampleDuration: 5,
  });

  const { setOverride: setPlanetMusicOverride } = usePlanetMusicOverride();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

  useEffect(() => {
    if (!overlayNode || !overlayNode.music_type) {
      setPlanetMusicOverride(null);
      return;
    }
    const base = apiBaseUrl.replace(/\/$/, "");
    if (overlayNode.music_type === "youtube" && overlayNode.music_youtube_url) {
      setPlanetMusicOverride({ type: "youtube", youtubeUrl: overlayNode.music_youtube_url });
      return;
    }
    if (overlayNode.music_type === "file" && overlayNode.music_file) {
      const fileUrl = overlayNode.music_file.startsWith("http") ? overlayNode.music_file : `${base}${overlayNode.music_file.startsWith("/") ? "" : "/"}${overlayNode.music_file}`;
      setPlanetMusicOverride({ type: "file", fileUrl });
      return;
    }
    setPlanetMusicOverride(null);
  }, [overlayNode, apiBaseUrl, setPlanetMusicOverride]);

  useEffect(() => {
    const t0 = performance.now();

    getOrganizationNodes()
      .then((nodesData) => {
        perf.setNodesApiMs(performance.now() - t0);
        startTransition(() => setNodes(nodesData));
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erreur chargement");
      })
      .finally(() => {
        setLoading(false);
      });

    getSiteConfig()
      .then((config) => {
        if (config.explore_config) {
          const raw = config.explore_config as unknown as Record<string, unknown>;
          const visualOptions = { ...raw };
          delete visualOptions.id;
          delete visualOptions.name;
          delete visualOptions.created_at;
          delete visualOptions.updated_at;
          delete visualOptions.isTransitioningToExplore;
          delete visualOptions.showExploreLoadingModal;
          startTransition(() => setBatch(visualOptions as Parameters<typeof setBatch>[0]));
        }
      })
      .catch(() => {});
  }, [setBatch, perf]);

  const isMountedRef = useRef(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      isMountedRef.current = true;
    }, 50);
    return () => {
      clearTimeout(timer);
      if (isMountedRef.current) {
        setBatch({ isTransitioningToExplore: false, showExploreLoadingModal: false });
      }
    };
  }, [setBatch]);

  const exploreContentReady =
    layoutMode !== "unknown" &&
    !loading &&
    !error &&
    nodes.length > 0 &&
    (layoutMode === "compact" || webglMounted);

  /** État « scène prête » pour la modale d'aide (1ère frame desktop ou carrousel monté). */
  const modalSceneReady =
    exploreContentReady && (layoutMode === "compact" || sceneFirstFrame);

  useEffect(() => {
    if (!exploreContentReady) {
      setSceneFirstFrame(false);
    }
  }, [exploreContentReady]);

  useEffect(() => {
    if (!exploreContentReady) return;
    setBatch({ isTransitioningToExplore: false });
  }, [exploreContentReady, setBatch]);

  const handleDismissModal = useCallback(() => {
    setBatch({ showExploreLoadingModal: false });
  }, [setBatch]);

  useEffect(() => {
    if (!showExploreLoadingModal) return;
    if (error) {
      setBatch({ isTransitioningToExplore: false, showExploreLoadingModal: false });
    }
  }, [showExploreLoadingModal, error, setBatch]);

  useEffect(() => {
    if (!showExploreLoadingModal) return;
    const id = window.setTimeout(() => {
      setBatch({ isTransitioningToExplore: false, showExploreLoadingModal: false });
    }, 45000);
    return () => window.clearTimeout(id);
  }, [showExploreLoadingModal, setBatch]);

  // Desktop : monter WebGL après double rAF
  useEffect(() => {
    if (layoutMode !== "wide") return;
    if (loading || error || nodes.length === 0 || webglMounted) return;

    perf.markCanvasInit();

    const mount = () => {
      startTransition(() => {
        setWebglMounted(true);
        perf.markCanvasReady();
      });
    };

    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(mount);
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [layoutMode, loading, error, nodes.length, webglMounted, perf]);

  // Compact : décharger le canvas si on rétrécit la fenêtre
  useEffect(() => {
    if (layoutMode === "compact") {
      setWebglMounted(false);
    }
  }, [layoutMode]);

  const visibleNodes = deferredNodes.filter((n) => n.is_visible_3d);
  const orbitNodes = useMemo(() => getExploreOrbitNodes(visibleNodes), [visibleNodes]);

  const handleSelectNode = useCallback((_node: OrganizationNodeApi | null) => {
    void _node;
  }, []);

  const handleSelectedPlanetScreenPosition = useCallback((_x: number, _y: number) => {
    void _x;
    void _y;
  }, []);

  const handleOpenOverlay = useCallback(async (node: OrganizationNodeApi) => {
    setOverlayNode(node);

    try {
      const full = await getOrganizationNodeBySlug(node.slug);
      setOverlayNode((current) => (current && current.id === node.id ? full : current));
      setNodes((prev) => prev.map((n) => (n.id === full.id ? full : n)));
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[Explore] Échec du chargement détaillé du noeud", node.slug, e);
      }
    }
  }, []);

  const handleCloseOverlay = useCallback(() => {
    setOverlayNode(null);
  }, []);

  const { user } = useAuth();
  const isAdmin = user?.user_type === "ADMIN";
  const canEditDescriptions = user?.user_type === "STAFF" || user?.user_type === "ADMIN";
  const handleNodeUpdated = useCallback((updatedNode: OrganizationNodeApi) => {
    setOverlayNode(updatedNode);
    setNodes((prev) => prev.map((n) => (n.id === updatedNode.id ? updatedNode : n)));
  }, []);

  const handleSaved = useCallback(() => {
    opts.triggerRestart();
  }, [opts]);

  return (
    <div className="fixed inset-0 z-10">
      {(showExploreLoadingModal || isTransitioningToExplore) && (
        <ExploreLoadingModal onDismiss={handleDismissModal} isSceneReady={modalSceneReady} />
      )}

      {!exploreContentReady && (
        <div
          className={
            showExploreLoadingModal || isTransitioningToExplore
              ? "absolute inset-0 z-[12] opacity-35 pointer-events-none transition-opacity duration-300"
              : "absolute inset-0 z-[12] transition-opacity duration-300"
          }
        >
          <ExploreSkeleton />
        </div>
      )}

      {error && (
        <div className="absolute top-24 left-1/2 z-20 -translate-x-1/2 rounded-xl border border-red-500/30 bg-red-900/60 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {exploreContentReady && layoutMode === "wide" && visibleNodes.length > 0 && (
        <div
          className={`absolute inset-0 z-0 ${planetConfigOpen ? "pointer-events-none" : ""}`}
        >
          <ExploreScene
            nodes={visibleNodes}
            onOpenOverlay={handleOpenOverlay}
            onSelectNode={handleSelectNode}
            onSelectedPlanetScreenPosition={handleSelectedPlanetScreenPosition}
            controlsRef={controlsRef}
            cameraRef={cameraRef}
            onFirstFrame={() => {
              perf.markFirstFrame();
              setSceneFirstFrame(true);
            }}
            onSceneReady={perf.markSceneReady}
            onPlanetsLoaded={(count) => perf.markPlanetsLoaded(count)}
            onAllPlanetsOnOrbit={perf.markAllPlanetsOnOrbit}
          />
        </div>
      )}

      {exploreContentReady && layoutMode === "compact" && (
        <div className={`absolute inset-0 z-0 ${planetConfigOpen ? "pointer-events-none" : ""}`}>
          <ExploreMobileCarousel
            nodes={orbitNodes}
            onOpenPlanet={handleOpenOverlay}
            initialNodeSlug={initialNodeSlug}
            reversePlanetOrder
          />
        </div>
      )}

      {isAdmin && (
        <OptionsPanel onOpenPlanetConfig={() => setPlanetConfigOpen(true)} nodes={nodes} />
      )}
      {isAdmin && (
        <GlobalPlanetConfigPanel
          nodes={nodes}
          isOpen={planetConfigOpen}
          onClose={() => setPlanetConfigOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {isAdmin && layoutMode === "wide" && opts.showDebugInfo && (
        <DebugPanel controlsRef={controlsRef} cameraRef={cameraRef} />
      )}

      <PlanetOverlay
        node={overlayNode}
        onClose={handleCloseOverlay}
        canEditDescriptions={canEditDescriptions}
        onNodeUpdated={handleNodeUpdated}
      />

      <ul className="sr-only" aria-label="Liste des planètes">
        {orbitNodes.map((node) => (
          <li key={node.id}>
            <button type="button" onClick={() => handleOpenOverlay(node)}>
              {node.name}: {node.short_description}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExplorePageWithSearchParams() {
  const searchParams = useSearchParams();
  const nodeParam = searchParams.get("node");
  return <ExplorePageInner initialNodeSlug={nodeParam} />;
}

/**
 * Page /explore — Canvas 3D (grand écran) ou carrousel 2.5D (compact), même données et overlay.
 * Le fond vidéo est géré par le layout parent (z-0).
 */
export default function ExplorePage() {
  return (
    <Suspense fallback={<ExplorePageInner initialNodeSlug={null} />}>
      <ExplorePageWithSearchParams />
    </Suspense>
  );
}
