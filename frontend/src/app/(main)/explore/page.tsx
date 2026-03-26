"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect, useRef, startTransition, useDeferredValue } from "react";
import { getOrganizationNodes, getSiteConfig } from "@/lib/api";
import type { OrganizationNodeApi } from "@/types/organization";
import { usePlanetsOptions } from "@/contexts/PlanetsOptionsContext";
import { usePlanetMusicOverride } from "@/contexts/PlanetMusicOverrideContext";
import { useAuth } from "@/contexts/AuthContext";
import { PlanetOverlay } from "@/components/features/explore/components/PlanetOverlay";
import { OptionsPanel } from "@/components/features/explore/components/OptionsPanel";
import { GlobalPlanetConfigPanel } from "@/components/features/explore/components/GlobalPlanetConfigPanel";
import { DebugPanel } from "@/components/features/explore/components/DebugPanel";
import { useExplorePerformance } from "@/hooks/useExplorePerformance";
import { prefetchExploreModules } from "@/hooks/usePrefetchExplore";
import { ExploreLoadingModal } from "@/components/features/explore/components/ExploreLoadingModal";

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

function ExplorePageInner() {
  const opts = usePlanetsOptions();
  const { setBatch, showExploreLoadingModal, isTransitioningToExplore } = opts;
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const [nodes, setNodes] = useState<OrganizationNodeApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<OrganizationNodeApi | null>(null);
  const [selectedPlanetScreenPos, setSelectedPlanetScreenPos] = useState<{ x: number; y: number } | null>(null);
  const [overlayNode, setOverlayNode] = useState<OrganizationNodeApi | null>(null);
  const [planetConfigOpen, setPlanetConfigOpen] = useState(false);
  
  // Solution 1: Différer le montage de Three.js après le FCP
  const [mountScene, setMountScene] = useState(false);
  
  // Solution 3: useDeferredValue pour ne pas bloquer l'UI pendant le rendu 3D
  const deferredNodes = useDeferredValue(nodes);

  // Performance monitoring
  const perf = useExplorePerformance({ 
    debug: process.env.NODE_ENV === "development",
    trackFps: true,
    fpsSampleDuration: 5,
  });

  const { setOverride: setPlanetMusicOverride } = usePlanetMusicOverride();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

  useEffect(() => {
    if (!selectedNode) setSelectedPlanetScreenPos(null);
  }, [selectedNode]);

  // Musique de fond planète : activer quand l'overlay s'ouvre sur un nœud avec musique, désactiver à la fermeture
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
    // Charger les données en parallèle (une seule fois au montage)
    Promise.all([
      getOrganizationNodes().then((data) => {
        perf.setNodesApiMs(performance.now() - t0);
        return data;
      }),
      getSiteConfig()
    ]).then(([nodesData, config]) => {
      startTransition(() => {
        setNodes(nodesData);
        if (config.explore_config) {
          const raw = config.explore_config as unknown as Record<string, unknown>;
          const { id, name, created_at, updated_at, ...rest } = raw;
          // Ne jamais écraser les flags de transition depuis la config DB
          const visualOptions = { ...rest };
          delete (visualOptions as Record<string, unknown>)['isTransitioningToExplore'];
          delete (visualOptions as Record<string, unknown>)['showExploreLoadingModal'];
          setBatch(visualOptions as Parameters<typeof setBatch>[0]);
        }
      });
    }).catch((e) => {
      setError(e instanceof Error ? e.message : "Erreur chargement");
    }).finally(() => {
      setLoading(false);
    });
    // setBatch uniquement : ne pas mettre perf en deps (objet recréé chaque rendu → boucle de requêtes)
  }, [setBatch]);

  // Réinitialiser les flags de transition si on quitte /explore avant la fin du chargement.
  // On utilise un ref pour éviter que React Strict Mode (double mount/unmount en dev)
  // ne réinitialise les flags lors du premier cycle unmount.
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

  // Fin de transition : scène 3D prête à être montée
  // On ferme seulement isTransitioningToExplore, mais PAS la modale — l'utilisateur doit cliquer "Compris"
  useEffect(() => {
    if (!mountScene) return;
    setBatch({ isTransitioningToExplore: false });
  }, [mountScene, setBatch]);

  // Callback pour fermer manuellement la modale (bouton "Compris")
  const handleDismissModal = useCallback(() => {
    setBatch({ showExploreLoadingModal: false });
  }, [setBatch]);

  // Erreur : ne pas laisser la modale bloquer
  useEffect(() => {
    if (!showExploreLoadingModal) return;
    if (error) {
      setBatch({ isTransitioningToExplore: false, showExploreLoadingModal: false });
    }
  }, [showExploreLoadingModal, error, setBatch]);

  // Sécurité : fermer après 45s même si le canvas ne monte pas
  useEffect(() => {
    if (!showExploreLoadingModal) return;
    const id = window.setTimeout(() => {
      setBatch({ isTransitioningToExplore: false, showExploreLoadingModal: false });
    }, 45000);
    return () => window.clearTimeout(id);
  }, [showExploreLoadingModal, setBatch]);

  // Monter la scène juste après le prochain paint (double rAF) pour éviter l’attente requestIdleCallback
  // tout en laissant le navigateur finir la mise en page ; startTransition garde le rendu 3D non-bloquant.
  useEffect(() => {
    if (!loading && !error && nodes.length > 0 && !mountScene) {
      perf.markCanvasInit();

      const mount = () => {
        startTransition(() => {
          setMountScene(true);
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
    }
  }, [loading, error, nodes.length, mountScene, perf]);

  // Solution 3: Utiliser les nodes différés pour le rendu 3D (ne bloque pas l'UI)
  const visibleNodes = deferredNodes.filter((n) => n.is_visible_3d);

  const handleSelectNode = useCallback((node: OrganizationNodeApi | null) => {
    setSelectedNode(node);
  }, []);

  const handleSelectedPlanetScreenPosition = useCallback((x: number, y: number) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const margin = 80;
    const w = typeof window !== "undefined" ? window.innerWidth : 1920;
    const h = typeof window !== "undefined" ? window.innerHeight : 1080;
    setSelectedPlanetScreenPos({
      x: Math.max(margin, Math.min(w - margin, x)),
      y: Math.max(margin, Math.min(h - margin, y)),
    });
  }, []);

  const handleOpenOverlay = useCallback((node: OrganizationNodeApi) => {
    setOverlayNode(node);
  }, []);

  const handleCloseOverlay = useCallback(() => {
    setOverlayNode(null);
  }, []);

  const handleReset = useCallback(() => {
    setSelectedNode(null);
    opts.triggerReset();
    opts.set("freezePlanets", false);
  }, [opts]);

  const { user } = useAuth();
  const isAdmin = user?.user_type === "ADMIN";
  const canEditDescriptions = user?.user_type === "STAFF" || user?.user_type === "ADMIN";
  const handleNodeUpdated = useCallback((updatedNode: OrganizationNodeApi) => {
    setOverlayNode(updatedNode);
    setNodes((prev) => prev.map((n) => (n.id === updatedNode.id ? updatedNode : n)));
  }, []);

  const handleSaved = useCallback(() => {
    // Après sauvegarde, rejouer l'intro pour mettre à jour la scène
    opts.triggerRestart();
  }, [opts]);

  return (
    // Wrapper fullscreen — le canvas 3D est transparent, les vidéos sont en -z-10 dessous
    <div className="fixed inset-0 z-10">
      {/* La vidéo est gérée globalement dans layout.tsx (GlobalVideoBackground) */}

      {(showExploreLoadingModal || isTransitioningToExplore) && (
        <ExploreLoadingModal onDismiss={handleDismissModal} />
      )}

      {/* Skeleton sous la modale (z-25) : feedback visuel même pendant la transition */}
      {!mountScene && (
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

      {/* Erreur */}
      {error && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl bg-red-900/60 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Canvas 3D - z-0 pour rester sous les panneaux (Options, Debug, etc.) */}
      {mountScene && !error && visibleNodes.length > 0 && (
        <div className="absolute inset-0 z-0">
          <ExploreScene
          nodes={visibleNodes}
          onOpenOverlay={handleOpenOverlay}
          onSelectNode={handleSelectNode}
          onSelectedPlanetScreenPosition={handleSelectedPlanetScreenPosition}
          controlsRef={controlsRef}
          cameraRef={cameraRef}
          onFirstFrame={perf.markFirstFrame}
          onSceneReady={perf.markSceneReady}
          onPlanetsLoaded={(count) => perf.markPlanetsLoaded(count)}
          onAllPlanetsOnOrbit={perf.markAllPlanetsOnOrbit}
          />
        </div>
      )}

      {/* Barre d'action planète sélectionnée — centre du cadre aligné sur la planète (fallback: bas centré) */}
      {selectedNode && !overlayNode && (
        <div
          className="fixed z-30 pointer-events-none"
          style={
            selectedPlanetScreenPos != null
              ? {
                  left: selectedPlanetScreenPos.x,
                  top: selectedPlanetScreenPos.y,
                  transform: "translate(-50%, -50%)",
                }
              : {
                  bottom: "6rem",
                  left: "50%",
                  transform: "translateX(-50%)",
                }
          }
        >
          <div className="pointer-events-auto px-8 py-6 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col items-center gap-4 min-w-[340px] max-w-[90vw] animate-fadeInScale">
            <p className="text-white/40 text-sm uppercase tracking-widest font-semibold">Sélectionné</p>
            <p className="text-white text-4xl font-bold text-center leading-tight">{selectedNode.name}</p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleOpenOverlay(selectedNode)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-base font-semibold transition-all hover:scale-105 shadow-lg shadow-purple-500/20 flex items-center gap-2"
              >
                ↗ Détails
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-base font-medium transition border border-white/10 flex items-center gap-2"
              >
                ← Retour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Options 3D, Config planètes et Debug caméra : visibles uniquement pour les comptes admin */}
      {isAdmin && (
        <OptionsPanel onOpenPlanetConfig={() => setPlanetConfigOpen(true)} nodes={nodes} />
      )}
      {isAdmin && (
        <GlobalPlanetConfigPanel
          nodes={nodes}
          isOpen={planetConfigOpen}
          onClose={() => setPlanetConfigOpen(false)}
          onSaved={handleSaved}
          apiBaseUrl={apiBaseUrl}
        />
      )}

      {isAdmin && opts.showDebugInfo && (
        <DebugPanel controlsRef={controlsRef} cameraRef={cameraRef} />
      )}

      {/* Hint Navigation (bas-gauche) — masquée pendant la transition */}
      {!showExploreLoadingModal && !isTransitioningToExplore && (
        <div className="fixed bottom-8 left-8 z-20 text-white/30 text-xs leading-relaxed select-none pointer-events-none">
          <p>• Clic gauche + glisser : Rotation</p>
          <p>• Clic droit + glisser : Panoramique</p>
          <p>• Molette : Zoom</p>
          <p>• Clic planète : Figer + Zoomer</p>
          <p>• Double-clic : Réinitialiser</p>
        </div>
      )}

      {/* Overlay détails planète (z-50) */}
      <PlanetOverlay
        node={overlayNode}
        onClose={handleCloseOverlay}
        canEditDescriptions={canEditDescriptions}
        onNodeUpdated={handleNodeUpdated}
      />

      {/* Accessible fallback liste (screen readers) */}
      <ul className="sr-only" aria-label="Liste des planètes">
        {visibleNodes.map((node) => (
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

// ─────────────────────────────────────────────────────────
//  Page principale (wrappée dans le Provider)
// ─────────────────────────────────────────────────────────

/**
 * Page /explore — Canvas 3D fullscreen avec planètes, physique et overlays.
 * Le fond vidéo est géré par le layout parent (z-0).
 */
export default function ExplorePage() {
  /** Même PlanetsOptionsProvider que le layout (accueil / menu) pour conserver les flags de transition. */
  return <ExplorePageInner />;
}
