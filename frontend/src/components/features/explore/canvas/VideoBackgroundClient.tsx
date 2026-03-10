"use client";

/**
 * Wrapper client pour GlobalVideoBackground.
 * Sur la page d'accueil (/), on diffère le montage de ~400 ms pour prioriser le premier affichage.
 */
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import type { SiteConfigurationApi } from "@/types/config";

const GlobalVideoBackground = dynamic(
    () =>
        import("@/components/features/explore/canvas/ExploreVideos").then(
            (m) => m.GlobalVideoBackground
        ),
    { ssr: false }
);

const DEFER_HOME_MS = 400;

export function VideoBackgroundClient({ config }: { config: SiteConfigurationApi | null }) {
    const pathname = usePathname();
    const isHome = pathname === "/";
    const [ready, setReady] = useState(() => !isHome);

    useEffect(() => {
        if (!isHome) {
            setReady(true);
            return;
        }
        const t = setTimeout(() => setReady(true), DEFER_HOME_MS);
        return () => clearTimeout(t);
    }, [isHome]);

    if (!ready) return null;
    return <GlobalVideoBackground config={config} />;
}
