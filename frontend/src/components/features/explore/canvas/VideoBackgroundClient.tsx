"use client";

/**
 * Wrapper client pour GlobalVideoBackground.
 * Délai ~400 ms uniquement au premier chargement sur `/` ; après une visite hors accueil, retour sur `/` sans démontage (lecture continue).
 */
import { useState, useEffect, useRef } from "react";
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
    const hasVisitedNonHomeRef = useRef(false);
    const [ready, setReady] = useState(() => !isHome);

    useEffect(() => {
        if (!isHome) {
            hasVisitedNonHomeRef.current = true;
            setReady(true);
            return;
        }
        if (hasVisitedNonHomeRef.current) {
            setReady(true);
            return;
        }
        const t = setTimeout(() => setReady(true), DEFER_HOME_MS);
        return () => clearTimeout(t);
    }, [isHome]);

    if (!ready) return null;
    return <GlobalVideoBackground config={config} />;
}
