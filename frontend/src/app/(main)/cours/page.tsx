"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCourses } from "@/lib/api";
import { createCourse, updateCourse, deleteCourse } from "@/lib/adminApi";
import type { CourseListApi } from "@/types/course";
import { AdminAddButton, AdminEditButton } from "@/components/admin/AdminEditButton";
import { AdminModal, AdminField, adminInputClass, adminSelectClass, adminTextareaClass } from "@/components/admin/AdminModal";
import { StandardPageShell, StandardPageHero } from "@/components/shared/StandardPage";

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

function CourseModal({
  course,
  onClose,
  onSuccess,
}: {
  course: CourseListApi | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!course;

  const [name, setName] = useState(course?.name || "");
  const [slug, setSlug] = useState(course?.slug || "");
  const [description, setDescription] = useState(course?.description || "");
  const [styleLabel, setStyleLabel] = useState(course?.style_name || "Bachata"); // Simplification pour le form
  const [levelLabel, setLevelLabel] = useState(course?.level_name || "Débutant"); // Simplification pour le form
  const [isActive, setIsActive] = useState(course?.is_active ?? true);

  // Note: Dans une version complète, style, level, node et teachers seraient gérés via des FKs.
  // Pour rester simple et s'aligner avec le format existant des APIs, il faudrait charger ces listes.
  // Ici nous laissons ces champs en texte libre ou sélecteurs basiques pour correspondre à vos modèles s'ils utilisent des slugs.

  const handleSave = async () => {
    setLoading(true);
    // Note importante : L'API CourseWriteSerializer attend des ID pour ForeignKey (style, level, node).
    // Si nous n'en avons pas côté UI, l'édition complète nécessitera des endpoints dédiés pour récupérer
    // les listes de Style, Level etc.
    const payload = {
      name,
      slug,
      description,
      is_active: isActive,
      // style: ... TODO : mapper ID
      // level: ... TODO : mapper ID
    };

    try {
      if (isEditing) {
        await updateCourse(course!.slug, payload);
      } else {
        await createCourse(payload);
      }
      onSuccess();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !confirm("Supprimer ce cours ?")) return;
    setLoading(true);
    try {
      await deleteCourse(course!.slug);
      onSuccess();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
      setLoading(false);
    }
  };

  return (
    <AdminModal
      title={isEditing ? "Modifier le cours" : "Nouveau cours"}
      onClose={onClose}
      onSave={handleSave}
      onDelete={isEditing ? handleDelete : undefined}
      loading={loading}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <AdminField label="Nom" required>
            <input value={name} onChange={e => {
              setName(e.target.value);
              if (!isEditing) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
            }} className={adminInputClass} />
          </AdminField>
          <AdminField label="Slug URL" required>
            <input value={slug} onChange={e => setSlug(e.target.value)} className={adminInputClass} />
          </AdminField>
        </div>

        <AdminField label="Description">
          <textarea value={description} onChange={e => setDescription(e.target.value)} className={adminTextareaClass} rows={4} />
        </AdminField>

        <div className="p-3 bg-white/5 border border-amber-500/30 rounded-xl text-amber-300 text-sm">
          ⚠️ Info: la liaison des styles, niveaux, noeuds et professeurs nécessite des IDs exacts du backend.
        </div>

        <label className="flex items-center gap-2 text-sm text-white pt-2 cursor-pointer">
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded" />
          <span>Cours actif (visible au catalogue)</span>
        </label>
      </div>
    </AdminModal>
  );
}

export default function CoursPage() {
  const [courses, setCourses] = useState<CourseListApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState("");
  const [style, setStyle] = useState("");

  // Admin state
  const [editingCourse, setEditingCourse] = useState<CourseListApi | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const fetchCourses = () => {
    setLoading(true);
    getCourses({
      level: level || undefined,
      style: style || undefined,
    })
      .then(setCourses)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, [level, style]);

  return (
    <StandardPageShell>
      <div className="flex justify-end mb-4">
        <AdminAddButton onAdd={() => setIsAdding(true)} label="Nouveau cours" />
      </div>

      <StandardPageHero
        eyebrow="Apprentissage"
        title="Nos"
        highlight="Cours"
        description="Explorez notre catalogue de cours réguliers. Filtrez par style ou niveau pour trouver ce qui vous correspond."
      />

      <div className="mt-6 flex flex-wrap justify-center gap-6 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md max-w-2xl mx-auto mb-12">
        <label className="flex flex-col gap-2 text-sm text-white/80 font-medium flex-1 min-w-[200px]">
          Niveau
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
          >
            {LEVEL_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>{o.label}</option>
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
              <option key={o.value || "all"} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="mt-4 text-red-400" role="alert">{error}</p>}

      {loading ? (
        <p className="mt-8 text-white/60">Chargement…</p>
      ) : courses.length === 0 ? (
        <p className="mt-8 text-white/60">Aucun cours pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500 delay-200">
          {courses.map((c) => (
            <div key={c.id} className="group relative h-full">
              <AdminEditButton onEdit={() => setEditingCourse(c)} />
              <Link
                href={`/cours/${c.slug}`}
                className="flex flex-col h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)] transition-all duration-300 hover:-translate-y-1 block relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {c.style_name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white/50 bg-black/30 px-2 py-1 rounded-md">
                      {c.level_name}
                    </span>
                    {!c.is_active && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-sm font-bold">INACTIF</span>}
                  </div>
                </div>

                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors w-11/12">{c.name}</h2>

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

      {(isAdding || editingCourse) && (
        <CourseModal
          course={editingCourse}
          onClose={() => { setIsAdding(false); setEditingCourse(null); fetchCourses(); }}
          onSuccess={() => { setIsAdding(false); setEditingCourse(null); fetchCourses(); }}
        />
      )}
    </StandardPageShell>
  );
}
