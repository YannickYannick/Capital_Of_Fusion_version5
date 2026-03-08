import type { Metadata } from "next";

/**
 * Layout pour la section Promotions festivals.
 */
export const metadata: Metadata = {
  title: "Promotions festivals | Capital of Fusion",
  description:
    "Festivals de nos structures partenaires — promotions et événements à venir.",
};

export default function PromotionsFestivalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
