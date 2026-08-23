import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getSiteConfig } from "@/lib/api";
import { EditableConfigMarkdownPage } from "@/components/shared/EditableConfigMarkdownPage";
import { getFestivalJackNJillFallback } from "@/data/festivalJackNJillFallback";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return {
    title: t("festivalJackNJill.metaTitle"),
    description: t("festivalJackNJill.metaDescription"),
  };
}

/**
 * Page Jack N Jill — Markdown éditable (API) avec repli FR/EN/ES
 * aligné sur le pattern Accès & Venue / All Star Street Battle.
 */
export default async function FestivalJackNJillPage() {
  const t = await getTranslations("pages");
  const locale = await getLocale();
  const fallback = getFestivalJackNJillFallback(locale);

  let initialValue = fallback;
  try {
    const config = await getSiteConfig();
    const fromApi = (config.festival_jack_n_jill_markdown ?? "").trim();
    initialValue = fromApi || fallback;
  } catch {
    initialValue = fallback;
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
