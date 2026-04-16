import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSiteConfig } from "@/lib/api";
import { EditableConfigMarkdownPage } from "@/components/shared/EditableConfigMarkdownPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return {
    title: t("festivalAllStarStreetBattle.metaTitle"),
    description: t("festivalAllStarStreetBattle.metaDescription"),
  };
}

export default async function FestivalAllStarStreetBattlePage() {
  const t = await getTranslations("pages");
  let initialValue = "";
  try {
    const config = await getSiteConfig();
    initialValue = config.festival_all_star_street_battle_markdown ?? "";
  } catch {
    initialValue = "";
  }

  return (
    <EditableConfigMarkdownPage
      eyebrow={t("festivalAllStarStreetBattle.eyebrow")}
      title={t("festivalAllStarStreetBattle.title")}
      subtitle={t("festivalAllStarStreetBattle.subtitle")}
      initialValue={initialValue}
      field="festival_all_star_street_battle_markdown"
      emptyText={t("festivalAllStarStreetBattle.empty")}
    />
  );
}
