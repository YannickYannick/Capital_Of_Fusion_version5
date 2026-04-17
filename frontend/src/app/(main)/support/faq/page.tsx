import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSiteConfig, getFaqItems } from "@/lib/api";
import { EditableConfigMarkdownPage } from "@/components/shared/EditableConfigMarkdownPage";
import { FaqAccordion } from "@/components/shared/FaqAccordion";

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

  const faqItems = await getFaqItems();

  return (
    <div className="space-y-12">
      <EditableConfigMarkdownPage
        eyebrow={t("supportFaq.eyebrow")}
        title={t("supportFaq.title")}
        subtitle={t("supportFaq.subtitle")}
        initialValue={initialValue}
        field="support_faq_markdown"
        emptyText={t("supportFaq.empty")}
      />

      {faqItems.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-white mb-6">
            {t("supportFaq.faqSectionTitle")}
          </h2>
          <FaqAccordion items={faqItems} />
        </section>
      )}
    </div>
  );
}

