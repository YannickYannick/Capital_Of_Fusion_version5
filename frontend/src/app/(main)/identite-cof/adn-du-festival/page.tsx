import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSiteConfig } from "@/lib/api";
import { IdentiteAdnFestivalClient } from "./IdentiteAdnFestivalClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return {
    title: t("identiteAdnFestival.metaTitle"),
    description: t("identiteAdnFestival.metaDescription"),
  };
}

export default async function IdentiteAdnFestivalPage() {
  const t = await getTranslations("pages");

  let initialValue = "";
  try {
    const config = await getSiteConfig();
    initialValue = config.identite_adn_festival_markdown ?? "";
  } catch {
    initialValue = "";
  }

  return (
    <IdentiteAdnFestivalClient
      eyebrow={t("identiteAdnFestival.eyebrow")}
      title={t("identiteAdnFestival.title")}
      subtitle={t("identiteAdnFestival.subtitle")}
      initialValue={initialValue}
      emptyText={t("identiteAdnFestival.empty")}
    />
  );
}
