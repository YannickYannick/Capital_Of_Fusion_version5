"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { getArtists } from "@/lib/api";
import type { ArtistApi } from "@/types/user";
import ArtistCard from "@/components/features/artists/ArtistCard";
import { AnimatedDiv } from "@/components/shared/AnimatedDiv";

/**
 * Liste compacte d’artistes dans la modale planète « Nos artistes » (Explore).
 */
export function OverlayArtistsGrid() {
  const t = useTranslations("explore.overlay");
  const [artists, setArtists] = useState<ArtistApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void getArtists()
      .then((list) => {
        if (!cancelled) {
          setArtists(list);
          setError(null);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"
          aria-hidden
        />
      </div>
    );
  }

  if (error) {
    return <p className="py-4 text-center text-sm text-red-400">{error}</p>;
  }

  if (artists.length === 0) {
    return <p className="py-6 text-center text-sm text-white/50">{t("artistsEmpty")}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid max-h-[min(50vh,480px)] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
        {artists.map((artist, i) => (
          <AnimatedDiv
            key={artist.id}
            animation="fadeInUp"
            delay={Math.min(i * 0.03, 0.2)}
          >
            <ArtistCard artist={artist} priority={i < 2} />
          </AnimatedDiv>
        ))}
      </div>
      <div className="flex justify-center pt-1">
        <Link
          href="/artistes"
          className="text-sm font-semibold text-[#f3ac41] underline-offset-4 hover:underline"
        >
          {t("artistsDirectoryFullPage")}
        </Link>
      </div>
    </div>
  );
}
