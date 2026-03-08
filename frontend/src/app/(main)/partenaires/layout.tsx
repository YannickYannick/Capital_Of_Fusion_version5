import type { Metadata } from "next";

/**
 * Layout pour la section Nos partenaires.
 * Metadata partagée pour toutes les pages /partenaires/*.
 */
export const metadata: Metadata = {
  title: "Nos partenaires",
  description:
    "Structures, événements et cours de nos partenaires. Capital of Fusion.",
};

export default function PartenairesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
