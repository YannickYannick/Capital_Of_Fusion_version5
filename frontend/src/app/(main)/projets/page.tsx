"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getProjects, getProjectCategories } from "@/lib/api";
import { createProject, updateProject, deleteProject } from "@/lib/adminApi";
import type { ProjectApi, ProjectCategoryApi } from "@/types/projects";
import { STATUS_CONFIG } from "@/types/projects";
import { AdminAddButton, AdminEditButton } from "@/components/admin/AdminEditButton";
import { AdminModal, AdminField, adminInputClass, adminTextareaClass, adminSelectClass } from "@/components/admin/AdminModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────


function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

function ProjectModal({
  project,
  categories,
  onClose,
  onSuccess,
}: {
  project: ProjectApi | null;
  categories: ProjectCategoryApi[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!project;

  const [title, setTitle] = useState(project?.title || "");
  const [slug, setSlug] = useState(project?.slug || "");
  const [categoryId, setCategoryId] = useState(project?.category?.id?.toString() || "");
  const [status, setStatus] = useState<ProjectApi["status"]>(project?.status || "IN_PROGRESS");
  const [summary, setSummary] = useState(project?.summary || "");
  const [content, setContent] = useState(project?.content || "");

  const handleSave = async () => {
    setLoading(true);
    const payload = {
      title,
      slug,
      category_id: categoryId ? parseInt(categoryId) : null,
      status,
      summary,
      content,
    };

    try {
      if (isEditing) {
        await updateProject(project!.slug, payload);
      } else {
        await createProject(payload);
      }
      onSuccess();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !confirm("Supprimer ce projet ?")) return;
    setLoading(true);
    try {
      await deleteProject(project!.slug);
      onSuccess();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
      setLoading(false);
    }
  };

  return (
    <AdminModal
      title={isEditing ? "Modifier le projet" : "Nouveau projet"}
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
          <AdminField label="Catégorie">
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={adminSelectClass}>
              <option value="">Aucune catégorie</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </AdminField>
          <AdminField label="Statut" required>
            <select value={status} onChange={e => setStatus(e.target.value as any)} className={adminSelectClass}>
              <option value="IN_PROGRESS">En cours</option>
              <option value="UPCOMING">À venir</option>
              <option value="COMPLETED">Terminé</option>
            </select>
          </AdminField>
        </div>

        <AdminField label="Résumé">
          <textarea value={summary} onChange={e => setSummary(e.target.value)} className={adminTextareaClass} rows={3} />
        </AdminField>

        <AdminField label="Contenu (Markdown)">
          <textarea value={content} onChange={e => setContent(e.target.value)} className={adminTextareaClass} rows={8} />
        </AdminField>
      </div>
    </AdminModal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjetsPage() {
  const [projects, setProjects] = useState<ProjectApi[]>([]);
  const [categories, setCategories] = useState<ProjectCategoryApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Admin state
  const [editingProject, setEditingProject] = useState<ProjectApi | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const fetchData = () => {
    setLoading(true);
    // On conserve le cache des catégories si on recharge juste la liste
    const promises = [getProjects()];
    if (categories.length === 0) promises.push(getProjectCategories());

    Promise.all(promises)
      .then(([projs, cats]) => {
        setProjects(projs);
        if (cats) setCategories(cats);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur de chargement"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = projects.filter((p) => {
    const catMatch = !selectedCategory || p.category?.slug === selectedCategory;
    const statusMatch = !selectedStatus || p.status === selectedStatus;
    return catMatch && statusMatch;
  });

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Admin Actions */}
        <div className="flex justify-end mb-4">
          <AdminAddButton onAdd={() => setIsAdding(true)} label="Nouveau projet" />
        </div>

        {/* ─── Header ──────────────────────────────────────────────────── */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-fuchsia-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Incubation &amp; Impact
          </p>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
            Nos <span className="bg-gradient-to-r from-fuchsia-400 to-purple-500 bg-clip-text text-transparent">Projets</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Capital of Fusion accompagne, incube et initie des projets qui font rayonner la culture de la danse.
          </p>
        </div>

        {/* ─── Filtres ─────────────────────────────────────────────────── */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 animate-in fade-in duration-500 delay-200">
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${selectedCategory === "" ? "bg-fuchsia-500 border-fuchsia-500 text-white shadow-[0_0_20px_-5px_rgba(217,70,239,0.6)]" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"}`}
            >
              Toutes les catégories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${selectedCategory === cat.slug ? "bg-fuchsia-500 border-fuchsia-500 text-white shadow-[0_0_20px_-5px_rgba(217,70,239,0.6)]" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="w-px h-8 bg-white/10 hidden md:block self-center" />
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={() => setSelectedStatus("")}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${selectedStatus === "" ? "bg-white/20 border-white/30 text-white" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"}`}
            >
              Tous les statuts
            </button>
            {(Object.entries(STATUS_CONFIG) as [ProjectApi["status"], typeof STATUS_CONFIG["IN_PROGRESS"]][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setSelectedStatus(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${selectedStatus === key ? cfg.color + " shadow-lg" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"}`}
              >
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Contenu ─────────────────────────────────────────────────── */}
        {error && <p className="text-center text-red-400 mb-8" role="alert">{error}</p>}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-64 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-white/40">
            <p className="text-5xl mb-4">🚀</p>
            <p className="text-lg">Aucun projet ne correspond à ces filtres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {filtered.map((project) => {
              const statusCfg = STATUS_CONFIG[project.status];
              return (
                <div key={project.id} className="group relative">
                  {/* Bouton Admin superposé sur la card */}
                  <AdminEditButton onEdit={() => setEditingProject(project)} />

                  <Link
                    href={`/projets/${project.slug}`}
                    className="flex flex-col h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-fuchsia-500/40 hover:shadow-[0_0_40px_-10px_rgba(217,70,239,0.25)] transition-all duration-300 hover:-translate-y-1 block"
                  >
                    <div className="flex justify-between items-start mb-5 gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 truncate">
                        {project.category?.name ?? "Projet"}
                      </span>
                      <span className={`flex items-center gap-1.5 shrink-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusCfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-fuchsia-300 transition-colors line-clamp-2 w-11/12">
                      {project.title}
                    </h2>

                    {project.summary && (
                      <p className="text-white/55 text-sm leading-relaxed line-clamp-3 flex-1">{project.summary}</p>
                    )}

                    <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-white/40">
                        {project.start_date ? `🗓 ${formatDate(project.start_date)}` : ""}
                      </span>
                      <span className="text-xs text-fuchsia-400 font-semibold group-hover:translate-x-1 transition-transform">
                        En savoir plus →
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-20 text-center">
          <Link href="/explore" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-sm font-medium">
            ← Retour à l&apos;exploration 3D
          </Link>
        </div>
      </div>

      {(isAdding || editingProject) && (
        <ProjectModal
          project={editingProject}
          categories={categories}
          onClose={() => { setIsAdding(false); setEditingProject(null); }}
          onSuccess={() => { setIsAdding(false); setEditingProject(null); fetchData(); }}
        />
      )}
    </div>
  );
}
