import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getSiteConfig } from "@/lib/api";
import { EditableConfigMarkdownPage } from "@/components/shared/EditableConfigMarkdownPage";

const BOOK_HOTEL_LOCALES = new Set(["fr", "en", "es"]);

function readBookYourHotelDefaultMarkdown(locale: string): string {
  const loc = BOOK_HOTEL_LOCALES.has(locale) ? locale : "fr";
  const dir = path.join(process.cwd(), "content", "festival-book-hotel");
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
    title: t("festivalBookHotel.metaTitle"),
    description: t("festivalBookHotel.metaDescription"),
  };
}

export default async function FestivalBookYourHotelPage() {
  const t = await getTranslations("pages");
  const locale = await getLocale();
  let initialValue = "";
  try {
    const config = await getSiteConfig();
    initialValue = config.festival_book_your_hotel_markdown ?? "";
  } catch {
    initialValue = "";
  }
  if (!initialValue.trim()) {
    initialValue = readBookYourHotelDefaultMarkdown(locale);
  }

  return (
    <EditableConfigMarkdownPage
      eyebrow={t("festivalBookHotel.eyebrow")}
      title={t("festivalBookHotel.title")}
      subtitle={t("festivalBookHotel.subtitle")}
      initialValue={initialValue}
      field="festival_book_your_hotel_markdown"
      emptyText={t("festivalBookHotel.empty")}
      ctaBelowSubtitle={{
        href: "https://www.goandance.com/en/event/8924/paris-bachata-vibe-festival-2026",
        label: t("festivalBookHotel.ctaGoAndDance"),
      }}
    />
  );
}
