"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

const IMG_THURSDAY_FRIDAY = "/images/festival/pbvf-2026-shuttles-thursday-friday.png";
const IMG_SATURDAY_SUNDAY = "/images/festival/pbvf-2026-shuttles-saturday-sunday.png";

/** Ratio proche des visuels source (affiche verticale navettes). */
const SHUTTLE_POSTER_WIDTH = 819;
const SHUTTLE_POSTER_HEIGHT = 1024;

/**
 * Horaires navettes PBVF 2026 — jeudi–vendredi puis samedi–dimanche.
 * Inputs: clés i18n `pages.festivalPlanning.shuttle*`.
 * Outputs: deux affiches dans l'ordre chronologique du festival.
 */
export function FestivalShuttleSchedule() {
  const t = useTranslations("pages.festivalPlanning");

  return (
    <section className="space-y-6" aria-labelledby="festival-shuttles-heading">
      <div className="space-y-3">
        <h2
          id="festival-shuttles-heading"
          className="text-lg md:text-xl font-bold tracking-wide uppercase text-amber-200/95"
        >
          {t("shuttleSectionTitle")}
        </h2>
        <p className="text-sm md:text-base leading-relaxed text-white/80">{t("shuttleIntro")}</p>
      </div>

      <figure className="overflow-hidden rounded-xl border border-white/15 bg-black/30 shadow-lg">
        <Image
          src={IMG_THURSDAY_FRIDAY}
          alt={t("shuttleImageThursdayFridayAlt")}
          width={SHUTTLE_POSTER_WIDTH}
          height={SHUTTLE_POSTER_HEIGHT}
          className="h-auto w-full object-contain"
          sizes="(max-width: 768px) 100vw, 896px"
          priority
        />
      </figure>

      <p className="text-sm md:text-base leading-relaxed text-white/80">{t("shuttleBetween")}</p>

      <figure className="overflow-hidden rounded-xl border border-white/15 bg-black/30 shadow-lg">
        <Image
          src={IMG_SATURDAY_SUNDAY}
          alt={t("shuttleImageSaturdaySundayAlt")}
          width={SHUTTLE_POSTER_WIDTH}
          height={SHUTTLE_POSTER_HEIGHT}
          className="h-auto w-full object-contain"
          sizes="(max-width: 768px) 100vw, 896px"
        />
      </figure>
    </section>
  );
}
