import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { markdownToHtml } from "@/lib/markdownToHtml";

const proseClasses =
  "text-white/90 leading-relaxed [&_a]:text-purple-400 [&_a:hover]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_ul]:list-disc [&_ol]:list-decimal [&_pre]:bg-white/5 [&_pre]:p-4 [&_pre]:rounded-lg";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return {
    title: t("supportFaq.metaTitle"),
    description: t("supportFaq.metaDescription"),
  };
}

export default async function SupportFaqPage() {
  const t = await getTranslations("pages");
  const html = markdownToHtml(t("supportFaq.contentMarkdown"));

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-purple-300/90">
        {t("supportFaq.eyebrow")}
      </p>
      <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">
        {t("supportFaq.title")}
      </h1>
      <p className="mt-4 text-white/60">{t("supportFaq.subtitle")}</p>

      {html ? (
        <div className={`mt-10 ${proseClasses}`} dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <p className="mt-10 text-white/50">{t("supportFaq.empty")}</p>
      )}
    </div>
  );
}

