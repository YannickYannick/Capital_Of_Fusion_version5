import type { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClientLayoutWrapper } from "@/components/layout/ClientLayoutWrapper";
import { getSiteConfig } from "@/lib/api";

/**
 * Layout (main) — partagé par toutes les pages publiques.
 * ClientLayoutWrapper fournit PlanetsOptions + PlanetMusicOverride partout ; la vidéo de fond
 * dépend de la route et du mode musique (voir docs/features/video-background-routes.md).
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
