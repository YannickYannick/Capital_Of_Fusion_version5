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
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white">Cours</h1>
        <p className="mt-2 text-white/70">
          Catalogue des cours — filtrez par style et niveau.
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          <label className="flex flex-col gap-1 text-sm text-white/80">
            Niveau
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500"
            >
              {LEVEL_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-white/80">
            Style
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500"
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
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {courses.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/cours/${c.slug}`}
                  className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition"
                >
                  <h2 className="font-semibold text-white">{c.name}</h2>
                  <p className="mt-1 text-sm text-white/70">
                    {c.style_name} · {c.level_name}
                  </p>
                  {c.node_name && (
                    <p className="mt-0.5 text-xs text-white/50">{c.node_name}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
