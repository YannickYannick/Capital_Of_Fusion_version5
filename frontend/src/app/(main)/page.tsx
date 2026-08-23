import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LandingPageClient from "./LandingPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("landing");
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      title,
      description,
    },
  };
}

/**
 * Landing — page d'accueil immersive.
 */
export default function LandingPage() {
  return <LandingPageClient />;
}
