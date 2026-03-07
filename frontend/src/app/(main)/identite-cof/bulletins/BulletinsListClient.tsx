"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getBulletins, getAdminBulletins } from "@/lib/api";
import type { BulletinApi, BulletinAdminApi } from "@/types/config";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function BulletinsListClient() {
  const { user } = useAuth();
  const [bulletins, setBulletins] = useState<BulletinApi[] | BulletinAdminApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canEdit = user?.user_type === "STAFF" || user?.user_type === "ADMIN";

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (canEdit) {
          const data = await getAdminBulletins();
          setBulletins(data);
        } else {
          const data = await getBulletins();
          setBulletins(data);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur chargement");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [canEdit]);

  if (loading) {
    return (
      <div>
        <div className="text-center mb-14">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Identité COF</p>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">Bulletins d&apos;information</h1>
        </div>
        <p className="text-white/60 text-sm">Chargement…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="text-center mb-14">
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">Bulletins d&apos;information</h1>
        </div>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header style aligné formations/contenu */}
      <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Identité COF</p>
        <h1 className="text-5xl font-black text-white tracking-tight mb-4">
          Bulletins{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            d&apos;information
          </span>
        </h1>
        <p className="text-white/60 max-w-xl mx-auto mb-6">
          Les bulletins sont affichés du plus récent au plus ancien.
        </p>
        {canEdit && (
          <Link
            href="/identite-cof/bulletins/nouveau"
            className="inline-block text-sm px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200"
          >
            + Créer un bulletin
          </Link>
        )}
      </div>

      {bulletins.length === 0 ? (
        <p className="text-white/50 italic text-center animate-in fade-in duration-500">
          Aucun bulletin pour le moment.
          {canEdit
            ? " Cliquez sur « Créer un bulletin » pour en ajouter."
            : " Les bulletins peuvent être ajoutés dans l'admin (Bulletins d'information)."}
        </p>
      ) : (
        <ul className="flex flex-col gap-4 animate-in fade-in duration-500">
          {bulletins.map((b) => {
            const isDraft = "is_published" in b && !b.is_published;
            return (
              <li key={b.id}>
                <div className="group bg-gradient-to-br from-purple-600/20 to-purple-700/10 border border-purple-500/30 rounded-2xl px-6 py-5 backdrop-blur-md hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 transition-all duration-200 flex flex-wrap items-center justify-between gap-4">
                  <Link href={`/identite-cof/bulletins/${b.slug}`} className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-white group-hover:text-purple-200 transition-colors">{b.title}</h2>
                    <time
                      className="text-white/50 text-sm"
                      dateTime={b.published_at ?? b.created_at}
                    >
                      {formatDate(b.published_at ?? b.created_at)}
                    </time>
                    {isDraft && (
                      <span className="ml-2 text-amber-400 text-sm">(Brouillon)</span>
                    )}
                  </Link>
                  {canEdit && (
                    <Link
                      href={`/identite-cof/bulletins/${b.slug}/edit`}
                      className="shrink-0 px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white/60 text-sm hover:bg-white/20 hover:text-white transition-all duration-200"
                    >
                      Modifier
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
