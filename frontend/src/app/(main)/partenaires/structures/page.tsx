"use client";

/**
 * Page Structures partenaires — annuaire des noeuds partenaires (GET /api/partners/nodes/?for_structure=1).
 * Layout : StandardPageShell + StandardPageHero.
 */
import { useEffect, useState } from "react";
import { getPartnerNodesForStructure } from "@/lib/api";
import type { PartnerNodeApi } from "@/types/partner";
import { PartnerNodeCard } from "@/components/features/partners/PartnerNodeCard";
import { AnimatedDiv } from "@/components/shared/AnimatedDiv";
import Link from "next/link";
import { StandardPageShell, StandardPageHero } from "@/components/shared/StandardPage";

export default function PartenairesStructuresPage() {
  const [nodes, setNodes] = useState<PartnerNodeApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPartnerNodesForStructure()
      .then(setNodes)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  if (loading && nodes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <StandardPageShell>
      <div className="max-w-7xl mx-auto text-white">
        <div className="mb-4">
          <Link
            href="/partenaires"
            className="text-white/40 hover:text-white text-sm uppercase tracking-widest font-bold inline-block transition-colors"
          >
            ← Nos partenaires
          </Link>
        </div>

        <StandardPageHero
          eyebrow="Nos partenaires"
          title="Structures"
          highlight="partenaires"
          description="Découvrez les structures partenaires et leurs cours et événements."
        />

        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] text-red-500 text-center">
            <p className="text-2xl font-black mb-2 uppercase italic tracking-tighter">Erreur de connexion</p>
            <p className="text-sm font-light opacity-60">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {nodes.map((node, idx) => (
              <AnimatedDiv
                key={node.id}
                animation="fadeInUp"
                delay={idx * 0.05}
              >
                <PartnerNodeCard node={node} />
              </AnimatedDiv>
            ))}
          </div>
        )}

        {!loading && nodes.length === 0 && !error && (
          <div className="text-center py-32 text-white/10 border-2 border-dashed border-white/5 rounded-[3rem]">
            <p className="text-3xl font-black tracking-widest uppercase italic">VIDE</p>
            <p className="text-xs mt-4 tracking-[0.3em] font-light">AUCUNE STRUCTURE PARTENAIRE POUR LE MOMENT</p>
          </div>
        )}
      </div>
    </StandardPageShell>
  );
}
