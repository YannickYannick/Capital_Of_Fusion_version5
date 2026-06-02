import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { FestivalGiveawayClient } from "./FestivalGiveawayClient";

const GIVEAWAY_LOCALES = new Set(["fr", "en", "es"]);

/** Publication officielle du jeu concours PBVF sur Instagram. */
const FESTIVAL_GIVEAWAY_INSTAGRAM_URL =
  "https://www.instagram.com/p/DYU6CXUih_w/?igsh=aXpuNXEwcTJ2cnpi";

function readGiveawayMarkdown(locale: string): string {
  const loc = GIVEAWAY_LOCALES.has(locale) ? locale : "fr";
  const dir = path.join(process.cwd(), "content", "festival-giveaway");
  try {
    return fs.readFileSync(path.join(dir, `${loc}.md`), "utf8");
  } catch {
    try {
      return fs.readFileSync(path.join(dir, "fr.md"), "utf8");
    } catch {
      return "";
    }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return {
    title: t("festivalGiveaway.metaTitle"),
    description: t("festivalGiveaway.metaDescription"),
  };
}

export default async function FestivalGiveawayPage() {
  const t = await getTranslations("pages");
  const locale = await getLocale();
  const markdown = readGiveawayMarkdown(locale);

  return (
    <FestivalGiveawayClient
      eyebrow={t("festivalGiveaway.eyebrow")}
      title={t("festivalGiveaway.title")}
      subtitle={t("festivalGiveaway.subtitle")}
      instagramCta={t("festivalGiveaway.instagramCta")}
      instagramHref={FESTIVAL_GIVEAWAY_INSTAGRAM_URL}
      initialMarkdown={markdown}
    />
  );
}
