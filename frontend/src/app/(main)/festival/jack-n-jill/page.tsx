import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getSiteConfig } from "@/lib/api";
import { EditableConfigMarkdownPage } from "@/components/shared/EditableConfigMarkdownPage";
import { FestivalJackNJillTabs } from "@/components/features/festival/FestivalJackNJillTabs";
import { getFestivalJackNJillFallback, withJackNJillPosters } from "@/data/festivalJackNJillFallback";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return {
    title: t("festivalJackNJill.metaTitle"),
    description: t("festivalJackNJill.metaDescription"),
  };
}

/**
 * Page Jack N Jill — onglets Infos (Markdown) / Juges (affiches panels).
 */
export default async function FestivalJackNJillPage() {
  const t = await getTranslations("pages");
  const locale = await getLocale();
  const fallback = getFestivalJackNJillFallback(locale);

  let initialValue = fallback;
  try {
    const config = await getSiteConfig();
    const fromApi = (config.festival_jack_n_jill_markdown ?? "").trim();
    initialValue = withJackNJillPosters(fromApi || fallback, locale);
  } catch {
    initialValue = withJackNJillPosters(fallback, locale);
  }

  return (
    <FestivalJackNJillTabs
      locale={locale}
      infosLabel={t("festivalJackNJill.tabInfos")}
      judgesLabel={t("festivalJackNJill.tabJudges")}
      judgesIntro={t("festivalJackNJill.judgesIntro")}
      eyebrow={t("festivalJackNJill.eyebrow")}
      title={t("festivalJackNJill.title")}
      subtitle={t("festivalJackNJill.subtitle")}
      infos={
        <EditableConfigMarkdownPage
          eyebrow={t("festivalJackNJill.eyebrow")}
          title={t("festivalJackNJill.title")}
          subtitle={t("festivalJackNJill.subtitle")}
          initialValue={initialValue}
          field="festival_jack_n_jill_markdown"
          emptyText={t("festivalJackNJill.empty")}
        />
      }
    />
  );
}
