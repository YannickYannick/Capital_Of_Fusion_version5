import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSiteConfig } from "@/lib/api";
import { EditableConfigMarkdownPage } from "@/components/shared/EditableConfigMarkdownPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return {
    title: t("festivalJackNJill.metaTitle"),
    description: t("festivalJackNJill.metaDescription"),
  };
}

export default async function FestivalJackNJillPage() {
  const t = await getTranslations("pages");
  let initialValue = "";
  try {
    const config = await getSiteConfig();
    initialValue = config.festival_jack_n_jill_markdown ?? "";
  } catch {
    initialValue = "";
  }

  return (
    <EditableConfigMarkdownPage
      eyebrow={t("festivalJackNJill.eyebrow")}
      title={t("festivalJackNJill.title")}
      subtitle={t("festivalJackNJill.subtitle")}
      initialValue={initialValue}
      field="festival_jack_n_jill_markdown"
      emptyText={t("festivalJackNJill.empty")}
    />
  );
}
