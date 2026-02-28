"use client";

import { useEffect, useRef, useState } from "react";
import { usePlanetsOptions } from "@/contexts/PlanetsOptionsContext";
import { usePathname } from "next/navigation";
import type { SiteConfigurationApi } from "@/types/config";

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

const DEFAULT_VIDEO_MAIN = process.env.NEXT_PUBLIC_YOUTUBE_VIDEO_ID || "jfKfPfyJRdk";
const DEFAULT_VIDEO_CYCLE = process.env.NEXT_PUBLIC_YOUTUBE_CYCLE_VIDEO_ID || "eZhq_RMYRKQ";

// Hook helper pour YT
function useYTPlayer(videoId: string, ready: boolean, active: boolean) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YTPlayer | null>(null);

    useEffect(() => {
        if (!active || !ready || !containerRef.current || !videoId) return;
        const player = new window.YT!.Player(containerRef.current, {
            videoId,
            width: 1920,
            height: 1080,
            playerVars: {
                autoplay: 1, mute: 1, loop: 1, playlist: videoId, controls: 0, rel: 0, playsinline: 1, vq: 'hd1080'
            },
            events: {
                onReady: (e: { target: YTPlayer }) => {
                    playerRef.current = e.target;
                    e.target.mute();
                    try { e.target.setPlaybackQuality("hd1080"); } catch (err) { }
                },
                onStateChange: (e: { target: YTPlayer; data: number }) => {
                    if (e.data === 1) {
                        try { e.target.setPlaybackQuality("hd1080"); } catch (err) { }
                    }
                }
            }
        });
        return () => {
            if (playerRef.current?.destroy) playerRef.current.destroy();
            playerRef.current = null;
        };
    }, [ready, videoId, active]);

    return { containerRef, playerRef };
}

export function GlobalVideoBackground({ config }: { config: SiteConfigurationApi | null }) {
    const pathname = usePathname();
    const isHome = pathname === "/";
    const isExplore = pathname === "/explore";
    const opts = usePlanetsOptions();

    const [apiReady, setApiReady] = useState(false);
    const [cycleOpacity, setCycleOpacity] = useState(0);
    const [scale, setScale] = useState(1);
    const [quality, setQuality] = useState("hd1080");
    const [muted, setMuted] = useState(true);

    const mainType = config?.main_video_type || 'youtube';
    const cycleType = config?.cycle_video_type || 'youtube';

    const mainYTId = config?.main_video_youtube_id || DEFAULT_VIDEO_MAIN;
    const cycleYTId = config?.cycle_video_youtube_id || DEFAULT_VIDEO_CYCLE;

    const formatUrl = (path?: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";
        return `${baseApiUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const mainMp4Url = formatUrl(config?.main_video_file);
    const cycleMp4Url = formatUrl(config?.cycle_video_file);

    const mainYT = useYTPlayer(mainYTId, apiReady, mainType === 'youtube');
    const cycleYT = useYTPlayer(cycleYTId, apiReady, cycleType === 'youtube');

    const mainNativeRef = useRef<HTMLVideoElement>(null);
    const cycleNativeRef = useRef<HTMLVideoElement>(null);

    // Responsive scale pour YT
    useEffect(() => {
        const update = () => setScale(Math.max(window.innerWidth / 1920, window.innerHeight / 1080));
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    // Load YT API conditionally
    useEffect(() => {
        if (mainType !== 'youtube' && cycleType !== 'youtube') return;
        if (typeof window === "undefined") return;
        if (window.YT?.Player) { setApiReady(true); return; }
        if (document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) return;

        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
        window.onYouTubeIframeAPIReady = () => setApiReady(true);
        return () => { window.onYouTubeIframeAPIReady = undefined; };
    }, [mainType, cycleType]);

    // Visibilité du cycle
    useEffect(() => {
        if (opts.isTransitioningToExplore) {
            setCycleOpacity(1);
            return;
        }
        if (!isExplore) {
            setCycleOpacity(0);
            return;
        }
        if (!opts.enableVideoCycle) {
            setCycleOpacity(1);
            return;
        }

        let timer: ReturnType<typeof setTimeout>;
        const visibleMs = opts.videoCycleVisible * 1000;
        const hiddenMs = opts.videoCycleHidden * 1000;

        function showCycle() {
            setCycleOpacity(1);
            timer = setTimeout(hideCycle, visibleMs);
        }
        function hideCycle() {
            setCycleOpacity(0);
            timer = setTimeout(showCycle, hiddenMs);
        }

        showCycle();
        return () => clearTimeout(timer);
    }, [opts.enableVideoCycle, opts.videoCycleVisible, opts.videoCycleHidden, isExplore, opts.isTransitioningToExplore]);

    const isVisibleGlobally = isHome || isExplore || opts.isTransitioningToExplore;
    if (!isVisibleGlobally) return null;

    const grayscale = opts.grayscaleVideo ? "grayscale(100%)" : "none";
    const playerTransform = `translate(-50%, -50%) scale(${scale})`;

    const handleMute = () => {
        const newMute = !muted;
        setMuted(newMute);
        if (mainYT.playerRef.current) newMute ? mainYT.playerRef.current.mute() : mainYT.playerRef.current.unMute();
        if (cycleYT.playerRef.current) newMute ? cycleYT.playerRef.current.mute() : cycleYT.playerRef.current.unMute();
        if (mainNativeRef.current) mainNativeRef.current.muted = newMute;
        if (cycleNativeRef.current) cycleNativeRef.current.muted = newMute;
    };

    const handleQuality = (q: string) => {
        if (mainYT.playerRef.current) (mainYT.playerRef.current as any).setPlaybackQuality(q);
        if (cycleYT.playerRef.current) (cycleYT.playerRef.current as any).setPlaybackQuality(q);
        setQuality(q);
    };

    return (
        <>
            <div className="fixed inset-0 -z-10 overflow-hidden" style={{ filter: grayscale, transition: `filter 0.5s` }}>
                {mainType === 'youtube' ? (
                    <div ref={mainYT.containerRef} className="absolute top-1/2 left-1/2 w-[1920px] h-[1080px] origin-center" style={{ transform: playerTransform }} />
                ) : (
                    mainMp4Url && (
                        <video ref={mainNativeRef} src={mainMp4Url} autoPlay loop muted playsInline className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover" style={{ transform: "translate(-50%, -50%)" }} />
                    )
                )}
                {opts.showVideoOverlay && <div className="absolute inset-0 bg-black/30 pointer-events-none" />}
            </div>

            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" style={{ opacity: cycleOpacity, filter: grayscale, transition: `opacity ${opts.videoTransition}ms ease, filter 0.5s` }}>
                {cycleType === 'youtube' ? (
                    <div ref={cycleYT.containerRef} className="absolute top-1/2 left-1/2 w-[1920px] h-[1080px] origin-center" style={{ transform: playerTransform }} />
                ) : (
                    cycleMp4Url && (
                        <video ref={cycleNativeRef} src={cycleMp4Url} autoPlay loop muted playsInline className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover" style={{ transform: "translate(-50%, -50%)" }} />
                    )
                )}
            </div>

            <div className="fixed bottom-4 right-4 z-50 flex flex-col sm:flex-row items-end gap-2">
                {(mainType === 'youtube' || cycleType === 'youtube') && (
                    <div className="flex rounded-lg overflow-hidden border border-white/20 bg-black/60 backdrop-blur-sm">
                        {QUALITY_OPTIONS.map(({ value, label }) => (
                            <button key={value} type="button" onClick={() => handleQuality(value)} className={`px-3 py-2 text-xs font-medium transition ${quality === value ? "bg-purple-500 text-white" : "text-white/90 hover:bg-white/10"}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                )}
                <button type="button" onClick={() => opts.set("showVideoOverlay", !opts.showVideoOverlay)} className="px-4 py-2 rounded-lg border border-white/20 bg-black/60 backdrop-blur-sm text-white/90 hover:bg-white/10 transition text-sm flex items-center gap-2">
                    {opts.showVideoOverlay ? "👁️‍🗨️ Masquer voile" : "👁️ Afficher voile"}
                </button>
                <button type="button" onClick={handleMute} className="px-4 py-2 rounded-lg border border-white/20 bg-black/60 backdrop-blur-sm text-white/90 hover:bg-white/10 transition text-sm flex items-center gap-2">
                    {muted ? "🔇 Activer le son" : "🔊 Son activé"}
                </button>
            </div>
        </>
    );
}
