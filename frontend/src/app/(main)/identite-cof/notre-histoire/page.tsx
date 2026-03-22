/**
 * Page Identité COF — Notre histoire (contenu markdown depuis la config du site).
 * Même structure que Notre vision ; édition staff/admin via NotreHistoireClient.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSiteConfig } from "@/lib/api";
import { NotreHistoireClient } from "./NotreHistoireClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return {
    title: t("identiteHistory.metaTitle"),
    description: t("identiteHistory.metaDescription"),
  };
}

export default async function NotreHistoirePage() {
  let historyMarkdown = "";
  try {
    const config = await getSiteConfig();
    historyMarkdown = config.history_markdown ?? "";
  } catch {
    historyMarkdown = "";
  }

  return <NotreHistoireClient initialHistory={historyMarkdown} />;
}
