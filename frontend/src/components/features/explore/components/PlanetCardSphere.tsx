"use client";

import type { OrganizationNodeApi } from "@/types/organization";
import { getPlanetCarouselFlatImageUrl } from "@/lib/explorePlanetCarouselVisual";
import { PlanetCarouselModelViewer } from "./PlanetCarouselModelViewer";

function normalizeHex(color: string | undefined): string {
  const c = (color ?? "").replace(/^#/, "").trim();
  if (!c) return "#f3ac41";
  return c.startsWith("#") ? c : `#${c}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = normalizeHex(hex).slice(1);
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }
  if (h.length === 6) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  return { r: 243, g: 172, b: 65 };
}

function PlanetPatternOverlay({ planetType }: { planetType: string }) {
  const t = planetType.toLowerCase();
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full text-white"
      viewBox="0 0 100 100"
      aria-hidden
    >
      {(t === "dotted" || t === "network") && (
        <g opacity={0.22}>
          {Array.from({ length: 81 }, (_, i) => {
            const row = Math.floor(i / 9);
            const col = i % 9;
            return (
              <circle
                key={i}
                cx={11 + col * 9.75}
                cy={11 + row * 9.75}
                r={t === "network" ? 0.85 : 1.1}
                fill="currentColor"
              />
            );
          })}
        </g>
      )}
      {t === "wire" && (
        <g fill="none" stroke="currentColor" strokeWidth={0.35} opacity={0.35}>
          <circle cx={50} cy={50} r={18} />
          <circle cx={50} cy={50} r={28} />
          <circle cx={50} cy={50} r={38} />
        </g>
      )}
      {t === "star" && (
        <g fill="currentColor" opacity={0.22}>
          <circle cx={28} cy={32} r={1.1} />
          <circle cx={74} cy={26} r={0.85} />
          <circle cx={68} cy={72} r={0.95} />
          <circle cx={42} cy={78} r={0.7} />
        </g>
      )}
      {(t === "glass" || t === "chrome") && (
        <ellipse
          cx={38}
          cy={32}
          rx={28}
          ry={18}
          fill="white"
          opacity={t === "chrome" ? 0.28 : 0.18}
        />
      )}
    </svg>
  );
}

export interface PlanetCardSphereProps {
  node: OrganizationNodeApi;
  className?: string;
  /** 0 = arrière-plan, 1 = premier plan — intensifie le bloom. */
  emphasis?: number;
  /** Si vrai et noeud GLB : charge le fichier `model_3d` (coûteux — réservé au focus ± 1). */
  loadGlbPreview?: boolean;
}

/**
 * Sphère « moderne » carrousel mobile : dégradé + halo couleur, motif selon planet_type,
 * ou image 2D encadrée avec le même halo ; noeuds GLB : aperçu `model-viewer` si `loadGlbPreview`.
 */
export function PlanetCardSphere({
  node,
  className = "",
  emphasis = 0.75,
  loadGlbPreview = false,
}: PlanetCardSphereProps) {
  const hex = normalizeHex(node.planet_color);
  const { r, g, b } = hexToRgb(hex);
  const vs = (node.visual_source || "preset").toLowerCase();
  const glbUrl = vs === "glb" && node.model_3d?.trim() ? node.model_3d.trim() : null;
  const flatUrl = getPlanetCarouselFlatImageUrl(node);
  const planetType = node.planet_type || "glass";
  const e = Math.min(1, Math.max(0, emphasis));
  const glowPx = 10 + e * 28;
  const glowAlpha = 0.35 + e * 0.45;

  const showGlb = Boolean(glbUrl && loadGlbPreview);
  const showFlatImage = Boolean(flatUrl && (!glbUrl || !loadGlbPreview));
  const showGradient = !showGlb && !showFlatImage;

  const sphereBg =
    showGlb || showFlatImage
      ? undefined
      : {
          background: [
            `radial-gradient(circle at 32% 26%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.08) 8%, transparent 42%)`,
            `radial-gradient(circle at 78% 82%, rgba(0,0,0,0.55) 0%, transparent 45%)`,
            `radial-gradient(circle at 50% 50%, ${hex} 0%, ${hex}cc 42%, #0a0a12 100%)`,
          ].join(", "),
        };

  const outerGlow = `0 0 ${glowPx}px rgba(${r},${g},${b},${glowAlpha}), 0 0 ${glowPx * 0.45}px rgba(${r},${g},${b},${glowAlpha * 0.6})`;
  const rotationPerSecond = `${Math.round(8 + e * 22)}deg`;

  return (
    <div
      className={`relative flex aspect-square w-[min(48vw,188px)] max-h-[30vh] items-center justify-center ${className}`}
    >
      <div
        aria-hidden
        className="absolute inset-[4%] rounded-full opacity-50 blur-xl"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(${r},${g},${b},0.9), transparent 65%)`,
        }}
      />
      <div
        className={[
          "relative h-full w-full overflow-hidden rounded-full",
          showFlatImage || showGlb ? "bg-zinc-950/80 ring-1 ring-white/25" : "ring-1 ring-white/30",
        ].join(" ")}
        style={{
          boxShadow: `${outerGlow}, inset 0 -14px 28px rgba(0,0,0,0.35), inset 0 10px 22px rgba(255,255,255,0.12)`,
          ...sphereBg,
        }}
      >
        {showGradient ? <PlanetPatternOverlay planetType={planetType} /> : null}
        {showGlb && glbUrl ? (
          <div className="relative z-[1] h-[92%] w-[92%] overflow-hidden rounded-full">
            <PlanetCarouselModelViewer
              src={glbUrl}
              poster={flatUrl}
              rotationPerSecond={rotationPerSecond}
              className="min-h-[120px]"
            />
          </div>
        ) : null}
        {showFlatImage && flatUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element -- URL API dynamique hors domains next/image */
          <img
            src={flatUrl}
            alt=""
            loading="lazy"
            className="relative z-[1] m-auto h-[86%] w-[86%] rounded-full object-contain"
          />
        ) : null}
      </div>
    </div>
  );
}
