"use client";

/**
 * Page Structures partenaires — annuaire des noeuds partenaires (GET /api/partners/nodes/?for_structure=1).
 * Layout : StandardPageShell + StandardPageHero.
 */
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getPartnerNodesForStructure } from "@/lib/api";
import type { PartnerNodeApi } from "@/types/partner";
import { PartnerNodeCard } from "@/components/features/partners/PartnerNodeCard";
import { PartnerQuickAddModal } from "@/components/features/partners/PartnerQuickAddModal";
import { AnimatedDiv } from "@/components/shared/AnimatedDiv";
import Link from "next/link";
import { StandardPageShell, StandardPageHero } from "@/components/shared/StandardPage";
import { useAuth } from "@/contexts/AuthContext";
import { isStaffOrSuperuser } from "@/lib/staffAccess";

export default function PartenairesStructuresPage() {
  const t = useTranslations("pages");
  const { user } = useAuth();
  const [nodes, setNodes] = useState<PartnerNodeApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const fetchNodes = useCallback(() => {
    setLoading(true);
    getPartnerNodesForStructure()
      .then(setNodes)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  const isStaff = isStaffOrSuperuser(user);

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
            {t("partnerStructures.backToPartners")}
          </Link>
        </div>

        <StandardPageHero
          eyebrow={t("partnerStructures.eyebrow")}
          title={t("partnerStructures.titleBefore")}
          highlight={t("partnerStructures.titleHighlight")}
          description={t("partnerStructures.subtitle")}
        />

        {isStaff && (
          <div className="mb-8 flex justify-center">
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/15 px-6 py-3 text-sm font-bold text-amber-200 hover:bg-amber-500/25 transition"
            >
              {t("partnerStructures.addButton")}
            </button>
          </div>
        )}

        <PartnerQuickAddModal
          mode="structure"
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onCreated={fetchNodes}
        />

        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] text-red-500 text-center">
            <p className="text-2xl font-black mb-2 uppercase italic tracking-tighter">{t("partnerStructures.errorTitle")}</p>
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
            <p className="text-3xl font-black tracking-widest uppercase italic">{t("partnerStructures.emptyTitle")}</p>
            <p className="text-xs mt-4 tracking-[0.3em] font-light">{t("partnerStructures.emptySubtitle")}</p>
          </div>
        )}
      </div>
    </StandardPageShell>
  );
}
