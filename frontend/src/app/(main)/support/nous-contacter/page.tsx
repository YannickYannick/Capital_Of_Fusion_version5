import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSiteConfig } from "@/lib/api";
import { EditableConfigMarkdownPage } from "@/components/shared/EditableConfigMarkdownPage";
import { SupportContactChannels } from "@/components/shared/SupportContactChannels";

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
      preface={
        <SupportContactChannels
          headerTitle={t("supportContact.channelsHeader")}
          introBefore={t("supportContact.channelsIntroBefore")}
          introHighlight={t("supportContact.channelsIntroHighlight")}
          introAfter={t("supportContact.channelsIntroAfter")}
          whatsappLabel={t("supportContact.whatsappLabel")}
          emailLabel={t("supportContact.emailLabel")}
          whatsappLinkLabel={t("supportContact.whatsappLinkLabel")}
          emailLinkLabel={t("supportContact.emailLinkLabel")}
        />
      }
    />
  );
}

