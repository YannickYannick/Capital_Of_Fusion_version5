"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getPoles } from "@/lib/api";
import type { PoleApi } from "@/types/organization";
import { AnimatedDiv } from "@/components/shared/AnimatedDiv";
import { StandardPageShell, StandardPageHero } from "@/components/shared/StandardPage";

/**
 * Page Organisation / Pôles — liste des pôles avec le nombre de membres (staff/admin).
 * Les comptes sont rattachés aux pôles dans l’admin Django (Utilisateurs > Pôle).
 */
export default function PolesPage() {
  const t = useTranslations("pages");
  const [poles, setPoles] = useState<PoleApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPoles()
      .then(setPoles)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  if (loading && poles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <StandardPageShell>
      <div className="max-w-4xl mx-auto text-white">
        <StandardPageHero
          eyebrow={t("organisationPoles.eyebrow")}
          title={t("organisationPoles.titleBefore")}
          highlight={t("organisationPoles.titleHighlight")}
          description={t("organisationPoles.subtitle")}
        />

        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] text-red-500 text-center">
            <p className="text-2xl font-black mb-2 uppercase italic tracking-tighter">{t("organisationPoles.errorTitle")}</p>
            <p className="text-sm font-light opacity-60">{error}</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {poles.map((pole, idx) => (
              <AnimatedDiv
                key={pole.id}
                animation="fadeInUp"
                delay={idx * 0.04}
                className="flex items-center justify-between gap-6 py-5 px-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors"
              >
                <span className="text-lg font-semibold text-white">{pole.name}</span>
                <span className="text-sm text-white/50 tabular-nums">
                  {pole.members_count} {pole.members_count === 1 ? t("organisationPoles.membersSingular") : t("organisationPoles.membersPlural")}
                </span>
              </AnimatedDiv>
            ))}
          </ul>
        )}

        {!loading && poles.length === 0 && !error && (
          <div className="text-center py-32 text-white/10 border-2 border-dashed border-white/5 rounded-[3rem]">
            <p className="text-3xl font-black tracking-widest uppercase italic">{t("organisationPoles.emptyTitle")}</p>
            <p className="text-xs mt-4 tracking-[0.3em] font-light">{t("organisationPoles.emptySubtitle")}</p>
          </div>
        )}
      </div>
    </StandardPageShell>
  );
}
