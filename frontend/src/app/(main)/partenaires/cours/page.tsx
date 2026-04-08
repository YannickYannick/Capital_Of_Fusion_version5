"use client";

/**
 * Liste des cours des partenaires — style cours.
 * GET /api/partners/courses/
 */
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getPartnerCourses } from "@/lib/api";
import type { PartnerCourseApi } from "@/types/partner";
import { PartnerQuickAddModal } from "@/components/features/partners/PartnerQuickAddModal";
import { useAuth } from "@/contexts/AuthContext";
import { isStaffOrSuperuser } from "@/lib/staffAccess";

export default function PartenairesCoursPage() {
  const t = useTranslations("pages");
  const { user } = useAuth();
  const [courses, setCourses] = useState<PartnerCourseApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState("");
  const [style, setStyle] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const isStaff = isStaffOrSuperuser(user);

  const LEVEL_OPTIONS = [
    { value: "", label: t("partnerCourses.filters.allLevels") },
    { value: "beginner", label: t("partnerCourses.levels.beginner") },
    { value: "intermediate", label: t("partnerCourses.levels.intermediate") },
    { value: "advanced", label: t("partnerCourses.levels.advanced") },
    { value: "professional", label: t("partnerCourses.levels.professional") },
  ];

  const STYLE_OPTIONS = [
    { value: "", label: t("partnerCourses.filters.allStyles") },
    { value: "bachata", label: t("partnerCourses.styles.bachata") },
    { value: "salsa", label: t("partnerCourses.styles.salsa") },
    { value: "kizomba", label: t("partnerCourses.styles.kizomba") },
  ];

  const fetchCourses = useCallback(() => {
    setLoading(true);
    getPartnerCourses({
      level: level || undefined,
      style: style || undefined,
    })
      .then(setCourses)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [level, style]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <div className="min-h-screen pt-64 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Link
            href="/partenaires"
            className="text-white/40 hover:text-white text-sm uppercase tracking-widest font-bold mb-6 inline-block transition-colors"
          >
            {t("partnerCourses.backToPartners")}
          </Link>
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-3">
            {t("partnerCourses.eyebrow")}
          </p>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
            {t("partnerCourses.titleBefore")}{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              {t("partnerCourses.titleHighlight")}
            </span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            {t("partnerCourses.subtitle")}
          </p>
        </div>

        {isStaff && (
          <div className="mb-8 flex justify-center">
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/15 px-6 py-3 text-sm font-bold text-amber-200 hover:bg-amber-500/25 transition"
            >
              {t("partnerCourses.addButton")}
            </button>
          </div>
        )}

        <PartnerQuickAddModal
          mode="course"
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onCreated={fetchCourses}
        />

        <div className="mt-6 flex flex-wrap justify-center gap-6 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md max-w-2xl mx-auto mb-12">
          <label className="flex flex-col gap-2 text-sm text-white/80 font-medium flex-1 min-w-[200px]">
            {t("partnerCourses.filters.levelLabel")}
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none"
            >
              {LEVEL_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/80 font-medium flex-1 min-w-[200px]">
            {t("partnerCourses.filters.styleLabel")}
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none"
            >
              {STYLE_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className="mt-4 text-red-400" role="alert">{error}</p>}

        {loading ? (
          <p className="mt-8 text-white/60">{t("partnerCourses.loading")}</p>
        ) : courses.length === 0 ? (
          <p className="mt-8 text-white/60">{t("partnerCourses.empty")}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500 delay-200">
            {courses.map((c) => (
              <div
                key={c.id}
                className="relative flex flex-col h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/50 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)] transition-all duration-300 hover:-translate-y-1"
              >
                {isStaff && (
                  <Link
                    href={`/partenaires/cours/${encodeURIComponent(c.slug)}/edit`}
                    className="absolute top-4 right-4 z-20 text-[10px] font-bold uppercase tracking-wide text-amber-300 hover:text-white px-2 py-1 rounded-md bg-black/50 border border-amber-500/40"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t("partnerCourses.editCard")}
                  </Link>
                )}
                <Link href={`/partenaires/cours/${c.slug}`} className="flex flex-col h-full flex-1 min-h-0">
                  <div className="flex justify-between items-start mb-4 pr-14">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {c.style_name}
                    </span>
                    <span className="text-xs font-semibold text-white/50 bg-black/30 px-2 py-1 rounded-md shrink-0">
                      {c.level_name}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors w-11/12">{c.name}</h2>

                  {(c.node_name || c.partner_name) && (
                    <p className="mt-auto pt-4 flex items-center gap-2 text-sm text-white/50 border-t border-white/5">
                      <span>📍</span> {[c.node_name, c.partner_name].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
