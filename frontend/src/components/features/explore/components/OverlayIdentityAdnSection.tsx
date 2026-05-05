"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getSiteConfig } from "@/lib/api";
import { markdownToHtml } from "@/lib/markdownToHtml";

/** Même styles prose que `EditableConfigMarkdownPage` (ADN du festival). */
const proseClasses =
  "leading-relaxed text-white/95 [&_p]:text-white/95 [&_li]:text-white/95 " +
  "[&_a]:text-purple-300 [&_a]:font-medium [&_a:hover]:underline [&_a:hover]:text-purple-200 " +
  "[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-lg md:[&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white " +
  "[&_h3]:text-white [&_h3]:font-semibold [&_strong]:text-white [&_strong]:font-semibold " +
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:marker:text-purple-300/90 " +
  "[&_hr]:my-6 [&_hr]:border-0 [&_hr]:h-px [&_hr]:bg-gradient-to-r [&_hr]:from-transparent [&_hr]:via-white/25 [&_hr]:to-transparent " +
  "[&_img]:my-4 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:border [&_img]:border-white/10";

/**
 * Contenu « ADN du festival » (config site) pour la planète Our Identity — aligné sur
 * `/identite-cof/adn-du-festival`.
 */
export function OverlayIdentityAdnSection() {
  const tp = useTranslations("pages");
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void getSiteConfig()
      .then((cfg) => {
        if (cancelled) return;
        const md = cfg.identite_adn_festival_markdown ?? "";
        setHtml(md.trim() ? markdownToHtml(md) : "");
      })
      .catch(() => {
        if (!cancelled) setHtml("");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"
          aria-hidden
        />
      </div>
    );
  }

  if (!html) {
    return (
      <p className="text-center text-sm text-white/55">{tp("identiteAdnFestival.empty")}</p>
    );
  }

  return (
    <div
      className={proseClasses}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
