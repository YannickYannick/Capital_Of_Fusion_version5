"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getCourses } from "@/lib/api";
import type { CourseListApi } from "@/types/course";

export default function FiltresPage() {
  const [courses, setCourses] = useState<CourseListApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [styleFilter, setStyleFilter] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("");

  useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  // Extraire les styles et niveaux uniques
  const styles = useMemo(() => {
    const uniqueStyles = new Map<string, string>();
    courses.forEach((c) => uniqueStyles.set(c.style_slug, c.style_name));
    return Array.from(uniqueStyles, ([slug, name]) => ({ slug, name }));
  }, [courses]);

  const levels = useMemo(() => {
    const uniqueLevels = new Map<string, { name: string; color: string }>();
    courses.forEach((c) =>
      uniqueLevels.set(c.level_slug, { name: c.level_name, color: c.level_color })
    );
    return Array.from(uniqueLevels, ([slug, data]) => ({ slug, ...data }));
  }, [courses]);

  // Filtrer les cours
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (styleFilter && c.style_slug !== styleFilter) return false;
      if (levelFilter && c.level_slug !== levelFilter) return false;
      return true;
    });
  }, [courses, styleFilter, levelFilter]);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-white/50 mb-8 animate-in fade-in duration-500">
          <Link href="/cours" className="hover:text-white transition">Cours</Link>
          <span>/</span>
          <span className="text-white">Filtres</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Cours Capital of Fusion
          </p>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Recherche{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Avancée
            </span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Filtrez les cours par style et niveau pour trouver celui qui vous convient.
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap justify-center gap-4 mb-10 p-6 rounded-2xl bg-white/5 border border-white/10">
          {/* Filtre Style */}
          <div>
            <label className="block text-white/60 text-xs mb-2 uppercase tracking-wider">Style</label>
            <select
              value={styleFilter}
              onChange={(e) => setStyleFilter(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:border-purple-500 focus:outline-none min-w-[150px]"
            >
              <option value="">Tous les styles</option>
              {styles.map((s) => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Filtre Niveau */}
          <div>
            <label className="block text-white/60 text-xs mb-2 uppercase tracking-wider">Niveau</label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:border-purple-500 focus:outline-none min-w-[150px]"
            >
              <option value="">Tous les niveaux</option>
              {levels.map((l) => (
                <option key={l.slug} value={l.slug}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Reset */}
          {(styleFilter || levelFilter) && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStyleFilter("");
                  setLevelFilter("");
                }}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition text-sm"
              >
                Réinitialiser
              </button>
            </div>
          )}
        </div>

        {/* Résultats */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-4xl mb-4">🎓</p>
            <p className="text-white/60">Aucun cours ne correspond à vos critères.</p>
            <button
              onClick={() => {
                setStyleFilter("");
                setLevelFilter("");
              }}
              className="mt-4 px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-medium transition"
            >
              Voir tous les cours
            </button>
          </div>
        ) : (
          <>
            <p className="text-white/50 text-sm mb-6">
              {filteredCourses.length} cours trouvé{filteredCourses.length > 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course, i) => (
                <Link
                  key={course.id}
                  href={`/cours/${course.slug}`}
                  className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${course.level_color}20`,
                        color: course.level_color || "#a855f7",
                      }}
                    >
                      {course.level_name}
                    </span>
                    <span className="text-white/40 text-xs">{course.style_name}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors mb-2">
                    {course.name}
                  </h3>
                  
                  {course.description && (
                    <p className="text-white/50 text-sm line-clamp-2 mb-4">{course.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-white/40 text-sm pt-4 border-t border-white/10">
                    <span>{course.node_name}</span>
                    {course.next_schedule && (
                      <span className="text-purple-400">
                        {course.next_schedule.day} {course.next_schedule.time}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
