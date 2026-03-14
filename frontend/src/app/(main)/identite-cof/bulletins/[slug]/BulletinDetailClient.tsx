"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getAdminBulletinBySlug } from "@/lib/api";
import { markdownToHtml } from "@/lib/markdownToHtml";
import type { BulletinApi, BulletinAdminApi } from "@/types/config";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const proseClasses =
  "text-white/90 leading-relaxed [&_a]:text-purple-400 [&_a:hover]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_ul]:list-disc [&_ol]:list-decimal [&_pre]:bg-white/5 [&_pre]:p-4 [&_pre]:rounded-lg";

interface BulletinDetailClientProps {
  slug: string;
  initialBulletin: BulletinApi | null;
}

export function BulletinDetailClient({ slug, initialBulletin }: BulletinDetailClientProps) {
  const { user } = useAuth();
  const [bulletin, setBulletin] = useState<BulletinApi | BulletinAdminApi | null>(initialBulletin);
  const [loading, setLoading] = useState(!initialBulletin);
  const [notFound, setNotFound] = useState(false);

  const canEdit = user?.user_type === "STAFF" || user?.user_type === "ADMIN";
  const isDraft = bulletin && "is_published" in bulletin && !bulletin.is_published;

  useEffect(() => {
    if (initialBulletin) {
      setLoading(false);
      return;
    }
    if (!canEdit) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setNotFound(false);
    getAdminBulletinBySlug(slug)
      .then(setBulletin)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug, canEdit, initialBulletin]);

  if (loading) {
    return (
      <article>
        <Link href="/identite-cof/bulletins" className="text-white/60 hover:text-white text-sm mb-4 inline-block">
          ← Retour aux dernières informations
        </Link>
        <p className="text-white/70">Chargement…</p>
      </article>
    );
  }

  if (notFound || !bulletin) {
    return (
      <article>
        <Link href="/identite-cof/bulletins" className="text-white/60 hover:text-white text-sm mb-4 inline-block">
          ← Retour aux dernières informations
        </Link>
        <p className="text-white/70">Bulletin introuvable.</p>
      </article>
    );
  }

  return (
    <article className="prose prose-invert prose-lg max-w-none">
      <Link
        href="/identite-cof/bulletins"
        className="text-white/60 hover:text-white text-sm mb-6 inline-block"
      >
        ← Retour aux dernières informations
      </Link>
      <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-2">Dernières informations</p>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-4xl font-black text-white tracking-tight">
            {bulletin.title}
          </h1>
          {isDraft && (
            <span className="text-amber-400 text-sm">(Brouillon)</span>
          )}
          {canEdit && (
            <Link
              href={`/identite-cof/bulletins/${bulletin.slug}/edit`}
              className="text-sm px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white/80 hover:bg-white/20 hover:text-white transition-all"
            >
              Modifier
            </Link>
          )}
        </div>
        <time
          className="text-white/50 text-sm"
          dateTime={bulletin.published_at ?? bulletin.created_at}
        >
          {formatDate(bulletin.published_at ?? bulletin.created_at)}
        </time>
      </div>
      <div className={`${proseClasses} animate-in fade-in duration-500`}>
        <div dangerouslySetInnerHTML={{ __html: markdownToHtml(bulletin.content_markdown || "*Aucun contenu.*") }} />
      </div>
    </article>
  );
}
