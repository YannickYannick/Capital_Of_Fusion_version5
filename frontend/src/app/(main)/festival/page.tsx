import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.festivalIndex");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function FestivalIndexPage() {
  const t = await getTranslations("pages.festivalIndex");
  return (
    <div className="text-white">
      <p className="text-xs uppercase tracking-widest text-purple-300/90">
        {t("eyebrow")}
      </p>
      <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">
        {t("title")}
      </h1>
      <p className="mt-4 text-white/60">
        {t("subtitle")}
      </p>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/festival/planning-navettes"
          className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
        >
          <div className="text-sm font-semibold">{t("cards.planning.title")}</div>
          <div className="mt-1 text-xs text-white/55">{t("cards.planning.desc")}</div>
        </Link>
        <Link
          href="/festival/acces-venue"
          className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
        >
          <div className="text-sm font-semibold">{t("cards.venue.title")}</div>
          <div className="mt-1 text-xs text-white/55">{t("cards.venue.desc")}</div>
        </Link>
        <Link
          href="/festival/book-your-hotel"
          className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
        >
          <div className="text-sm font-semibold">{t("cards.bookHotel.title")}</div>
          <div className="mt-1 text-xs text-white/55">{t("cards.bookHotel.desc")}</div>
        </Link>
        <Link
          href="/festival/notre-programme"
          className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
        >
          <div className="text-sm font-semibold">{t("cards.programme.title")}</div>
          <div className="mt-1 text-xs text-white/55">{t("cards.programme.desc")}</div>
        </Link>
        <Link
          href="/festival/jack-n-jill"
          className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
        >
          <div className="text-sm font-semibold">{t("cards.jackNJill.title")}</div>
          <div className="mt-1 text-xs text-white/55">{t("cards.jackNJill.desc")}</div>
        </Link>
        <Link
          href="/festival/all-star-street-battle"
          className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
        >
          <div className="text-sm font-semibold">{t("cards.allStarBattle.title")}</div>
          <div className="mt-1 text-xs text-white/55">{t("cards.allStarBattle.desc")}</div>
        </Link>
      </div>
    </div>
  );
}

