"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { OrganizationNodeApi } from "@/types/organization";
import { PlanetCardSphere } from "./PlanetCardSphere";

export interface ExploreMobileCarouselProps {
  nodes: OrganizationNodeApi[];
  onOpenPlanet: (node: OrganizationNodeApi) => void;
  /** Slug depuis `?node=` : centre la carte au montage (l’overlay s’ouvre au tap seulement). */
  initialNodeSlug?: string | null;
}

export function ExploreMobileCarousel({
  nodes,
  onOpenPlanet,
  initialNodeSlug,
}: ExploreMobileCarouselProps) {
  const t = useTranslations("explore.mobileCarousel");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const rafRef = useRef(0);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const el = itemRefs.current[index];
    const scroller = scrollerRef.current;
    if (!el || !scroller) return;
    const left = el.offsetLeft - (scroller.clientWidth - el.clientWidth) / 2;
    scroller.scrollTo({ left: Math.max(0, left), behavior });
  }, []);

  useLayoutEffect(() => {
    if (!initialNodeSlug || nodes.length === 0) return;
    const i = nodes.findIndex((n) => n.slug === initialNodeSlug);
    if (i < 0) return;
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      scrollToIndex(i, "auto");
      setActiveIndex(i);
    };
    const id0 = requestAnimationFrame(() => {
      requestAnimationFrame(run);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id0);
    };
  }, [initialNodeSlug, nodes, scrollToIndex]);

  const updateActiveFromScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || nodes.length === 0) return;
    const mid = scroller.scrollLeft + scroller.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const center = el.offsetLeft + el.offsetWidth / 2;
      const d = Math.abs(mid - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActiveIndex((prev) => (prev !== best ? best : prev));
  }, [nodes.length]);

  const onScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(updateActiveFromScroll);
  }, [updateActiveFromScroll]);

  useEffect(() => {
    updateActiveFromScroll();
  }, [nodes.length, updateActiveFromScroll]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/60">
        {t("empty")}
      </div>
    );
  }

  const activeNode = nodes[activeIndex];

  return (
    <div
      className="absolute inset-0 flex flex-col justify-center overflow-hidden"
      style={{ perspective: "1100px" }}
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {t("slideStatus", {
          name: activeNode?.name ?? "",
          index: activeIndex + 1,
          total: nodes.length,
        })}
      </p>
      <p className="pointer-events-none mb-3 px-6 text-center text-xs uppercase tracking-[0.2em] text-white/45">
        {t("hint")}
      </p>

      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
        role="region"
        aria-roledescription="carousel"
        aria-label={t("regionLabel")}
      >
        {nodes.map((node, i) => {
          const dist = Math.abs(i - activeIndex);
          const tZ = dist === 0 ? 0 : -32 * dist;
          const rotY = (i - activeIndex) * 12;
          const scale = dist === 0 ? 1 : Math.max(0.75, 1 - dist * 0.11);
          const opacity = dist === 0 ? 1 : Math.max(0.42, 1 - dist * 0.24);

          return (
            <div
              key={node.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="flex w-[85vw] max-w-md flex-none snap-center snap-always items-center justify-center px-2 pb-16 pt-2"
              style={{ transformStyle: "preserve-3d" }}
            >
              <article
                className="flex w-full flex-col items-center transition-[transform,opacity] duration-300 ease-out will-change-transform"
                style={{
                  transform: `translateZ(${tZ}px) rotateY(${rotY}deg) scale(${scale})`,
                  opacity,
                  transformStyle: "preserve-3d",
                }}
              >
                <button
                  type="button"
                  className="group flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-black/25 px-4 py-6 shadow-lg shadow-black/40 backdrop-blur-sm transition-colors hover:bg-black/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400/90"
                  onClick={() => onOpenPlanet(node)}
                  aria-label={t("openPlanet", { name: node.name })}
                >
                  <PlanetCardSphere node={node} />
                  <div className="max-w-[85vw] text-center">
                    <h2 className="text-lg font-semibold text-white drop-shadow-md">{node.name}</h2>
                    {node.short_description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-white/75">{node.short_description}</p>
                    ) : null}
                  </div>
                </button>
              </article>
            </div>
          );
        })}
      </div>
    </div>
  );
}
