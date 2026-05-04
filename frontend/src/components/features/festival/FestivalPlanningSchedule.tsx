"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

const IMG_PART1 = "/images/festival/pbvf-2026-planning-part1.png";
const IMG_PART2 = "/images/festival/pbvf-2026-planning-part2.png";

type FestivalPlanningScheduleProps = {
  variant?: "page" | "overlay";
  showFullPageLink?: boolean;
};

/**
 * Planning visuel PBVF 2026 en deux parties (jeu–ven puis sam–dim), avec textes d’accompagnement i18n.
 */
export function FestivalPlanningSchedule({
  variant = "page",
  showFullPageLink = false,
}: FestivalPlanningScheduleProps) {
  const t = useTranslations("pages.festivalNotreProgramme");
  const isPage = variant === "page";

  const textMuted = isPage ? "text-white/80" : "text-white/75";
  const textSoft = isPage ? "text-white/65" : "text-white/60";
  const border = isPage ? "border-white/15" : "border-white/10";

  return (
    <section
      className={["space-y-6", isPage ? "" : "max-w-3xl mx-auto w-full"].join(" ")}
      aria-labelledby="festival-planning-heading"
    >
      <div className="space-y-3">
        <h2
          id="festival-planning-heading"
          className={[
            "text-lg md:text-xl font-bold tracking-wide uppercase",
            isPage ? "text-amber-200/95" : "text-amber-200/90",
          ].join(" ")}
        >
          {t("planningSectionTitle")}
        </h2>
        <p className={["text-sm md:text-base leading-relaxed", textMuted].join(" ")}>{t("planningIntro")}</p>
      </div>

      <figure className={`rounded-xl overflow-hidden border ${border} bg-black/30 shadow-lg`}>
        <Image
          src={IMG_PART1}
          alt={t("planningImage1Alt")}
          width={1920}
          height={1080}
          className="w-full h-auto object-contain"
          sizes="(max-width: 768px) 100vw, 896px"
          priority={isPage}
        />
      </figure>

      <p className={["text-sm md:text-base leading-relaxed", textMuted].join(" ")}>{t("planningBetween")}</p>

      <figure className={`rounded-xl overflow-hidden border ${border} bg-black/30 shadow-lg`}>
        <Image
          src={IMG_PART2}
          alt={t("planningImage2Alt")}
          width={1920}
          height={1080}
          className="w-full h-auto object-contain"
          sizes="(max-width: 768px) 100vw, 896px"
        />
      </figure>

      <div className="space-y-2 pt-1 text-center md:text-left">
        <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-amber-200/85">
          {t("planningDisclaimer")}
        </p>
        <p className={["text-xs", textSoft].join(" ")}>{t("planningVisualNote")}</p>
        <p className={["text-xs italic", textSoft].join(" ")}>{t("planningCredit")}</p>
      </div>

      {showFullPageLink ? (
        <div className="pt-2 flex justify-center md:justify-start">
          <Link
            href="/festival/notre-programme"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#f3ac41] border border-[#f3ac41] hover:brightness-110 text-black text-sm font-bold transition"
          >
            {t("planningFullPageCta")}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
