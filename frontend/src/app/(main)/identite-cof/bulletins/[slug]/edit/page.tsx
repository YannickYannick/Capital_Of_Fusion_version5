"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getAdminBulletinBySlug, patchBulletin } from "@/lib/api";

function slugFromTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function EditBulletinPage() {
  const router = useRouter();
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [slugValue, setSlugValue] = useState("");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEdit = user?.user_type === "STAFF" || user?.user_type === "ADMIN";

  useEffect(() => {
    if (!slug || !canEdit) {
      setLoading(false);
      return;
    }
    getAdminBulletinBySlug(slug)
      .then((b) => {
        setTitle(b.title);
        setSlugValue(b.slug);
        setContentMarkdown(b.content_markdown ?? "");
        setPublishedAt(
          b.published_at ? new Date(b.published_at).toISOString().slice(0, 16) : ""
        );
        setIsPublished("is_published" in b ? b.is_published : true);
      })
      .catch(() => setError("Bulletin introuvable"))
      .finally(() => setLoading(false));
  }, [slug, canEdit]);

  const handleTitleChange = (v: string) => {
    setTitle(v);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !slug) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        slug: slugValue.trim() || slugFromTitle(title),
        content_markdown: contentMarkdown.trim(),
        published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
        is_published: isPublished,
      };
      const updated = await patchBulletin(slug, payload);
      router.push(`/identite-cof/bulletins/${updated.slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'enregistrement");
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
        <p className="text-white/80">Droits insuffisants pour modifier ce bulletin.</p>
        <Link href="/identite-cof/bulletins" className="text-purple-400 hover:underline mt-2 inline-block">
          ← Retour aux bulletins
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <p className="text-white/80">Chargement…</p>
      </div>
    );
  }

  if (error && !title) {
    return (
      <div>
        <p className="text-red-400">{error}</p>
        <Link href="/identite-cof/bulletins" className="text-purple-400 hover:underline mt-2 inline-block">
          ← Retour aux bulletins
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/identite-cof/bulletins/${slug}`}
        className="text-white/60 hover:text-white text-sm mb-4 inline-block"
      >
        ← Retour au bulletin
      </Link>
      <h1 className="text-3xl font-bold text-white mb-6">Modifier le bulletin</h1>
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
            value={slugValue}
            onChange={(e) => setSlugValue(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500/50 font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-1">Contenu (Markdown)</label>
          <textarea
            value={contentMarkdown}
            onChange={(e) => setContentMarkdown(e.target.value)}
            className="w-full min-h-[200px] px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm"
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
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          <Link
            href={`/identite-cof/bulletins/${slug}`}
            className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
