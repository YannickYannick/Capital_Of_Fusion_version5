import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSiteConfig } from "@/lib/api";
import { EditableConfigMarkdownPage } from "@/components/shared/EditableConfigMarkdownPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return {
    title: t("supportContact.metaTitle"),
    description: t("supportContact.metaDescription"),
  };
}

export default async function SupportNousContacterPage() {
  const t = await getTranslations("pages");
  let initialValue = "";
  try {
    const config = await getSiteConfig();
    initialValue = config.support_contact_markdown ?? "";
  } catch {
    initialValue = "";
  }

  return (
    <EditableConfigMarkdownPage
      eyebrow={t("supportContact.eyebrow")}
      title={t("supportContact.title")}
      subtitle={t("supportContact.subtitle")}
      initialValue={initialValue}
      field="support_contact_markdown"
      emptyText={t("supportContact.empty")}
    />
  );
}

