"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getStaffMembers, getPoles } from "@/lib/api";
import type { StaffMemberApi, PoleApi } from "@/types/organization";
import { StaffCard } from "@/components/features/organisation/StaffCard";
import { AnimatedDiv } from "@/components/shared/AnimatedDiv";
import { StandardPageShell, StandardPageHero } from "@/components/shared/StandardPage";

/**
 * Page Organisation / Staff — liste des membres du staff (UX proche de /artistes).
 * Filtre par pôle (Tous + liste des pôles). Données : User STAFF/ADMIN via API organization/staff.
 */
export default function StaffPage() {
  const t = useTranslations("pages");
  const [staff, setStaff] = useState<StaffMemberApi[]>([]);
  const [poles, setPoles] = useState<PoleApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    getPoles()
      .then(setPoles)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const poleSlug = filter === "all" ? undefined : filter;
    getStaffMembers(poleSlug)
      .then(setStaff)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading && staff.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <StandardPageShell>
      <div className="max-w-7xl mx-auto text-white">
        <StandardPageHero
          eyebrow={t("organisationStaff.eyebrow")}
          title={t("organisationStaff.titleBefore")}
          highlight={t("organisationStaff.titleHighlight")}
          description={t("organisationStaff.subtitle")}
        />

        <AnimatedDiv
          animation="fadeInUp"
          delay={0.05}
          className="mb-14"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-3">
            {t("organisationStaff.filterLabel")}
          </p>
          <div className="flex flex-wrap gap-2 p-2 bg-white/[0.03] border border-white/10 rounded-2xl max-w-full">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                filter === "all"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              {t("organisationStaff.filterAll")}
            </button>
            {poles.map((pole) => (
              <button
                key={pole.id}
                onClick={() => setFilter(pole.slug)}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${
                  filter === pole.slug
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {pole.name}
              </button>
            ))}
          </div>
        </AnimatedDiv>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] text-red-500 text-center">
            <p className="text-2xl font-black mb-2 uppercase italic tracking-tighter">{t("organisationStaff.errorTitle")}</p>
            <p className="text-sm font-light opacity-60">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {staff.map((member, idx) => (
              <AnimatedDiv
                key={member.id}
                animation="fadeInUp"
                delay={Math.min(idx * 0.04, 0.3)}
              >
                <StaffCard member={member} />
              </AnimatedDiv>
            ))}
          </div>
        )}

        {!loading && staff.length === 0 && !error && (
          <div className="text-center py-32 text-white/10 border-2 border-dashed border-white/5 rounded-[3rem]">
            <p className="text-3xl font-black tracking-widest uppercase italic">{t("organisationStaff.emptyTitle")}</p>
            <p className="text-xs mt-4 tracking-[0.3em] font-light">
              {t("organisationStaff.emptySubtitle")}
            </p>
          </div>
        )}
      </div>
    </StandardPageShell>
  );
}
