"use client";

/**
 * Wrapper conditionnel selon le type de page (getPageType) :
 * - Accueil / Explore / Menu : providers + GlobalVideoBackground (qualité, voile, ombre, fond noir, son…)
 * - Détail / User : pas de vidéo de fond
 */
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/shared/Navbar";
import { MainContent } from "@/components/shared/MainContent";
import { PlanetsOptionsProvider } from "@/contexts/PlanetsOptionsContext";
import { PlanetMusicOverrideProvider } from "@/contexts/PlanetMusicOverrideContext";
import { getPageType, isPartnerStructureVideoBackgroundPath } from "@/lib/routeSegments";
import type { SiteConfigurationApi } from "@/types/config";

const VideoBackgroundClient = dynamic(
  () =>
    import("@/components/features/explore/canvas/VideoBackgroundClient").then(
      (m) => m.VideoBackgroundClient
    ),
  { ssr: false }
);

export function ClientLayoutWrapper({
  config,
  children,
}: {
  config: SiteConfigurationApi | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const pageType = getPageType(pathname ?? "/");

  /** Même fond vidéo + contrôles (bas droite) que l’accueil : home, explore, menu, et fiche/édit structure partenaire (musique dédiée). */
  const withVideoBackground =
    pageType === "home" ||
    pageType === "explore" ||
    pageType === "menu" ||
    isPartnerStructureVideoBackgroundPath(pathname ?? "/");

  const content = (
    <>
      <Navbar />
      {withVideoBackground && <VideoBackgroundClient config={config} />}
      <MainContent>{children}</MainContent>
    </>
  );

  if (withVideoBackground) {
    return (
      <PlanetsOptionsProvider>
        <PlanetMusicOverrideProvider>{content}</PlanetMusicOverrideProvider>
      </PlanetsOptionsProvider>
    );
  }

  return content;
}
