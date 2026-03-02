"use client";

/**
 * Wrapper client pour GlobalVideoBackground.
 * `dynamic(ssr:false)` est autorisé uniquement depuis un Client Component.
 * layout.tsx (Server Component) importe ce fichier directement.
 */
import dynamic from "next/dynamic";
import type { SiteConfigApi } from "@/types/core";

const GlobalVideoBackground = dynamic(
    () =>
        import("@/components/features/explore/canvas/ExploreVideos").then(
            (m) => m.GlobalVideoBackground
        ),
    { ssr: false }
);

export function VideoBackgroundClient({ config }: { config: SiteConfigApi | null }) {
    return <GlobalVideoBackground config={config} />;
}
