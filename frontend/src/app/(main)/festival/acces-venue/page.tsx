import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getSiteConfig } from "@/lib/api";
import { EditableConfigMarkdownPage } from "@/components/shared/EditableConfigMarkdownPage";
import {
  FESTIVAL_ACCES_VENUE_TEASER_VIDEO_SRC,
  getFestivalAccesVenueFallback,
} from "@/data/festivalAccesVenueFallback";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return {
    title: t("festivalVenue.metaTitle"),
    description: t("festivalVenue.metaDescription"),
  };
}

/**
 * Page Accès & Venue — Markdown éditable (API) avec repli FR/EN/ES
 * aligné sur le pattern All Star Street Battle / Notre programme.
 * Teaser vidéo sous le sous-titre (même fichier que l’overlay Explore).
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
    <EditableConfigMarkdownPage
      eyebrow={t("festivalVenue.eyebrow")}
      title={t("festivalVenue.title")}
      subtitle={t("festivalVenue.subtitle")}
      initialValue={initialValue}
      field="festival_acces_venue_markdown"
      emptyText={t("festivalVenue.empty")}
      titleBeforeVideo
      heroVideo={{
        src: FESTIVAL_ACCES_VENUE_TEASER_VIDEO_SRC,
        ariaLabel: t("festivalVenue.title"),
        controls: false,
      }}
    />
  );
}
