"use client";

import type { OrganizationNodeApi } from "@/types/organization";

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
 * Sphère « 2.5D » légère : dégradé + couleur planète, option image de couverture.
 */
export function PlanetCardSphere({ node, className = "" }: PlanetCardSphereProps) {
  const hex = normalizeHex(node.planet_color);
  const cover = node.cover_image?.trim();

  return (
    <div
      className={`relative flex aspect-square w-[min(72vw,280px)] max-h-[42vh] items-center justify-center ${className}`}
    >
      <div
        aria-hidden
        className="absolute inset-[8%] rounded-full opacity-55 blur-xl"
        style={{
          background: `radial-gradient(circle at 30% 28%, ${hex}ff, transparent 62%), radial-gradient(circle at 70% 72%, ${hex}99, transparent 58%)`,
        }}
      />
      <div
        className="relative h-full w-full rounded-full shadow-[inset_-18px_-12px_40px_rgba(0,0,0,0.45),inset_12px_10px_28px_rgba(255,255,255,0.22)] ring-2 ring-white/15"
        style={{
          background: cover
            ? undefined
            : `radial-gradient(circle at 28% 24%, #ffffffaa 0%, ${hex} 28%, ${hex}dd 55%, #050508 100%)`,
        }}
      >
        {cover ? (
          /* eslint-disable-next-line @next/next/no-img-element -- URL API dynamique hors domains next/image */
          <img
            src={cover}
            alt=""
            className="absolute inset-0 h-full w-full rounded-full object-cover"
          />
        ) : null}
      </div>
    </div>
  );
}
