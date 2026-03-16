"use client";

/**
 * Vidéo de fond cycle uniquement, pour les pages "menu" (hors accueil/explore).
 * Léger : pas de PlanetsOptions ni PlanetMusicOverride, une seule vidéo.
 * Montage différé pour prioriser le FCP.
 */
import { useEffect, useRef, useState } from "react";
import type { YTPlayer } from "@/types/youtube.d";

export type CycleVideoConfig = {
  cycle_video_type: "youtube" | "mp4";
  cycle_video_youtube_id: string;
  cycle_video_file: string | null;
};

const DEFAULT_CYCLE_YT_ID = process.env.NEXT_PUBLIC_YOUTUBE_CYCLE_VIDEO_ID || "eZhq_RMYRKQ";
const DEFER_MOUNT_MS = 400;
const DEFER_YT_MS = 800;

function formatMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function CycleVideoOnly({ config }: { config: CycleVideoConfig | null }) {
  const [mounted, setMounted] = useState(false);
  const [ytReady, setYtReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);

  const type = config?.cycle_video_type ?? "youtube";
  const ytId = config?.cycle_video_youtube_id || DEFAULT_CYCLE_YT_ID;
  const mp4Url = formatMediaUrl(config?.cycle_video_file ?? null);

  // Montage différé du composant
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), DEFER_MOUNT_MS);
    return () => clearTimeout(t);
  }, []);

  // Chargement YT API si nécessaire (YouTube uniquement)
  useEffect(() => {
    if (!mounted || type !== "youtube" || typeof window === "undefined") return;
    if (window.YT?.Player) {
      setYtReady(true);
      return;
    }
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const timer = setTimeout(() => {
      if (window.YT?.Player) {
        setYtReady(true);
        return;
      }
      const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (existing) {
        intervalId = setInterval(() => {
          if (window.YT?.Player) {
            setYtReady(true);
          }
        }, 100);
        return;
      }
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        setYtReady(true);
        prev?.();
      };
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      document.head.appendChild(tag);
    }, DEFER_YT_MS);
    return () => {
      clearTimeout(timer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [mounted, type]);

  // Création du player YouTube quand l’API est prête
  useEffect(() => {
    if (type !== "youtube" || !ytReady || !containerRef.current || !ytId) return;
    const player = new window.YT!.Player(containerRef.current, {
      videoId: ytId,
      width: 1920,
      height: 1080,
      playerVars: {
        autoplay: 1,
        mute: 1,
        loop: 1,
        playlist: ytId,
        controls: 0,
        rel: 0,
        playsinline: 1,
        origin: typeof window !== "undefined" ? window.location.origin : "",
      },
      events: {
        onReady: (e: { target: YTPlayer }) => {
          playerRef.current = e.target;
          e.target.mute();
        },
      },
    });
    return () => {
      if (playerRef.current?.destroy) playerRef.current.destroy();
      playerRef.current = null;
    };
  }, [type, ytReady, ytId]);

  const [scale, setScale] = useState(1);
  useEffect(() => {
    if (!mounted) return;
    const update = () => setScale(Math.max(window.innerWidth / 1920, window.innerHeight / 1080));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [mounted]);

  if (!mounted) return null;

  const transform = `translate(-50%, -50%) scale(${scale})`;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {type === "youtube" ? (
        <div
          ref={containerRef}
          className="absolute top-1/2 left-1/2 w-[1920px] h-[1080px] origin-center"
          style={{ transform }}
        />
      ) : (
        mp4Url && (
          <video
            src={mp4Url}
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover"
            style={{ transform: "translate(-50%, -50%)" }}
          />
        )
      )}
    </div>
  );
}
