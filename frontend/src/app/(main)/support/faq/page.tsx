import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSiteConfig } from "@/lib/api";
import { EditableConfigMarkdownPage } from "@/components/shared/EditableConfigMarkdownPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return {
    title: t("supportFaq.metaTitle"),
    description: t("supportFaq.metaDescription"),
  };
}

export default async function SupportFaqPage() {
  const t = await getTranslations("pages");
  let initialValue = "";
  try {
    const config = await getSiteConfig();
    initialValue = config.support_faq_markdown ?? "";
  } catch {
    initialValue = "";
  }

  return (
    <EditableConfigMarkdownPage
      eyebrow={t("supportFaq.eyebrow")}
      title={t("supportFaq.title")}
      subtitle={t("supportFaq.subtitle")}
      initialValue={initialValue}
      field="support_faq_markdown"
      emptyText={t("supportFaq.empty")}
    />
  );
}

