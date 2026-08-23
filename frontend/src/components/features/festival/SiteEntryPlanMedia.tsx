"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type SiteEntryPlanMediaProps = {
  imageSrc: string;
  videoSrc: string;
  imageAlt: string;
  videoAriaLabel: string;
  showVideoLabel: string;
  showPhotoLabel: string;
  /** Cadre commun photo / vidéo (même ratio que les assets source). */
  aspectWidth?: number;
  aspectHeight?: number;
};

/**
 * Plan d'accès au site — photo par défaut, bascule vers vidéo via bouton.
 * Inputs: chemins public/, libellés i18n.
 * Outputs: figure interactive sans saut de layout au toggle.
 */
export function SiteEntryPlanMedia({
  imageSrc,
  videoSrc,
  imageAlt,
  videoAriaLabel,
  showVideoLabel,
  showPhotoLabel,
  aspectWidth = 1,
  aspectHeight = 1,
}: SiteEntryPlanMediaProps) {
  const [mode, setMode] = useState<"photo" | "video">("photo");
  const videoRef = useRef<HTMLVideoElement>(null);

  /**
   * Lecture auto au passage en mode vidéo. Le clic sur le bouton fournit
   * l'activation utilisateur nécessaire au son ; si le navigateur refuse
   * quand même, on retente en muet plutôt que de laisser la vidéo figée.
   */
  useEffect(() => {
    if (mode !== "video") return;
    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {
      video.muted = true;
      void video.play().catch(() => {});
    });
  }, [mode]);

  const showVideo = () => setMode("video");

  const showPhoto = () => {
    videoRef.current?.pause();
    setMode("photo");
  };

  const toggle = mode === "photo" ? showVideo : showPhoto;
  const toggleLabel = mode === "photo" ? showVideoLabel : showPhotoLabel;

  return (
    <figure className="my-8">
      <div
        className="relative w-full overflow-hidden rounded-2xl border border-white/15 bg-black/30 shadow-lg"
        style={{ aspectRatio: `${aspectWidth} / ${aspectHeight}` }}
      >
        {mode === "photo" ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 896px"
            priority={false}
          />
        ) : (
          <video
            ref={videoRef}
            src={videoSrc}
            className="absolute inset-0 h-full w-full object-contain bg-black"
            controls
            playsInline
            preload="metadata"
            aria-label={videoAriaLabel}
          />
        )}
      </div>
      <figcaption className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={toggle}
          aria-pressed={mode === "video"}
          className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300"
        >
          {toggleLabel}
        </button>
      </figcaption>
    </figure>
  );
}
