"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { markdownToHtml } from "@/lib/markdownToHtml";
import { getSiteConfig } from "@/lib/api";
import { EditableConfigMarkdownPage } from "@/components/shared/EditableConfigMarkdownPage";

const proseClasses =
  "text-white/90 leading-relaxed [&_a]:text-purple-400 [&_a:hover]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_ul]:list-disc [&_ol]:list-decimal [&_pre]:bg-white/5 [&_pre]:p-4 [&_pre]:rounded-lg";

export function FestivalEditorialNode({ contentKey }: { contentKey: string }) {
  const t = useTranslations("pages");
  const eyebrow = t(`${contentKey}.eyebrow`);
  const title = t(`${contentKey}.title`);
  const subtitle = t(`${contentKey}.subtitle`);
  const empty = t(`${contentKey}.empty`);

  const field = useMemo(() => {
    if (contentKey === "festivalJackNJill") return "festival_jack_n_jill_markdown";
    if (contentKey === "festivalAllStarStreetBattle") return "festival_all_star_street_battle_markdown";
    return null;
  }, [contentKey]);

  const [initialValue, setInitialValue] = useState("");
  useEffect(() => {
    if (!field) return;
    let cancelled = false;
    getSiteConfig()
      .then((cfg) => {
        const v = (cfg as any)[field] ?? "";
        if (!cancelled) setInitialValue(String(v || ""));
      })
      .catch(() => {
        if (!cancelled) setInitialValue("");
      });
    return () => {
      cancelled = true;
    };
  }, [field]);

  return (
    <div className="min-h-screen text-white px-4 md:px-8 py-16">
      <div className="max-w-4xl mx-auto">
        {field ? (
          <EditableConfigMarkdownPage
            eyebrow={eyebrow}
            title={title}
            subtitle={subtitle}
            initialValue={initialValue}
            field={field as any}
            emptyText={empty}
          />
        ) : (
          <p className="text-white/60">Page indisponible.</p>
        )}
      </div>
    </div>
  );
}

