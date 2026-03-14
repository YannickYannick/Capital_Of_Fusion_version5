/**
 * Page Identité COF — Notre histoire (contenu markdown depuis la config du site).
 * Même structure que Notre vision ; édition staff/admin via NotreHistoireClient.
 */
import { getSiteConfig } from "@/lib/api";
import { NotreHistoireClient } from "./NotreHistoireClient";

export const metadata = {
  title: "Notre histoire | Identité COF",
  description: "L'histoire de Capital of Fusion — Identité COF.",
};

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
