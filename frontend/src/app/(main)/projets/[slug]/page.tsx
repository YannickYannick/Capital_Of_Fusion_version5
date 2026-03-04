"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getProjectBySlug, getProjectCategories } from "@/lib/api";
import { updateProject } from "@/lib/adminApi";
import type { ProjectApi, ProjectCategoryApi } from "@/types/projects";
import { STATUS_CONFIG } from "@/types/projects";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Admin components
import { AdminEditButton } from "@/components/admin/AdminEditButton";
import { AdminModal, AdminField, adminInputClass, adminTextareaClass, adminSelectClass } from "@/components/admin/AdminModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}


function ProjectEditModal({
    project,
    categories,
    onClose,
    onSuccess,
}: {
    project: ProjectApi;
    categories: ProjectCategoryApi[];
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(false);

    const [title, setTitle] = useState(project.title);
    const [slug, setSlug] = useState(project.slug);
    const [categoryId, setCategoryId] = useState(project.category?.id?.toString() || "");
    const [status, setStatus] = useState<ProjectApi["status"]>(project.status);
    const [summary, setSummary] = useState(project.summary || "");
    const [content, setContent] = useState(project.content || "");

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
            await updateProject(project.slug, payload);
            onSuccess();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Erreur");
            setLoading(false);
        }
    };

    return (
        <AdminModal
            title="Modifier le projet"
            onClose={onClose}
            onSave={handleSave}
            loading={loading}
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <AdminField label="Titre" required>
                        <input value={title} onChange={e => setTitle(e.target.value)} className={adminInputClass} />
                    </AdminField>
                    <AdminField label="Slug URL" required>
                        <input value={slug} onChange={e => setSlug(e.target.value)} className={adminInputClass} disabled title="Non modifiable ici" />
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
                    <textarea value={summary} onChange={e => setSummary(e.target.value)} className={adminTextareaClass} rows={2} />
                </AdminField>

                <AdminField label="Contenu (Markdown)">
                    <textarea value={content} onChange={e => setContent(e.target.value)} className={adminTextareaClass} rows={12} placeholder="Saisissez ici le contenu au format Markdown (# Titre, **Gras**, etc.)" />
                </AdminField>
            </div>
        </AdminModal>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * Page détail d'un projet.
 * Données : GET /api/projects/projects/{slug}/
 */
export default function ProjetDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const [project, setProject] = useState<ProjectApi | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Admin
    const [isEditing, setIsEditing] = useState(false);
    const [categories, setCategories] = useState<ProjectCategoryApi[]>([]);

    const fetchProject = () => {
        if (!slug) return;
        setLoading(true);
        getProjectBySlug(slug as string)
            .then(setProject)
            .catch((e) => setError(e instanceof Error ? e.message : "Projet introuvable"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchProject();
        // Optionnel: charger les catégories pour la modale dès maintenant
        getProjectCategories().then(setCategories).catch(console.error);
    }, [slug]);

    // ─── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
                <div className="max-w-4xl mx-auto animate-pulse space-y-6">
                    <div className="h-6 w-32 bg-white/10 rounded-full" />
                    <div className="h-14 w-2/3 bg-white/10 rounded-2xl" />
                    <div className="h-6 w-1/3 bg-white/10 rounded-full" />
                    <div className="h-48 w-full bg-white/10 rounded-2xl" />
                </div>
            </div>
        );
    }

    // ─── Erreur ─────────────────────────────────────────────────────────────────
    if (error || !project) {
        return (
            <div className="min-h-screen pt-28 pb-20 px-4 md:px-8 flex flex-col items-center justify-center">
                <p className="text-5xl mb-4">🚀</p>
                <h1 className="text-2xl font-bold text-white mb-2">Projet introuvable</h1>
                <p className="text-white/50 mb-8">{error}</p>
                <Link
                    href="/projets"
                    className="px-6 py-3 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/30 transition-all font-medium"
                >
                    ← Retour aux projets
                </Link>
            </div>
        );
    }

    const statusCfg = STATUS_CONFIG[project.status];

    // ─── Contenu ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen pt-28 pb-20 px-4 md:px-8 relative">
            <div className="max-w-4xl mx-auto relative">

                {/* Bouton d'édition flottant Admin */}
                <AdminEditButton onEdit={() => setIsEditing(true)} />

                {/* Fil d'Ariane */}
                <nav className="flex items-center gap-2 text-sm text-white/40 mb-8 animate-in fade-in duration-500">
                    <Link href="/projets" className="hover:text-fuchsia-300 transition-colors">
                        Projets
                    </Link>
                    <span>/</span>
                    <span className="text-white/70 truncate">{project.title}</span>
                </nav>

                {/* Header */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 mb-10">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        {project.category && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                                {project.category.name}
                            </span>
                        )}
                        <span
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${statusCfg.color}`}
                        >
                            <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                            {statusCfg.label}
                        </span>
                        {project.start_date && (
                            <span className="text-sm text-white/40">
                                🗓 {formatDate(project.start_date)}
                            </span>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
                        {project.title}
                    </h1>

                    {project.summary && (
                        <p className="text-white/60 text-xl leading-relaxed border-l-4 border-fuchsia-500/50 pl-5">
                            {project.summary}
                        </p>
                    )}
                </div>

                {/* Image de couverture */}
                {project.cover_image && (
                    <div className="mb-10 rounded-2xl overflow-hidden border border-white/10 animate-in fade-in duration-700 delay-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={project.cover_image}
                            alt={project.title}
                            className="w-full object-cover max-h-[480px]"
                        />
                    </div>
                )}

                {/* Contenu riche via Markdown */}
                {project.content ? (
                    <div
                        className="prose prose-invert prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-white
              prose-p:text-white/65 prose-p:leading-relaxed
              prose-strong:text-fuchsia-300
              prose-a:text-fuchsia-400 prose-a:no-underline hover:prose-a:underline
              prose-blockquote:border-fuchsia-500 prose-blockquote:text-white/50
              prose-li:text-white/65
              animate-in fade-in duration-700 delay-300"
                    >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {project.content}
                        </ReactMarkdown>
                    </div>
                ) : (
                    <div className="text-white/30 italic my-12 border border-white/5 p-8 rounded-2xl text-center">
                        Aucun contenu détaillé disponible pour le moment.
                    </div>
                )}

                {/* Séparateur */}
                <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Link
                        href="/projets"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-sm font-medium"
                    >
                        ← Tous les projets
                    </Link>

                    <Link
                        href="/explore"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300 hover:bg-fuchsia-500/20 transition-all duration-300 text-sm font-medium"
                    >
                        🪐 Explorer en 3D
                    </Link>
                </div>

            </div>

            {/* Modal d'édition */}
            {isEditing && (
                <ProjectEditModal
                    project={project}
                    categories={categories}
                    onClose={() => setIsEditing(false)}
                    onSuccess={() => {
                        setIsEditing(false);
                        fetchProject();
                    }}
                />
            )}
        </div>
    );
}
