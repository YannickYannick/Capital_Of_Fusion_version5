/**
 * Page Identité COF — Notre vision (contenu markdown depuis la config du site).
 * Édition en ligne pour staff/admin via NotreVisionClient.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSiteConfig } from "@/lib/api";
import { NotreVisionClient } from "./NotreVisionClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return {
    title: t("identiteVision.metaTitle"),
    description: t("identiteVision.metaDescription"),
  };
}

export default async function NotreVisionPage() {
  let visionMarkdown = "";
  try {
    const config = await getSiteConfig();
    visionMarkdown = config.vision_markdown ?? "";
  } catch {
    visionMarkdown = "";
  }

  return <NotreVisionClient initialVision={visionMarkdown} />;
}
