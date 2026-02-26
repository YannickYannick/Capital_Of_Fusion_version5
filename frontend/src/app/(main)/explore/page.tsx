"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect, useRef } from "react";
import { getOrganizationNodes } from "@/lib/api";
import type { OrganizationNodeApi } from "@/types/organization";
import { PlanetsOptionsProvider, usePlanetsOptions } from "@/contexts/PlanetsOptionsContext";
import { PlanetOverlay } from "@/components/features/explore/PlanetOverlay";
import { OptionsPanel } from "@/components/features/explore/OptionsPanel";
import { GlobalPlanetConfigPanel } from "@/components/features/explore/GlobalPlanetConfigPanel";
import { DebugPanel } from "@/components/features/explore/DebugPanel";
import { motion, AnimatePresence } from "framer-motion";

// Chargement dynamique de ExploreScene (Three.js) sans SSR
const ExploreScene = dynamic(
  () =>
    import("@/components/features/explore/ExploreScene").then(
      (mod) => ({ default: mod.ExploreScene })
    ),
  { ssr: false }
);

// ─────────────────────────────────────────────────────────
//  Inner page (inside Provider)
// ─────────────────────────────────────────────────────────

function ExplorePageInner() {
  const opts = usePlanetsOptions();
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const [nodes, setNodes] = useState<OrganizationNodeApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<OrganizationNodeApi | null>(null);
  const [overlayNode, setOverlayNode] = useState<OrganizationNodeApi | null>(null);
  const [planetConfigOpen, setPlanetConfigOpen] = useState(false);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

  useEffect(() => {
    getOrganizationNodes()
      .then(setNodes)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur chargement"))
      .finally(() => setLoading(false));
  }, []);

  const visibleNodes = nodes.filter((n) => n.is_visible_3d);

  const handleSelectNode = useCallback((node: OrganizationNodeApi | null) => {
    setSelectedNode(node);
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

  const handleSaved = useCallback(() => {
    // Après sauvegarde, rejouer l'intro pour mettre à jour la scène
    opts.triggerRestart();
  }, [opts]);

  return (
    // Wrapper fullscreen — le canvas 3D est transparent, les vidéos sont en -z-10 dessous
    <div className="fixed inset-0 z-10">
      {/* La vidéo est gérée globalement dans layout.tsx (GlobalVideoBackground) */}

      {/* Chargement */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-10 h-10 rounded-full border-2 border-purple-500/40 border-t-purple-500 animate-spin" />
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl bg-red-900/60 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Canvas 3D */}
      {!loading && !error && visibleNodes.length > 0 && (
        <ExploreScene
          nodes={visibleNodes}
          onOpenOverlay={handleOpenOverlay}
          onSelectNode={handleSelectNode}
          controlsRef={controlsRef}
          cameraRef={cameraRef}
        />
      )}

      {/* Barre d'action planète sélectionnée (centre, z-30) */}
      <AnimatePresence>
        {selectedNode && !overlayNode && (
          <motion.div
            key="action-bar"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 px-6 py-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col items-center gap-3 min-w-[260px]"
          >
            <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">Sélectionné</p>
            <p className="text-white text-3xl font-bold text-center">{selectedNode.name}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleOpenOverlay(selectedNode)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all hover:scale-105 shadow-lg shadow-purple-500/20 flex items-center gap-2"
              >
                ↗ Détails
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition border border-white/10 flex items-center gap-2"
              >
                ← Retour
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panneau Options (droite, z-20) */}
      <OptionsPanel onOpenPlanetConfig={() => setPlanetConfigOpen(true)} />

      {/* Panneau Config Planètes (slide-in droite, z-50) */}
      <GlobalPlanetConfigPanel
        nodes={nodes}
        isOpen={planetConfigOpen}
        onClose={() => setPlanetConfigOpen(false)}
        onSaved={handleSaved}
        apiBaseUrl={apiBaseUrl}
      />

      {/* Debug Panel (gauche, z-20) */}
      {opts.showDebugInfo && (
        <DebugPanel controlsRef={controlsRef} cameraRef={cameraRef} />
      )}

      {/* Hint Navigation (bas-gauche, z-20) */}
      <div className="fixed bottom-8 left-8 z-20 text-white/30 text-xs leading-relaxed select-none pointer-events-none">
        <p>• Clic gauche + glisser : Rotation</p>
        <p>• Clic droit + glisser : Panoramique</p>
        <p>• Molette : Zoom</p>
        <p>• Clic planète : Figer + Zoomer</p>
        <p>• Double-clic : Réinitialiser</p>
      </div>

      {/* Overlay détails planète (z-50) */}
      <PlanetOverlay node={overlayNode} onClose={handleCloseOverlay} />

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
  return (
    <PlanetsOptionsProvider>
      <ExplorePageInner />
    </PlanetsOptionsProvider>
  );
}
