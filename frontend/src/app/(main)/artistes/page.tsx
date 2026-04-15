"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { getArtists } from "@/lib/api";
import type { ArtistApi } from "@/types/user";
import ArtistCard from "@/components/features/artists/ArtistCard";
import { AnimatedDiv } from "@/components/shared/AnimatedDiv";
import { StandardPageShell, StandardPageHero } from "@/components/shared/StandardPage";
import { AdminToolbar } from "@/components/shared/AdminEditButton";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

const DJANGO_ADMIN_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ArtistesPage() {
  const t = useTranslations("pages");
  const tp = useTranslations("artistCreate");
  const { user } = useAuth();
  const [allArtists, setAllArtists] = useState<ArtistApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'staff' | 'others'>('all');

  const fetchArtists = useCallback(() => {
    setLoading(true);
    getArtists()
      .then(setAllArtists)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  const artists = useMemo(() => {
    if (filter === 'staff') return allArtists.filter((a) => a.is_staff_member);
    if (filter === 'others') return allArtists.filter((a) => !a.is_staff_member);
    return allArtists;
  }, [allArtists, filter]);

  if (loading && artists.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <StandardPageShell>
      <AdminToolbar
        pageType="Artistes"
        djangoAdminUrl={`${DJANGO_ADMIN_BASE}/admin/users/user/`}
        onRefresh={fetchArtists}
      />
      <div className="text-white">
        <StandardPageHero
          eyebrow={t("artists.eyebrow")}
          title={t("artists.titleBefore")}
          highlight={t("artists.titleHighlight")}
          description={t("artists.subtitle")}
          bottomSpacingClassName="mb-6"
        />

        <div className="mb-12 flex justify-center">
          <Image
            src="/artistes-banner-fb.jpg"
            alt={t("artists.bannerAlt")}
            width={1200}
            height={675}
            sizes="(max-width: 768px) 100vw, 896px"
            className="w-full max-w-4xl rounded-2xl border border-white/10 object-cover shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
            priority
          />
        </div>

        {(user?.user_type === "STAFF" || user?.user_type === "ADMIN") && (
          <div className="mb-10 flex justify-center">
            <Link
              href="/artistes/nouveau"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-purple-600/90 text-white hover:bg-purple-500 transition shadow-lg shadow-purple-600/20"
            >
              <span className="text-lg leading-none">＋</span>
              {tp("ctaNewArtist")}
            </Link>
          </div>
        )}

        <AnimatedDiv
          animation="fadeInUp"
          delay={0.05}
          className="mb-14"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-3">
            {t("artists.filterLabel")}
          </p>
          <div className="flex flex-wrap gap-2 p-2 bg-white/[0.03] border border-white/10 rounded-2xl max-w-full">
            {(
              [
                { id: "all" as const, labelKey: "filterAll" as const },
                { id: "staff" as const, labelKey: "filterStaff" as const },
                { id: "others" as const, labelKey: "filterExternal" as const },
              ] as const
            ).map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                  filter === btn.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {t(`artists.${btn.labelKey}`)}
              </button>
            ))}
          </div>
        </AnimatedDiv>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] text-red-500 text-center">
            <p className="text-2xl font-black mb-2 uppercase italic tracking-tighter">{t("artists.errorTitle")}</p>
            <p className="text-sm font-light opacity-60">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {artists.map((artist, idx) => (
              <AnimatedDiv
                key={artist.id}
                animation="fadeInUp"
                delay={Math.min(idx * 0.04, 0.3)}
              >
                <ArtistCard artist={artist} priority={idx < 4} />
              </AnimatedDiv>
            ))}
          </div>
        )}

        {!loading && artists.length === 0 && !error && (
          <div className="text-center py-32 text-white/10 border-2 border-dashed border-white/5 rounded-[3rem]">
            <p className="text-3xl font-black tracking-widest uppercase italic italic">{t("artists.emptyTitle")}</p>
            <p className="text-xs mt-4 tracking-[0.3em] font-light">{t("artists.emptySubtitle")}</p>
          </div>
        )}
      </div>
    </StandardPageShell>
  );
}
