"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCourses } from "@/lib/api";
import type { CourseApi } from "@/types/course";

const LEVEL_OPTIONS = [
  { value: "", label: "Tous les niveaux" },
  { value: "beginner", label: "Débutant" },
  { value: "intermediate", label: "Intermédiaire" },
  { value: "advanced", label: "Avancé" },
  { value: "professional", label: "Professionnel" },
];

const STYLE_OPTIONS = [
  { value: "", label: "Tous les styles" },
  { value: "bachata", label: "Bachata" },
  { value: "salsa", label: "Salsa" },
  { value: "kizomba", label: "Kizomba" },
];

/**
 * Page Cours — liste des cours avec filtres (style, niveau).
 * Données : GET /api/courses/
 */
export default function CoursPage() {
  const [courses, setCourses] = useState<CourseApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState("");
  const [style, setStyle] = useState("");

  useEffect(() => {
    setLoading(true);
    getCourses({
      level: level || undefined,
      style: style || undefined,
    })
      .then(setCourses)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [level, style]);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Apprentissage</p>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
            Nos{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Cours
            </span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Explorez notre catalogue de cours réguliers. Filtrez par style ou niveau pour trouver ce qui vous correspond.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-6 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md max-w-2xl mx-auto mb-12">
          <label className="flex flex-col gap-2 text-sm text-white/80 font-medium flex-1 min-w-[200px]">
            Niveau
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
            >
              {LEVEL_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/80 font-medium flex-1 min-w-[200px]">
            Style
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
            >
              {STYLE_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <p className="mt-4 text-red-400" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-8 text-white/60">Chargement…</p>
        ) : courses.length === 0 ? (
          <p className="mt-8 text-white/60">
            Aucun cours pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500 delay-200">
            {courses.map((c) => (
              <div key={c.id} className="group h-full">
                <Link
                  href={`/cours/${c.slug}`}
                  className="flex flex-col h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)] transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {c.style_name}
                    </span>
                    <span className="text-xs font-semibold text-white/50 bg-black/30 px-2 py-1 rounded-md">
                      {c.level_name}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">{c.name}</h2>

                  {c.node_name && (
                    <p className="mt-auto pt-4 flex items-center gap-2 text-sm text-white/50 border-t border-white/5">
                      <span>📍</span> {c.node_name}
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
