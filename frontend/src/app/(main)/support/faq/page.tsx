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
      <div
        className={[
          "rounded-2xl border border-white/15",
          "bg-black/65 backdrop-blur-md",
          "shadow-[0_16px_48px_rgba(0,0,0,0.55)] ring-1 ring-inset ring-white/10",
          "px-5 py-8 md:px-9 md:py-10",
        ].join(" ")}
      >
        <p className="text-xs uppercase tracking-widest text-purple-200 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
          {t("supportFaq.eyebrow")}
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)]">
          {t("supportFaq.title")}
        </h1>
        <p className="mt-4 text-white/85 drop-shadow-[0_1px_6px_rgba(0,0,0,0.75)] max-w-3xl">
          {t("supportFaq.subtitle")}
        </p>

        {faqItems.length > 0 && (
          <section className="mt-10">
            <FaqAccordion items={faqItems} />
          </section>
        )}
      </div>
    </div>
  );
}

