"use client";

/**
 * Wrapper conditionnel selon le type de page (getPageType) :
 * - Accueil / Explore : providers (PlanetsOptions, PlanetMusicOverride) + vidéo principale/cycle (GlobalVideoBackground)
 * - Menu : uniquement cycle vidéo (CycleVideoOnly), pas de contextes Explore
 * - Détail / User : pas de vidéo, pas de contextes Explore
 */
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/shared/Navbar";
import { MainContent } from "@/components/shared/MainContent";
import { PlanetsOptionsProvider } from "@/contexts/PlanetsOptionsContext";
import { PlanetMusicOverrideProvider } from "@/contexts/PlanetMusicOverrideContext";
import { getPageType } from "@/lib/routeSegments";
import type { SiteConfigurationApi } from "@/types/config";
import type { CycleVideoConfig } from "@/components/features/explore/canvas/CycleVideoOnly";

const VideoBackgroundClient = dynamic(
  () =>
    import("@/components/features/explore/canvas/VideoBackgroundClient").then(
      (m) => m.VideoBackgroundClient
    ),
  { ssr: false }
);

const CycleVideoOnly = dynamic(
  () =>
    import("@/components/features/explore/canvas/CycleVideoOnly").then(
      (m) => m.CycleVideoOnly
    ),
  { ssr: false }
);

function cycleConfigFromSite(config: SiteConfigurationApi | null): CycleVideoConfig | null {
  if (!config) return null;
  return {
    cycle_video_type: config.cycle_video_type,
    cycle_video_youtube_id: config.cycle_video_youtube_id,
    cycle_video_file: config.cycle_video_file,
  };
}

export function ClientLayoutWrapper({
  config,
  children,
}: {
  config: SiteConfigurationApi | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const pageType = getPageType(pathname ?? "/");

  const isAccueilOrExplore = pageType === "home" || pageType === "explore";
  const isMenu = pageType === "menu";

  const content = (
    <>
      <Navbar />
      {isAccueilOrExplore && <VideoBackgroundClient config={config} />}
      {isMenu && <CycleVideoOnly config={cycleConfigFromSite(config)} />}
      <MainContent>{children}</MainContent>
    </>
  );

  if (isAccueilOrExplore) {
    return (
      <PlanetsOptionsProvider>
        <PlanetMusicOverrideProvider>{content}</PlanetMusicOverrideProvider>
      </PlanetsOptionsProvider>
    );
  }

  return content;
}
