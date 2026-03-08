"use client";

/**
 * Annuaire des nœuds d'organisation — style /artistes.
 * Liste tous les nœuds (API for_structure=1), cartes vers /organisation/noeuds/[slug].
 */
import { useEffect, useState } from "react";
import { getOrganizationNodesForStructure } from "@/lib/api";
import type { OrganizationNodeApi } from "@/types/organization";
import { NodeCard } from "@/components/features/organisation/NodeCard";
import { motion } from "framer-motion";
import Link from "next/link";

export default function NoeudsPage() {
  const [nodes, setNodes] = useState<OrganizationNodeApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOrganizationNodesForStructure()
      .then(setNodes)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  if (loading && nodes.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-24 px-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <Link
            href="/organisation"
            className="text-white/40 hover:text-white text-sm uppercase tracking-widest font-bold mb-6 inline-block transition-colors"
          >
            ← Organisation
          </Link>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-6xl font-black tracking-tighter mb-4 italic">
              NOS <span className="text-purple-500">NŒUDS</span>
            </h1>
            <p className="text-xl text-white/60 max-w-xl font-light leading-relaxed">
              Pôles, antennes et communautés de Capital of Fusion. Découvrez les cours et événements près de chez vous.
            </p>
          </motion.div>
        </div>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] text-red-500 text-center">
            <p className="text-2xl font-black mb-2 uppercase italic tracking-tighter">Erreur de connexion</p>
            <p className="text-sm font-light opacity-60">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {nodes.map((node, idx) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <NodeCard node={node} />
              </motion.div>
            ))}
          </div>
        )}

        {!loading && nodes.length === 0 && !error && (
          <div className="text-center py-32 text-white/10 border-2 border-dashed border-white/5 rounded-[3rem]">
            <p className="text-3xl font-black tracking-widest uppercase italic">VIDE</p>
            <p className="text-xs mt-4 tracking-[0.3em] font-light">AUCUN NŒUD POUR LE MOMENT</p>
          </div>
        )}
      </div>
    </div>
  );
}
