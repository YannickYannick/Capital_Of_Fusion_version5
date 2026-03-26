import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

/**
 * Layout pour la section Promotions festivals.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return {
    title: t("promotionsFestivals.metaTitle"),
    description: t("promotionsFestivals.metaDescription"),
  };
}

export default function PromotionsFestivalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
