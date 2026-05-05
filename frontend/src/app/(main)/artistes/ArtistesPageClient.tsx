"use client";

import { useState, useCallback, useMemo } from "react";
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

type Props = {
  initialArtists: ArtistApi[];
  initialError: string | null;
};

export function ArtistesPageClient({ initialArtists, initialError }: Props) {
  const t = useTranslations("pages");
  const tp = useTranslations("artistCreate");
  const { user } = useAuth();
  const [allArtists, setAllArtists] = useState<ArtistApi[]>(initialArtists);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [filter, setFilter] = useState<"all" | "staff" | "others">("all");

  const fetchArtists = useCallback(() => {
    setLoading(true);
    getArtists()
      .then((data) => {
        setAllArtists(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const artists = useMemo(() => {
    if (filter === "staff") return allArtists.filter((a) => a.is_staff_member);
    if (filter === "others") return allArtists.filter((a) => !a.is_staff_member);
    return allArtists;
  }, [allArtists, filter]);

  if (loading && artists.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
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
              className="inline-flex items-center gap-2 rounded-full bg-purple-600/90 px-6 py-3 text-white shadow-lg shadow-purple-600/20 transition hover:bg-purple-500"
            >
              <span className="text-lg leading-none">＋</span>
              {tp("ctaNewArtist")}
            </Link>
          </div>
        )}

        <AnimatedDiv animation="fadeInUp" delay={0.05} className="mb-14">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/40">{t("artists.filterLabel")}</p>
          <div className="flex max-w-full flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
            {(
              [
                { id: "all" as const, labelKey: "filterAll" as const },
                { id: "staff" as const, labelKey: "filterStaff" as const },
                { id: "others" as const, labelKey: "filterExternal" as const },
              ] as const
            ).map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setFilter(btn.id)}
                className={`rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                  filter === btn.id
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                    : "text-white/40 hover:bg-white/5 hover:text-white"
                }`}
              >
                {t(`artists.${btn.labelKey}`)}
              </button>
            ))}
          </div>
        </AnimatedDiv>

        {error ? (
          <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-8 text-center text-red-500">
            <p className="mb-2 text-2xl font-black uppercase italic tracking-tighter">{t("artists.errorTitle")}</p>
            <p className="text-sm font-light opacity-60">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
            {artists.map((artist, idx) => (
              <AnimatedDiv key={artist.id} animation="fadeInUp" delay={Math.min(idx * 0.04, 0.3)}>
                <ArtistCard artist={artist} priority={idx < 4} imageWidth={560} />
              </AnimatedDiv>
            ))}
          </div>
        )}

        {!loading && artists.length === 0 && !error && (
          <div className="rounded-[3rem] border-2 border-dashed border-white/5 py-32 text-center text-white/10">
            <p className="text-3xl font-black uppercase italic tracking-widest">{t("artists.emptyTitle")}</p>
            <p className="mt-4 text-xs font-light tracking-[0.3em]">{t("artists.emptySubtitle")}</p>
          </div>
        )}
      </div>
    </StandardPageShell>
  );
}
