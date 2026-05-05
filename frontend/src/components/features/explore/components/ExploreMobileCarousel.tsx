"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
  /**
   * Si true (défaut), l’ordre des cartes est l’inverse de la liste API (souvent plus naturel sur l’anneau).
   * Passer `false` pour garder l’ordre serveur tel quel.
   */
  reversePlanetOrder?: boolean;
}

/** Orbite elliptique large (inspiré maquette : planètes latérales + profondeur verticale). */
const RX_VW = 38;
const RY_VW = 24;
const SWIPE_SENS = 0.72;
/** Déplacement horizontal (px) au-delà duquel on considère un swipe (pas un tap). */
const SWIPE_PX_THRESHOLD = 14;

/** Facteur appliqué aux tailles d’affichage des planètes (réduction demandée ÷ 1,2). */
const PLANET_VISUAL_SCALE = 1 / 1.2;

export function ExploreMobileCarousel({
  nodes,
  onOpenPlanet,
  initialNodeSlug,
  reversePlanetOrder = true,
}: ExploreMobileCarouselProps) {
  const t = useTranslations("explore.mobileCarousel");
  const displayNodes = useMemo(
    () => (reversePlanetOrder ? [...nodes].reverse() : nodes),
    [nodes, reversePlanetOrder]
  );
  const swipeZoneRef = useRef<HTMLDivElement>(null);
  /** Largeur viewport pour convertir RX/RY (historiquement en vw) en px — même référence que le navigateur pour les `vw`. */
  const [vwPx, setVwPx] = useState(390);
  const [focusIndex, setFocusIndex] = useState(0);
  /** Décalage fractionnaire pendant le drag (positif = focus avance). */
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef(0);
  const pointerGestureRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const dragAtPointerDownRef = useRef(0);
  const swipeWidthRef = useRef(1);
  /** Après un swipe horizontal, bloque le `click` sur la carte planète sous le doigt. */
  const suppressPlanetTapRef = useRef(false);
  const horizontalSwipeRef = useRef(false);

  useEffect(() => {
    dragOffsetRef.current = dragOffset;
  }, [dragOffset]);

  useLayoutEffect(() => {
    /** Même référence que l’unité CSS `vw` (viewport de mise en page, pas `visualViewport`). */
    const readVwBasePx = () => {
      if (typeof document === "undefined") return 390;
      const w = document.documentElement?.clientWidth;
      return Math.round(
        typeof w === "number" && w > 0 ? w : typeof window !== "undefined" ? window.innerWidth : 390
      );
    };
    const update = () => setVwPx(readVwBasePx());
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  const n = displayNodes.length;
  const focusFloat = n > 0 ? focusIndex + dragOffset : 0;

  useLayoutEffect(() => {
    if (!initialNodeSlug || n === 0) return;
    const i = displayNodes.findIndex((node) => node.slug === initialNodeSlug);
    if (i < 0) return;
    setFocusIndex(i);
    setDragOffset(0);
  }, [initialNodeSlug, n, displayNodes]);

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

  const onPointerDownCapture = useCallback(
    (e: React.PointerEvent) => {
      if (n === 0) return;
      if (e.button !== 0) return;
      const el = swipeZoneRef.current;
      if (!el) return;
      horizontalSwipeRef.current = false;
      suppressPlanetTapRef.current = false;
      pointerGestureRef.current = true;
      setIsDragging(true);
      pointerIdRef.current = e.pointerId;
      startXRef.current = e.clientX;
      dragAtPointerDownRef.current = dragOffsetRef.current;
      swipeWidthRef.current = Math.max(1, el.getBoundingClientRect().width);
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* certains navigateurs si la cible n’est pas sous le pointeur */
      }
    },
    [n]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!pointerGestureRef.current || e.pointerId !== pointerIdRef.current) return;
      if (Math.abs(e.clientX - startXRef.current) >= SWIPE_PX_THRESHOLD) {
        horizontalSwipeRef.current = true;
      }
      const w = swipeWidthRef.current;
      /** Inversé : glisser vers la droite avance comme la flèche droite (comportement « naturel » iOS). */
      const delta = (e.clientX - startXRef.current) / w;
      const next = dragAtPointerDownRef.current + delta * n * SWIPE_SENS;
      setDragOffset(next);
    },
    [n]
  );

  const endPointer = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerId !== pointerIdRef.current) return;
      const el = swipeZoneRef.current;
      if (el && pointerIdRef.current !== null) {
        try {
          el.releasePointerCapture(pointerIdRef.current);
        } catch {
          /* ignore */
        }
      }
      if (horizontalSwipeRef.current) {
        suppressPlanetTapRef.current = true;
      }
      horizontalSwipeRef.current = false;
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
      horizontalSwipeRef.current = false;
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
  const activeNode = displayNodes[previewIndex] ?? displayNodes[0];
  const enableCssTransition = !isDragging;

  return (
    <div className="absolute inset-0 flex min-h-0 flex-col overflow-hidden">
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {t("slideStatus", {
          name: activeNode?.name ?? "",
          index: previewIndex + 1,
          total: n,
        })}
      </p>
      {/* Zone relative pleine hauteur : l’orbite se centre dans tout l’écran Explore ; le dock bas est en overlay (ne réduit plus la zone de centrage). */}
      <div className="relative min-h-0 w-full flex-1">
        <div
          ref={swipeZoneRef}
          role="region"
          aria-roledescription="carousel"
          aria-label={t("regionLabel")}
          tabIndex={0}
          className="absolute inset-0 z-0 mx-auto outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
          style={{ touchAction: "none" }}
          onPointerDownCapture={onPointerDownCapture}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
        >
          {/* Réserve basse pour le dock ; pas de px horizontal pour éviter tout biais latéral. Offsets orbite en px (vw→px) pour éviter le mélange % / vw dans `transform`. */}
          <div className="flex h-full w-full min-h-0 items-center justify-center px-0 pb-[min(38vh,280px)] pt-2">
            <div className="relative mx-auto aspect-[5/4] w-[min(92vw,400px)] max-h-[min(56dvh,380px)] min-h-[min(40vw,200px)]">
        {displayNodes.map((node, i) => {
          const angle = orbitAngleForSlot(i, focusFloat, n);
          const sinDepth = orbitSinDepth(angle);
          const dxPx =
            (RX_VW / 100) * vwPx * PLANET_VISUAL_SCALE * Math.cos(angle);
          const dyPx =
            (RY_VW / 100) * vwPx * PLANET_VISUAL_SCALE * Math.sin(angle);
          const scale = orbitScaleForDepth(sinDepth, 0.3) * PLANET_VISUAL_SCALE;
          const blurRaw = orbitBlurForDepth(sinDepth, 5.5);
          const blur = blurRaw > 0.35 ? blurRaw : 0;
          const opacity = orbitOpacityForDepth(sinDepth, 0.32);
          const emphasis = (sinDepth + 1) / 2;
          const z = orbitZIndex(sinDepth);

          return (
            <div
              key={node.id}
              /** `w-max` : le point d’ancrage -50% doit coïncider avec le bouton/sphère ; une largeur fixée >= carte créait un vide à droite et décalait tout le groupe vers la gauche (inline-flex aligné au début du bloc). */
              className="absolute left-1/2 top-1/2 w-max max-w-[min(65vw,250px)]"
              style={{
                zIndex: z,
                transformOrigin: "center center",
                transform: `translate(calc(-50% + ${dxPx.toFixed(2)}px), calc(-50% + ${dyPx.toFixed(2)}px)) scale(${scale.toFixed(4)})`,
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
                className="group inline-flex max-w-full flex-col items-center rounded-full border border-transparent bg-transparent px-0 py-0 transition-colors hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400/90"
                onClick={() => {
                  if (suppressPlanetTapRef.current) {
                    suppressPlanetTapRef.current = false;
                    return;
                  }
                  onOpenPlanet(node);
                }}
                aria-label={t("openPlanet", { name: node.name })}
              >
                <PlanetCardSphere
                  node={node}
                  emphasis={emphasis}
                  loadGlbPreview
                  className="!w-[min(35vw,140px)] !max-h-[22vh] md:!w-[min(31.7vw,147px)]"
                />
              </button>
            </div>
          );
        })}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-3 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
          <div className="pointer-events-auto w-full max-w-md">
            <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <p className="text-center text-base font-semibold tracking-tight text-white [text-shadow:0_1px_14px_rgba(0,0,0,0.65)]">
                {activeNode.name}
              </p>
            </div>
          </div>

          <div className="pointer-events-auto w-full max-w-md space-y-4">
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={goNext}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/50 text-xl text-white/90 transition hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400/80"
            aria-label={t("next")}
          >
            ›
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
            onClick={goPrev}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/50 text-xl text-white/90 transition hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400/80"
            aria-label={t("prev")}
          >
            ‹
          </button>
        </div>

        <div className="flex justify-center gap-2 pb-1" role="tablist" aria-label={t("dotsLabel")}>
          {displayNodes.map((node, i) => {
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
      </div>
    </div>
  );
}
