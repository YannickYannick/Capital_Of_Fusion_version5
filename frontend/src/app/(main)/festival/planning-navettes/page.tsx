import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSiteConfig } from "@/lib/api";
import { EditableConfigMarkdownPage } from "@/components/shared/EditableConfigMarkdownPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return {
    title: t("festivalPlanning.metaTitle"),
    description: t("festivalPlanning.metaDescription"),
  };
}

export default async function FestivalPlanningNavettesPage() {
  const t = await getTranslations("pages");
  let initialValue = "";
  try {
    const config = await getSiteConfig();
    initialValue = config.festival_planning_navettes_markdown ?? "";
  } catch {
    initialValue = "";
  }

  return (
    <EditableConfigMarkdownPage
      eyebrow={t("festivalPlanning.eyebrow")}
      title={t("festivalPlanning.title")}
      subtitle={t("festivalPlanning.subtitle")}
      initialValue={initialValue}
      field="festival_planning_navettes_markdown"
      emptyText={t("festivalPlanning.empty")}
    />
  );
}

