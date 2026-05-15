"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { getSiteConfig } from "@/lib/api";
import { EditableConfigMarkdownPage } from "@/components/shared/EditableConfigMarkdownPage";
import { FestivalPlanningSchedule } from "@/components/features/festival/FestivalPlanningSchedule";
import {
  ALL_STAR_STREET_BATTLE_PAGE_HERO_VIDEO_SRC,
  getStreetBattleRegistrationLinks,
} from "@/data/allStarStreetBattlePlanetOverlayFallback";
import type { ExternalPageCta } from "@/components/shared/EditableConfigMarkdownPage";

export function FestivalEditorialNode({ contentKey }: { contentKey: string }) {
  const t = useTranslations("pages");
  const eyebrow = t(`${contentKey}.eyebrow`);
  const title = t(`${contentKey}.title`);
  const subtitle = t(`${contentKey}.subtitle`);
  const empty = t(`${contentKey}.empty`);

  const field = useMemo(() => {
    if (contentKey === "festivalJackNJill") return "festival_jack_n_jill_markdown";
    if (contentKey === "festivalAllStarStreetBattle") return "festival_all_star_street_battle_markdown";
    if (contentKey === "festivalNotreProgramme") return "festival_notre_programme_markdown";
    return null;
  }, [contentKey]);

  const [initialValue, setInitialValue] = useState("");
  useEffect(() => {
    if (!field) return;
    let cancelled = false;
    getSiteConfig()
      .then((cfg) => {
        const v = (cfg as any)[field] ?? "";
        if (!cancelled) setInitialValue(String(v || ""));
      })
      .catch(() => {
        if (!cancelled) setInitialValue("");
      });
    return () => {
      cancelled = true;
    };
  }, [field]);

  const streetBattleCtasAboveHero = useMemo((): ExternalPageCta[] | undefined => {
    if (contentKey !== "festivalAllStarStreetBattle") return undefined;
    const [primaryHref, secondaryHref] = getStreetBattleRegistrationLinks();
    return [
      {
        href: primaryHref,
        label: t("festivalAllStarStreetBattle.registerCtaPrimary"),
        variant: "primary",
      },
      {
        href: secondaryHref,
        label: t("festivalAllStarStreetBattle.registerCtaSecondary"),
        variant: "secondary",
      },
    ];
  }, [contentKey, t]);

  const isStreetBattle = contentKey === "festivalAllStarStreetBattle";

  return (
    <div className="min-h-screen text-white px-4 md:px-8 py-16">
      <div className="max-w-4xl mx-auto">
        {field ? (
          <EditableConfigMarkdownPage
            eyebrow={eyebrow}
            title={title}
            subtitle={subtitle}
            initialValue={initialValue}
            field={field as any}
            emptyText={empty}
            titleBeforeVideo={isStreetBattle}
            ctaAfterHero={isStreetBattle ? streetBattleCtasAboveHero : undefined}
            heroVideo={
              isStreetBattle
                ? {
                    src: ALL_STAR_STREET_BATTLE_PAGE_HERO_VIDEO_SRC,
                    ariaLabel: title,
                    controls: false,
                  }
                : undefined
            }
            preface={
              contentKey === "festivalNotreProgramme" ? (
                <FestivalPlanningSchedule variant="page" />
              ) : undefined
            }
            collapsibleMarkdown={
              contentKey === "festivalNotreProgramme"
                ? {
                    expandLabel: t("festivalNotreProgramme.expandMarkdownDetails"),
                    collapseLabel: t("festivalNotreProgramme.collapseMarkdownDetails"),
                  }
                : undefined
            }
          />
        ) : (
          <p className="text-white/60">Page indisponible.</p>
        )}
      </div>
    </div>
  );
}

