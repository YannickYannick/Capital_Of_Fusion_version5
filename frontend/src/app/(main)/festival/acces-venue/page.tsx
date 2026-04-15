import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSiteConfig } from "@/lib/api";
import { EditableConfigMarkdownPage } from "@/components/shared/EditableConfigMarkdownPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return {
    title: t("festivalVenue.metaTitle"),
    description: t("festivalVenue.metaDescription"),
  };
}

export default async function FestivalAccesVenuePage() {
  const t = await getTranslations("pages");
  let initialValue = "";
  try {
    const config = await getSiteConfig();
    initialValue = config.festival_acces_venue_markdown ?? "";
  } catch {
    initialValue = "";
  }

  return (
    <EditableConfigMarkdownPage
      eyebrow={t("festivalVenue.eyebrow")}
      title={t("festivalVenue.title")}
      subtitle={t("festivalVenue.subtitle")}
      initialValue={initialValue}
      field="festival_acces_venue_markdown"
      emptyText={t("festivalVenue.empty")}
    />
  );
}

