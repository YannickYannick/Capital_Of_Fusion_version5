"use client";

import { useTranslations } from "next-intl";
import { markdownToHtml } from "@/lib/markdownToHtml";

const proseClasses =
  "text-white/90 leading-relaxed [&_a]:text-purple-400 [&_a:hover]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_ul]:list-disc [&_ol]:list-decimal [&_pre]:bg-white/5 [&_pre]:p-4 [&_pre]:rounded-lg";

export function FestivalEditorialNode({ contentKey }: { contentKey: string }) {
  const t = useTranslations("pages");
  const eyebrow = t(`${contentKey}.eyebrow`);
  const title = t(`${contentKey}.title`);
  const subtitle = t(`${contentKey}.subtitle`);
  const html = markdownToHtml(t(`${contentKey}.contentMarkdown`));
  const empty = t(`${contentKey}.empty`);

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-8 py-16">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-purple-300/90">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">
          {title}
        </h1>
        <p className="mt-4 text-white/60">{subtitle}</p>

        {html ? (
          <div className={`mt-10 ${proseClasses}`} dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p className="mt-10 text-white/50">{empty}</p>
        )}
      </div>
    </div>
  );
}

