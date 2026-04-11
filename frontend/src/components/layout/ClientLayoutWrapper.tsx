"use client";

/**
 * Layout principal : PlanetsOptions + PlanetMusicOverride sur tout le site (main),
 * vidéo de fond selon la route et le mode musique (voir docs/features/video-background-routes.md).
 */
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/shared/Navbar";
import { MainContent } from "@/components/shared/MainContent";
import {
  PlanetsOptionsProvider,
  usePlanetsOptions,
} from "@/contexts/PlanetsOptionsContext";
import { PlanetMusicOverrideProvider } from "@/contexts/PlanetMusicOverrideContext";
import {
  getPageType,
  isOrganizationNodeVideoBackgroundPath,
  isPartnerStructureVideoBackgroundPath,
  isUserPage,
} from "@/lib/routeSegments";
import type { SiteConfigurationApi } from "@/types/config";

const VideoBackgroundClient = dynamic(
  () =>
    import("@/components/features/explore/canvas/VideoBackgroundClient").then(
      (m) => m.VideoBackgroundClient
    ),
  { ssr: false }
);

function MainChrome({
  config,
  children,
}: {
  config: SiteConfigurationApi | null;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "/";
  const pageType = getPageType(pathname);
  const user = isUserPage(pathname);
  const opts = usePlanetsOptions();

  const baseVideo =
    pageType === "home" ||
    pageType === "explore" ||
    pageType === "menu" ||
    isPartnerStructureVideoBackgroundPath(pathname) ||
    isOrganizationNodeVideoBackgroundPath(pathname);

  const showVideo =
    baseVideo ||
    (!user && pageType === "detail" && opts.backgroundMusicMode === "site");

  return (
    <>
      <Navbar />
      {showVideo && <VideoBackgroundClient config={config} />}
      <MainContent>{children}</MainContent>
    </>
  );
}

export function ClientLayoutWrapper({
  config,
  children,
}: {
  config: SiteConfigurationApi | null;
  children: ReactNode;
}) {
  return (
    <PlanetsOptionsProvider>
      <PlanetMusicOverrideProvider>
        <MainChrome config={config}>{children}</MainChrome>
      </PlanetMusicOverrideProvider>
    </PlanetsOptionsProvider>
  );
}
