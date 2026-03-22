import type { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClientLayoutWrapper } from "@/components/layout/ClientLayoutWrapper";
import { getSiteConfig } from "@/lib/api";

/**
 * Layout (main) — partagé par toutes les pages publiques.
 * Vidéo et contextes Explore (PlanetsOptions, PlanetMusicOverride) sont chargés
 * conditionnellement via ClientLayoutWrapper (accueil, explore, menu : vidéo + contrôles ; détail / user : sans).
 */
export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  const config = await getSiteConfig().catch(() => null);
  return (
    <AuthProvider>
      <ClientLayoutWrapper config={config}>{children}</ClientLayoutWrapper>
    </AuthProvider>
  );
}
