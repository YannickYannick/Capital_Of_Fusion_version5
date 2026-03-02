"use client";

/**
 * Wrapper client pour GlobalVideoBackground.
 * `dynamic(ssr:false)` est autorisé uniquement depuis un Client Component.
 * layout.tsx (Server Component) importe ce fichier directement.
 */
import dynamic from "next/dynamic";
import type { SiteConfigurationApi } from "@/types/config";

const GlobalVideoBackground = dynamic(
    () =>
        import("@/components/features/explore/canvas/ExploreVideos").then(
            (m) => m.GlobalVideoBackground
        ),
    { ssr: false }
);

export function VideoBackgroundClient({ config }: { config: SiteConfigurationApi | null }) {
    return <GlobalVideoBackground config={config} />;
}
