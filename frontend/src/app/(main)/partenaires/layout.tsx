import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

/**
 * Layout pour la section Nos partenaires.
 * Metadata partagée pour toutes les pages /partenaires/*.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return {
    title: t("partnerHub.metaTitle"),
    description: t("partnerHub.metaDescription"),
  };
}

export default function PartenairesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
