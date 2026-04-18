import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getFaqItems } from "@/lib/api";
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
  const faqItems = await getFaqItems();

  return (
    <div className="text-white">
      <p className="text-xs uppercase tracking-widest text-purple-300/90">
        {t("supportFaq.eyebrow")}
      </p>
      <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">
        {t("supportFaq.title")}
      </h1>
      <p className="mt-4 text-white/60">
        {t("supportFaq.subtitle")}
      </p>

      {faqItems.length > 0 && (
        <section className="mt-10">
          <FaqAccordion items={faqItems} />
        </section>
      )}
    </div>
  );
}

