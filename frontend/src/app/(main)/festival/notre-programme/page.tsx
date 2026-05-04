import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSiteConfig } from "@/lib/api";
import { EditableConfigMarkdownPage } from "@/components/shared/EditableConfigMarkdownPage";
import { FestivalPlanningSchedule } from "@/components/features/festival/FestivalPlanningSchedule";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return {
    title: t("festivalNotreProgramme.metaTitle"),
    description: t("festivalNotreProgramme.metaDescription"),
  };
}

export default async function FestivalNotreProgrammePage() {
  const t = await getTranslations("pages");
  let initialValue = "";
  try {
    const config = await getSiteConfig();
    const fromApi = (config.festival_notre_programme_markdown ?? "").trim();
    initialValue = fromApi || t("festivalNotreProgramme.defaultMarkdown");
  } catch {
    initialValue = t("festivalNotreProgramme.defaultMarkdown");
  }

  return (
    <EditableConfigMarkdownPage
      eyebrow={t("festivalNotreProgramme.eyebrow")}
      title={t("festivalNotreProgramme.title")}
      subtitle={t("festivalNotreProgramme.subtitle")}
      initialValue={initialValue}
      field="festival_notre_programme_markdown"
      emptyText={t("festivalNotreProgramme.empty")}
      preface={<FestivalPlanningSchedule variant="page" />}
      collapsibleMarkdown={{
        expandLabel: t("festivalNotreProgramme.expandMarkdownDetails"),
        collapseLabel: t("festivalNotreProgramme.collapseMarkdownDetails"),
      }}
    />
  );
}
