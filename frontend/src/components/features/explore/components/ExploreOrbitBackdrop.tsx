"use client";

/**
 * Fond d’orbite type maquette : ellipse en pointillés + piste horizontale arrondie.
 * Centré sur le même point focal que les planètes du carrousel (top ~40 %).
 */
export function ExploreOrbitBackdrop() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-[40%] z-0 w-[min(96vw,380px)] -translate-x-1/2 -translate-y-1/2"
      aria-hidden
    >
      <div className="relative w-full" style={{ aspectRatio: "1.5 / 1" }}>
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 320 200"
          preserveAspectRatio="xMidYMid meet"
        >
          <ellipse
            cx={160}
            cy={102}
            rx={138}
            ry={74}
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth={1}
            strokeDasharray="3 8"
            strokeLinecap="round"
          />
        </svg>
        <div
          className="absolute left-1/2 top-1/2 h-[min(22%,52px)] w-[min(88%,300px)] -translate-x-1/2 -translate-y-1/2 rounded-[999px] border border-white/[0.12] bg-gradient-to-b from-white/[0.04] to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        />
      </div>
    </div>
  );
}
