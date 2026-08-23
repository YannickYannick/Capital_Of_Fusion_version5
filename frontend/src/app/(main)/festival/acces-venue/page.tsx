import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getSiteConfig } from "@/lib/api";
import { FestivalAccesVenueMarkdown } from "@/components/features/festival/FestivalAccesVenueMarkdown";
import { getFestivalAccesVenueFallback } from "@/data/festivalAccesVenueFallback";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return {
    title: t("festivalVenue.metaTitle"),
    description: t("festivalVenue.metaDescription"),
  };
}

/**
 * Page Accès & Venue — Markdown éditable (API) avec repli FR/EN/ES
 * et plan interactif photo/vidéo « comment entrer sur le site ».
 */
export default async function FestivalAccesVenuePage() {
  const t = await getTranslations("pages");
  const locale = await getLocale();
  const fallback = getFestivalAccesVenueFallback(locale);

  let initialValue = fallback;
  try {
    const config = await getSiteConfig();
    const fromApi = (config.festival_acces_venue_markdown ?? "").trim();
    initialValue = fromApi || fallback;
  } catch {
    initialValue = fallback;
  }

  return (
    <FestivalAccesVenueMarkdown
      eyebrow={t("festivalVenue.eyebrow")}
      title={t("festivalVenue.title")}
      subtitle={t("festivalVenue.subtitle")}
      initialValue={initialValue}
      emptyText={t("festivalVenue.empty")}
      siteEntryPlanImageAlt={t("festivalVenue.siteEntryPlanImageAlt")}
      siteEntryPlanVideoAria={t("festivalVenue.siteEntryPlanVideoAria")}
      siteEntryPlanShowVideo={t("festivalVenue.siteEntryPlanShowVideo")}
      siteEntryPlanShowPhoto={t("festivalVenue.siteEntryPlanShowPhoto")}
    />
  );
}
