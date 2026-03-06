"use client";

import { useState, useEffect, use } from "react";
import { getTheoryLessons } from "@/lib/api";
import { createTheoryLesson, updateTheoryLesson, deleteTheoryLesson } from "@/lib/adminApi";
import type { TheoryLessonApi } from "@/types/course";
import { AdminAddButton, AdminEditButton } from "@/components/admin/AdminEditButton";
import { AdminModal, AdminField, adminInputClass, adminSelectClass, adminTextareaClass } from "@/components/admin/AdminModal";

const CATEGORY_META: Record<string, { icon: string; color: string; bg: string }> = {
  rythme: { icon: "🎵", color: "text-cyan-400", bg: "bg-cyan-500/15 border-cyan-500/30" },
  technique: { icon: "⚡", color: "text-pink-400", bg: "bg-pink-500/15 border-pink-500/30" },
  histoire: { icon: "📜", color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30" },
  culture: { icon: "🌍", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30" },
};

const CATEGORIES_LIST = [
  { value: "rythme", label: "🎵 Rythme & Musique" },
  { value: "technique", label: "⚡ Technique" },
  { value: "histoire", label: "📜 Histoire" },
  { value: "culture", label: "🌍 Culture" },
];

function LessonModal({
  lesson,
  onClose,
  onSuccess,
}: {
  lesson: TheoryLessonApi | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!lesson;

  const [title, setTitle] = useState(lesson?.title || "");
  const [slug, setSlug] = useState(lesson?.slug || "");
  const [category, setCategory] = useState(lesson?.category || "technique");
  const [content, setContent] = useState(lesson?.content || "");
  const [videoUrl, setVideoUrl] = useState(lesson?.video_url || "");
  const [duration, setDuration] = useState(lesson?.duration_minutes?.toString() || "5");
  const [isActive, setIsActive] = useState(lesson?.is_active ?? true);

  const handleSave = async () => {
    setLoading(true);
    const payload = {
      title,
      slug,
      category,
      content,
      video_url: videoUrl,
      duration_minutes: parseInt(duration) || 5,
      is_active: isActive,
    };

    try {
      if (isEditing) {
        await updateTheoryLesson(lesson!.slug, payload);
      } else {
        await createTheoryLesson(payload);
      }
      onSuccess();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !confirm("Supprimer cette leçon ?")) return;
    setLoading(true);
    try {
      await deleteTheoryLesson(lesson!.slug);
      onSuccess();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
      setLoading(false);
    }
  };

  return (
    <AdminModal
      title={isEditing ? "Modifier la leçon" : "Nouvelle leçon"}
      onClose={onClose}
      onSave={handleSave}
      onDelete={isEditing ? handleDelete : undefined}
      loading={loading}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <AdminField label="Titre" required>
            <input value={title} onChange={e => {
              setTitle(e.target.value);
              if (!isEditing) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
            }} className={adminInputClass} />
          </AdminField>
          <AdminField label="Slug URL" required>
            <input value={slug} onChange={e => setSlug(e.target.value)} className={adminInputClass} />
          </AdminField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AdminField label="Catégorie" required>
            <select value={category} onChange={e => setCategory(e.target.value as any)} className={adminSelectClass}>
              {CATEGORIES_LIST.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </AdminField>
          <AdminField label="Durée (min)" required>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className={adminInputClass} />
          </AdminField>
        </div>

        <AdminField label="Vidéo YouTube URL">
          <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className={adminInputClass} placeholder="https://youtube.com/..." />
        </AdminField>

        <AdminField label="Contenu Markdown">
          <textarea value={content} onChange={e => setContent(e.target.value)} className={adminTextareaClass} rows={6} />
        </AdminField>

        <label className="flex items-center gap-2 text-sm text-white pt-2 cursor-pointer">
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded" />
          <span>Leçon publique (active)</span>
        </label>
      </div>
    </AdminModal>
  );
}

function LessonCard({ lesson, onEdit }: { lesson: TheoryLessonApi, onEdit: () => void }) {
  const meta = CATEGORY_META[lesson.category] ?? { icon: "📝", color: "text-white/60", bg: "bg-white/10 border-white/20" };

  return (
    <div className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:bg-white/8 transition-all duration-200">
      <AdminEditButton onEdit={onEdit} />
      <div className="flex items-start gap-4">
        <div className={`shrink-0 w-12 h-12 rounded-xl ${meta.bg} border flex items-center justify-center text-2xl`}>
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`${meta.color} text-xs font-semibold uppercase tracking-wider`}>
              {lesson.category_display}
            </span>
            <span className="text-white/25 text-xs ml-auto">{lesson.duration_minutes} min</span>
            {!lesson.is_active && <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded ml-2">INACTIF</span>}
          </div>
          <h3 className="text-white font-bold leading-tight mb-2 group-hover:text-white/90">{lesson.title}</h3>
        </div>
      </div>
    </div>
  );
}

export default function TheorieCoursPage(props: {
  searchParams: Promise<{ category?: string }>;
}) {
  const searchParams = use(props.searchParams);
  const category = searchParams.category;
  const [lessons, setLessons] = useState<TheoryLessonApi[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin state
  const [editingLesson, setEditingLesson] = useState<TheoryLessonApi | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const fetchLessons = () => {
    setLoading(true);
    getTheoryLessons(category ? { category } : undefined)
      .then(setLessons)
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLessons();
  }, [category]);

  const CATEGORIES = [
    { key: "", label: "Tous" },
    { key: "rythme", label: "🎵 Rythme" },
    { key: "technique", label: "⚡ Technique" },
    { key: "histoire", label: "📜 Histoire" },
    { key: "culture", label: "🌍 Culture" },
  ];

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-end mb-4">
          <AdminAddButton onAdd={() => setIsAdding(true)} label="Nouvelle leçon" />
        </div>

        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-3">Savoir théorique</p>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Leçons de <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Théorie</span>
          </h1>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.key || (!category && cat.key === "");
            return (
              <a
                key={cat.key}
                href={cat.key ? `/theorie/cours?category=${cat.key}` : "/theorie/cours"}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                  ${isActive ? "bg-white/15 border-white/30 text-white" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"}`}
              >
                {cat.label}
              </a>
            );
          })}
        </div>

        {loading ? (
          <p className="text-white/50 text-center">Chargement...</p>
        ) : lessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} onEdit={() => setEditingLesson(lesson)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/4 rounded-3xl border border-white/10">
            <p className="text-white/60 text-lg">Aucune leçon disponible pour l&apos;instant.</p>
          </div>
        )}

        {(isAdding || editingLesson) && (
          <LessonModal
            lesson={editingLesson}
            onClose={() => { setIsAdding(false); setEditingLesson(null); }}
            onSuccess={() => { setIsAdding(false); setEditingLesson(null); fetchLessons(); }}
          />
        )}
      </div>
    </div>
  );
}
