"use client";

import { useState, useEffect } from "react";
import { getOrganizationNodes } from "@/lib/api";
import type { OrganizationNodeApi } from "@/types/organization";
import { ExploreScene } from "@/components/features/explore/ExploreScene";
import { PlanetOverlay } from "@/components/features/explore/PlanetOverlay";

/**
 * Explore — scène 3D (noeuds = planètes) + fallback liste/arbre.
 * Données : GET /api/organization/nodes/
 * Clic planète ou entrée liste → overlay détail (NodeEvents).
 */
export default function ExplorePage() {
  const [nodes, setNodes] = useState<OrganizationNodeApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<OrganizationNodeApi | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"3d" | "list">("3d");

  useEffect(() => {
    getOrganizationNodes()
      .then(setNodes)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  const visibleNodes = nodes.filter((n) => n.is_visible_3d);

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white">Explore</h1>
        <p className="mt-2 text-white/70">
          Découvrez les pôles et acteurs — vue 3D ou liste.
        </p>

        <div className="mt-4 flex gap-2" role="group" aria-label="Choisir le mode d’affichage">
          <button
            type="button"
            onClick={() => setViewMode("3d")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e27] ${
              viewMode === "3d"
                ? "bg-purple-600 text-white"
                : "bg-white/10 text-white/80 hover:bg-white/15"
            }`}
            aria-pressed={viewMode === "3d"}
          >
            Vue 3D
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e27] ${
              viewMode === "list"
                ? "bg-purple-600 text-white"
                : "bg-white/10 text-white/80 hover:bg-white/15"
            }`}
            aria-pressed={viewMode === "list"}
            aria-describedby="list-view-a11y-hint"
          >
            Vue liste
          </button>
        </div>
        <p id="list-view-a11y-hint" className="sr-only">
          La vue liste permet d’accéder à tous les pôles au clavier et aux technologies d’assistance.
        </p>

        {error && (
          <p className="mt-4 text-red-400" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-8 text-white/60">Chargement…</p>
        ) : visibleNodes.length === 0 ? (
          <p className="mt-8 text-white/60">
            Aucun noeud à afficher pour le moment.
          </p>
        ) : (
          <>
            {viewMode === "3d" && (
              <div className="mt-6" aria-hidden="true">
                <ExploreScene
                  nodes={visibleNodes}
                  onSelectNode={setSelectedNode}
                />
                <p className="sr-only">
                  Vue 3D : utilisation à la souris. Pour une navigation au clavier, utilisez l’onglet « Vue liste ».
                </p>
              </div>
            )}
            {viewMode === "list" && (
              <ul className="mt-6 space-y-2" role="list" aria-label="Liste des pôles et acteurs">
                {visibleNodes.map((node) => (
                  <li key={node.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedNode(node)}
                      className="w-full text-left px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e27]"
                      aria-label={`Voir le détail : ${node.name}`}
                    >
                      <span className="font-medium text-white">{node.name}</span>
                      {node.short_description && (
                        <p className="text-sm text-white/60 mt-0.5">
                          {node.short_description}
                        </p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {selectedNode && (
        <PlanetOverlay
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}
