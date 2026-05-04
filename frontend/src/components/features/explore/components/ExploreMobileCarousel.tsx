"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { OrganizationNodeApi } from "@/types/organization";
import { PlanetCardSphere } from "./PlanetCardSphere";
import {
  orbitAngleForSlot,
  orbitBlurForDepth,
  orbitModIndex,
  orbitOpacityForDepth,
  orbitScaleForDepth,
  orbitSinDepth,
  orbitZIndex,
} from "@/lib/exploreOrbitLayout";

export interface ExploreMobileCarouselProps {
  nodes: OrganizationNodeApi[];
  onOpenPlanet: (node: OrganizationNodeApi) => void;
  initialNodeSlug?: string | null;
}

const RX_VW = 34;
const RY_VW = 18;
const SWIPE_SENS = 0.55;

export function ExploreMobileCarousel({
  nodes,
  onOpenPlanet,
  initialNodeSlug,
}: ExploreMobileCarouselProps) {
  const t = useTranslations("explore.mobileCarousel");
  const arenaRef = useRef<HTMLDivElement>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  /** Décalage fractionnaire pendant le drag (positif = focus avance). */
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef(0);
  const pointerGestureRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const dragAtPointerDownRef = useRef(0);
  const arenaWidthRef = useRef(1);

  useEffect(() => {
    dragOffsetRef.current = dragOffset;
  }, [dragOffset]);

  const n = nodes.length;
  const focusFloat = n > 0 ? focusIndex + dragOffset : 0;

  useLayoutEffect(() => {
    if (!initialNodeSlug || n === 0) return;
    const i = nodes.findIndex((node) => node.slug === initialNodeSlug);
    if (i < 0) return;
    setFocusIndex(i);
    setDragOffset(0);
  }, [initialNodeSlug, n, nodes]);

  const snapFromOffset = useCallback((offset: number) => {
    if (n === 0) return;
    setFocusIndex((prev) => orbitModIndex(Math.round(prev + offset), n));
    setDragOffset(0);
  }, [n]);

  const goPrev = useCallback(() => {
    if (n === 0) return;
    setFocusIndex((i) => (i - 1 + n) % n);
    setDragOffset(0);
  }, [n]);

  const goNext = useCallback(() => {
    if (n === 0) return;
    setFocusIndex((i) => (i + 1) % n);
    setDragOffset(0);
  }, [n]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (n === 0) return;
      if (e.button !== 0) return;
      const el = arenaRef.current;
      if (!el) return;
      pointerGestureRef.current = true;
      setIsDragging(true);
      pointerIdRef.current = e.pointerId;
      startXRef.current = e.clientX;
      dragAtPointerDownRef.current = dragOffsetRef.current;
      arenaWidthRef.current = Math.max(1, el.getBoundingClientRect().width);
      el.setPointerCapture(e.pointerId);
    },
    [n]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!pointerGestureRef.current || e.pointerId !== pointerIdRef.current) return;
      const w = arenaWidthRef.current;
      const delta = (startXRef.current - e.clientX) / w;
      const next = dragAtPointerDownRef.current + delta * n * SWIPE_SENS;
      setDragOffset(next);
    },
    [n]
  );

  const endPointer = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerId !== pointerIdRef.current) return;
      const el = arenaRef.current;
      if (el && pointerIdRef.current !== null) {
        try {
          el.releasePointerCapture(pointerIdRef.current);
        } catch {
          /* ignore */
        }
      }
      pointerIdRef.current = null;
      pointerGestureRef.current = false;
      setIsDragging(false);
      snapFromOffset(dragOffsetRef.current);
    },
    [snapFromOffset]
  );

  useEffect(() => {
    const onLost = () => {
      if (!pointerGestureRef.current) return;
      pointerGestureRef.current = false;
      pointerIdRef.current = null;
      setIsDragging(false);
      snapFromOffset(dragOffsetRef.current);
    };
    window.addEventListener("blur", onLost);
    return () => window.removeEventListener("blur", onLost);
  }, [snapFromOffset]);

  if (n === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/60">
        {t("empty")}
      </div>
    );
  }

  const previewIndex = orbitModIndex(Math.round(focusFloat), n);
  const activeNode = nodes[previewIndex] ?? nodes[0];
  const enableCssTransition = !isDragging;

  return (
    <div className="absolute inset-0 flex flex-col justify-between overflow-hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {t("slideStatus", {
          name: activeNode?.name ?? "",
          index: previewIndex + 1,
          total: n,
        })}
      </p>
      <p className="pointer-events-none shrink-0 px-6 pt-2 text-center text-xs uppercase tracking-[0.2em] text-white/45">
        {t("hint")}
      </p>

      <div
        ref={arenaRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={t("regionLabel")}
        className="relative mx-auto mt-1 w-full min-h-0 flex-1 max-h-[min(52dvh,460px)]"
        style={{ touchAction: "pan-x" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
      >
        {/* Centre décoratif (option A du plan) */}
        <div
          className="pointer-events-none absolute left-1/2 top-[40%] z-[80] -translate-x-1/2 -translate-y-1/2"
          aria-hidden
        >
          <div className="relative flex h-20 w-20 items-center justify-center md:h-24 md:w-24">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/50 via-orange-500/35 to-fuchsia-600/25 blur-2xl" />
            <div className="absolute inset-[18%] rounded-full bg-gradient-to-br from-amber-300/90 to-orange-600/70 shadow-[0_0_40px_rgba(251,191,36,0.45)]" />
            <span className="relative z-[1] rounded-full border border-white/25 bg-black/35 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-100/95 backdrop-blur-sm">
              {t("centerLabel")}
            </span>
          </div>
        </div>

        {nodes.map((node, i) => {
          const angle = orbitAngleForSlot(i, focusFloat, n);
          const sinDepth = orbitSinDepth(angle);
          const dx = RX_VW * Math.cos(angle);
          const dy = RY_VW * Math.sin(angle);
          const scale = orbitScaleForDepth(sinDepth, 0.4);
          const blur = sinDepth < 0.12 ? orbitBlurForDepth(sinDepth, 4) : 0;
          const opacity = orbitOpacityForDepth(sinDepth, 0.42);
          const z = orbitZIndex(sinDepth);

          return (
            <div
              key={node.id}
              className="absolute left-1/2 top-[40%] w-[min(72vw,280px)] max-w-none -translate-x-1/2 -translate-y-1/2"
              style={{
                zIndex: z,
                transform: `translate(calc(-50% + ${dx.toFixed(2)}vw), calc(-50% + ${dy.toFixed(2)}vw)) scale(${scale.toFixed(3)})`,
                opacity,
                filter: blur > 0.4 ? `blur(${blur.toFixed(2)}px)` : undefined,
                transitionProperty: enableCssTransition ? "transform, opacity, filter" : "none",
                transitionDuration: enableCssTransition ? "320ms" : "0ms",
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                willChange: enableCssTransition ? "auto" : "transform",
              }}
            >
              <button
                type="button"
                className="group flex w-full flex-col items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-2 py-3 shadow-lg shadow-black/35 backdrop-blur-sm transition-colors hover:bg-black/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400/90"
                onClick={() => onOpenPlanet(node)}
                aria-label={t("openPlanet", { name: node.name })}
              >
                <PlanetCardSphere node={node} className="!w-[min(50vw,180px)] !max-h-[28vh]" />
                <div className="max-w-[min(88vw,260px)] text-center">
                  <h2 className="text-sm font-semibold text-white drop-shadow-md md:text-base">{node.name}</h2>
                  {node.short_description ? (
                    <p className="mt-1 line-clamp-2 text-xs text-white/75 md:text-sm">{node.short_description}</p>
                  ) : null}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      <div className="shrink-0 space-y-4 px-4 pt-2">
        <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-md">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.25em] text-amber-200/90">
            {t("cardEyebrow")}
          </p>
          <p className="mt-1 line-clamp-2 text-center text-sm text-white/80">{activeNode.short_description || activeNode.name}</p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/50 text-xl text-white/90 transition hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400/80"
            aria-label={t("prev")}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => onOpenPlanet(activeNode)}
            disabled={!activeNode}
            className="min-w-[8.5rem] flex-1 rounded-full border border-[#f3ac41] bg-[#f3ac41] px-6 py-3 text-center text-sm font-bold text-black shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t("openCta", { name: activeNode.name })}
          >
            {t("open")}
          </button>
          <button
            type="button"
            onClick={goNext}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/50 text-xl text-white/90 transition hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400/80"
            aria-label={t("next")}
          >
            ›
          </button>
        </div>

        <div className="flex justify-center gap-2 pb-1" role="tablist" aria-label={t("dotsLabel")}>
          {nodes.map((node, i) => {
            const active = previewIndex === i;
            return (
              <button
                key={node.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={t("dotLabel", { name: node.name, index: i + 1 })}
                className={[
                  "h-2 rounded-full transition-all",
                  active ? "w-8 bg-[#f3ac41]" : "w-2 bg-white/30 hover:bg-white/45",
                ].join(" ")}
                onClick={() => {
                  setFocusIndex(i);
                  setDragOffset(0);
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
