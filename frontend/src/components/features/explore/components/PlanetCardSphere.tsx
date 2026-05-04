"use client";

import type { OrganizationNodeApi } from "@/types/organization";
import { getPlanetCarouselFlatImageUrl } from "@/lib/explorePlanetCarouselVisual";

function normalizeHex(color: string | undefined): string {
  const c = (color ?? "").replace(/^#/, "").trim();
  if (!c) return "#f3ac41";
  return c.startsWith("#") ? c : `#${c}`;
}

export interface PlanetCardSphereProps {
  node: OrganizationNodeApi;
  className?: string;
}

/**
 * Pastille 2D pour le carrousel mobile : image selon visual_source (gif / glb / preset),
 * sinon disque dégradé (couleur planète).
 */
export function PlanetCardSphere({ node, className = "" }: PlanetCardSphereProps) {
  const hex = normalizeHex(node.planet_color);
  const flatUrl = getPlanetCarouselFlatImageUrl(node);

  return (
    <div
      className={`relative flex aspect-square w-[min(52vw,200px)] max-h-[32vh] items-center justify-center ${className}`}
    >
      <div
        aria-hidden
        className="absolute inset-[6%] rounded-full opacity-40 blur-lg"
        style={{
          background: `radial-gradient(circle at 30% 28%, ${hex}ee, transparent 60%), radial-gradient(circle at 70% 72%, ${hex}88, transparent 55%)`,
        }}
      />
      <div
        className={[
          "relative h-full w-full overflow-hidden rounded-full ring-2 ring-white/20",
          flatUrl
            ? "bg-black/50 shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
            : "shadow-[inset_-12px_-10px_28px_rgba(0,0,0,0.4),inset_8px_8px_20px_rgba(255,255,255,0.18)]",
        ].join(" ")}
        style={
          flatUrl
            ? undefined
            : {
                background: `radial-gradient(circle at 28% 24%, #ffffffaa 0%, ${hex} 28%, ${hex}dd 55%, #050508 100%)`,
              }
        }
      >
        {flatUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element -- URL API dynamique hors domains next/image */
          <img
            src={flatUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 m-auto h-[88%] w-[88%] rounded-full object-contain"
          />
        ) : null}
      </div>
    </div>
  );
}
