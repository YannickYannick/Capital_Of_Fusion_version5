"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { getBulletins, getAdminBulletins } from "@/lib/api";
import type { BulletinApi, BulletinAdminApi } from "@/types/config";

function formatDate(dateStr: string | null, locale: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function BulletinsListClient() {
  const t = useTranslations("pages.bulletins");
  const locale = useLocale();
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
        setError(e instanceof Error ? e.message : t("error"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [canEdit, t]);

  if (loading) {
    return (
      <div>
        <div className="text-center mb-14">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">{t("eyebrow")}</p>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">{t("title")}</h1>
        </div>
        <p className="text-white/60 text-sm">{t("loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="text-center mb-14">
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">{t("title")}</h1>
        </div>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">{t("eyebrow")}</p>
        <h1 className="text-5xl font-black text-white tracking-tight mb-4">
          {t("title")}{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t("titleHighlight")}
          </span>
        </h1>
        <p className="text-white/60 max-w-xl mx-auto mb-6">{t("subtitle")}</p>
        {canEdit && (
          <Link
            href="/identite-cof/bulletins/nouveau"
            className="inline-block text-sm px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200"
          >
            {t("createButton")}
          </Link>
        )}
      </div>

      {bulletins.length === 0 ? (
        <p className="text-white/50 italic text-center animate-in fade-in duration-500">
          {t("empty")}{" "}
          {canEdit ? t("emptyAdmin") : t("emptyPublic")}
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
                      {formatDate(b.published_at ?? b.created_at, locale)}
                    </time>
                    {isDraft && (
                      <span className="ml-2 text-amber-400 text-sm">({t("draft")})</span>
                    )}
                  </Link>
                  {canEdit && (
                    <Link
                      href={`/identite-cof/bulletins/${b.slug}/edit`}
                      className="shrink-0 px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white/60 text-sm hover:bg-white/20 hover:text-white transition-all duration-200"
                    >
                      {t("editButton")}
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
