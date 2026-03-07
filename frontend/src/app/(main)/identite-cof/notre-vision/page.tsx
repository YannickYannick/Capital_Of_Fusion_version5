/**
 * Page Identité COF — Notre vision (contenu markdown depuis la config du site).
 * Édition en ligne pour staff/admin via NotreVisionClient.
 */
import { getSiteConfig } from "@/lib/api";
import { NotreVisionClient } from "./NotreVisionClient";

export const metadata = {
  title: "Notre vision | Identité COF",
  description: "La vision de Capital of Fusion — Identité COF.",
};

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
