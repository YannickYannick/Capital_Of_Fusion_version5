"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: unknown) => YTPlayer };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  setPlaybackQuality: (quality: string) => void;
  getAvailableQualityLevels: () => string[];
  destroy: () => void;
}

const QUALITY_OPTIONS = [
  { value: "medium", label: "360p" },
  { value: "large", label: "480p" },
  { value: "hd720", label: "720p" },
  { value: "hd1080", label: "1080p" },
] as const;

/**
 * YouTubeVideoBackground
 * Fond vidéo via YouTube IFrame API (qualité + son contrôlables).
 */
export function YouTubeVideoBackground({ videoId }: { videoId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [muted, setMuted] = useState(false);
  const [quality, setQuality] = useState<string>("hd720");
  const [apiReady, setApiReady] = useState(false);
  const [scale, setScale] = useState(1);

  // Adapter la taille du lecteur à la fenêtre (cover)
  useEffect(() => {
    const updateScale = () => {
      setScale(
        Math.max(
          window.innerWidth / 1920,
          window.innerHeight / 1080
        )
      );
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // Charger l'API YouTube
  useEffect(() => {
    if (!videoId || typeof window === "undefined") return;

    if (window.YT?.Player) {
      setApiReady(true);
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScript = document.getElementsByTagName("script")[0];
    firstScript?.parentNode?.insertBefore(tag, firstScript);

    window.onYouTubeIframeAPIReady = () => setApiReady(true);
    return () => {
      window.onYouTubeIframeAPIReady = undefined;
    };
  }, [videoId]);

  // Créer le lecteur quand l'API est prête
  useEffect(() => {
    if (!apiReady || !containerRef.current || !videoId) return;

    const player = new window.YT!.Player(containerRef.current, {
      videoId,
      width: 1920,
      height: 1080,
      playerVars: {
        autoplay: 1,
        mute: 0, // Son par défaut ; certains navigateurs bloquent l'autoplay avec son
        loop: 1,
        playlist: videoId,
        controls: 0,
        rel: 0,
        showinfo: 0,
        playsinline: 1,
      },
      events: {
        onReady: (e: { target: YTPlayer }) => {
          playerRef.current = e.target;
          e.target.setPlaybackQuality("hd720");
        },
      },
    });

    return () => {
      if (playerRef.current?.destroy) playerRef.current.destroy();
      playerRef.current = null;
    };
  }, [apiReady, videoId]);

  const handleMuteToggle = () => {
    if (!playerRef.current) return;
    if (muted) {
      playerRef.current.unMute();
      setMuted(false);
    } else {
      playerRef.current.mute();
      setMuted(true);
    }
  };

  const handleQualityChange = (q: string) => {
    if (!playerRef.current) return;
    playerRef.current.setPlaybackQuality(q);
    setQuality(q);
  };

  if (!videoId) return null;

  return (
    <>
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          ref={containerRef}
          className="absolute top-1/2 left-1/2 w-[1920px] h-[1080px] origin-center"
          style={{
            transform: `translate(-50%, -50%) scale(${scale})`,
          }}
        />
        <div className="absolute inset-0 bg-background/60" />
      </div>

      {/* Boutons qualité + son (au-dessus du contenu) */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col sm:flex-row items-end gap-2">
        <div className="flex rounded-lg overflow-hidden border border-white/20 bg-black/60 backdrop-blur-sm">
          {QUALITY_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleQualityChange(value)}
              className={`px-3 py-2 text-xs font-medium transition ${
                quality === value
                  ? "bg-purple-500 text-white"
                  : "text-white/90 hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleMuteToggle}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 bg-black/60 backdrop-blur-sm text-white/90 hover:bg-white/10 transition"
          aria-label={muted ? "Activer le son" : "Couper le son"}
        >
          {muted ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 8.028 12 8.448 12 9.414v5.172c0 .966-1.077 1.386-1.707.707L5.586 15z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 8.028 12 8.448 12 9.414v5.172c0 .966-1.077 1.386-1.707.707L5.586 15z"
              />
            </svg>
          )}
          <span className="text-sm">
            {muted ? "Activer le son" : "Son activé"}
          </span>
        </button>
      </div>
    </>
  );
}
