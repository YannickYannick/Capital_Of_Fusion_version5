"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createBulletin } from "@/lib/api";

function slugFromTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function NouveauBulletinPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEdit = user?.user_type === "STAFF" || user?.user_type === "ADMIN";

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!slug || slug === slugFromTitle(title)) setSlug(slugFromTitle(v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || slugFromTitle(title),
        content_markdown: contentMarkdown.trim() || undefined,
        published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
        is_published: isPublished,
      };
      const created = await createBulletin(payload);
      router.push(`/identite-cof/bulletins/${created.slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div>
        <p className="text-white/80">Connexion requise.</p>
        <Link href="/identite-cof/bulletins" className="text-purple-400 hover:underline mt-2 inline-block">
          ← Retour aux bulletins
        </Link>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div>
        <p className="text-white/80">Droits insuffisants pour créer un bulletin.</p>
        <Link href="/identite-cof/bulletins" className="text-purple-400 hover:underline mt-2 inline-block">
          ← Retour aux bulletins
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/identite-cof/bulletins"
        className="text-white/60 hover:text-white text-sm mb-4 inline-block"
      >
        ← Retour aux bulletins
      </Link>
      <h1 className="text-3xl font-bold text-white mb-6">Créer un bulletin</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-white/70 text-sm mb-1">Titre</label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500/50"
            required
          />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-1">Slug (URL)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500/50 font-mono text-sm"
            placeholder="generé-depuis-le-titre"
          />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-1">Contenu (Markdown)</label>
          <textarea
            value={contentMarkdown}
            onChange={(e) => setContentMarkdown(e.target.value)}
            className="w-full min-h-[200px] px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm"
            placeholder="## Introduction…"
          />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-1">Date de publication</label>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_published"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="rounded border-white/20"
          />
          <label htmlFor="is_published" className="text-white/80 text-sm">
            Publié (visible par tous)
          </label>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50"
          >
            {saving ? "Création…" : "Créer le bulletin"}
          </button>
          <Link
            href="/identite-cof/bulletins"
            className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
