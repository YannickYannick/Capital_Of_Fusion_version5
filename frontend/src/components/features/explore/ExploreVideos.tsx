"use client";

import { useEffect, useRef, useState } from "react";
import { usePlanetsOptions } from "@/contexts/PlanetsOptionsContext";

declare global {
    interface Window {
        YT?: { Player: new (el: HTMLElement, opts: unknown) => YTPlayer };
        onYouTubeIframeAPIReady?: () => void;
    }
}

interface YTPlayer {
    mute: () => void;
    unMute: () => void;
    destroy: () => void;
}

/** Charge un iframe YT et retourne le player + la ref du container */
function useYTPlayer(videoId: string, ready: boolean) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YTPlayer | null>(null);

    useEffect(() => {
        if (!ready || !containerRef.current || !videoId) return;
        const player = new window.YT!.Player(containerRef.current, {
            videoId,
            width: 1920,
            height: 1080,
            playerVars: { autoplay: 1, mute: 1, loop: 1, playlist: videoId, controls: 0, rel: 0, playsinline: 1 },
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
    }, [ready, videoId]);

    return { containerRef, playerRef };
}

const QUALITY_OPTIONS = [
    { value: "medium", label: "360p" },
    { value: "large", label: "480p" },
    { value: "hd720", label: "720p" },
    { value: "hd1080", label: "1080p" },
] as const;

/**
 * Fond vidéo double pour la page Explore :
 * - Vidéo principale (permanente, en dessous)  — videoIdMain
 * - Vidéo cyclique  (fondue, au-dessus)         — videoIdCycle
 * Cycle contrôlé par PlanetsOptionsContext (videoCycleVisible, videoCycleHidden, videoTransition, enableVideoCycle).
 * Grayscale contrôlé par opts.grayscaleVideo.
 */
export function ExploreVideos({
    videoIdMain,
    videoIdCycle,
}: {
    videoIdMain: string;
    videoIdCycle: string;
}) {
    const opts = usePlanetsOptions();
    const [apiReady, setApiReady] = useState(false);
    const [cycleOpacity, setCycleOpacity] = useState(0);
    const [scale, setScale] = useState(1);
    const [quality, setQuality] = useState("hd720");
    const [muted, setMuted] = useState(true);
    const main = useYTPlayer(videoIdMain, apiReady);
    const cycle = useYTPlayer(videoIdCycle, apiReady);

    // Adapter l'échelle au viewport
    useEffect(() => {
        const update = () => setScale(Math.max(window.innerWidth / 1920, window.innerHeight / 1080));
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    // Charger l'API YouTube une seule fois
    useEffect(() => {
        if (typeof window === "undefined") return;
        if (window.YT?.Player) { setApiReady(true); return; }
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
        window.onYouTubeIframeAPIReady = () => setApiReady(true);
        return () => { window.onYouTubeIframeAPIReady = undefined; };
    }, []);

    // Cycle vidéo
    useEffect(() => {
        if (!opts.enableVideoCycle) {
            setCycleOpacity(1);
            return;
        }

        let timer: ReturnType<typeof setTimeout>;
        const visibleMs = opts.videoCycleVisible * 1000;
        const hiddenMs = opts.videoCycleHidden * 1000;
        const transMs = opts.videoTransition;

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
    }, [opts.enableVideoCycle, opts.videoCycleVisible, opts.videoCycleHidden, opts.videoTransition]);

    const grayscale = opts.grayscaleVideo ? "grayscale(100%)" : "none";
    const transitionMs = opts.videoTransition;

    const handleMute = () => {
        if (!main.playerRef.current) return;
        if (muted) { main.playerRef.current.unMute(); setMuted(false); }
        else { main.playerRef.current.mute(); setMuted(true); }
    };

    const handleQuality = (q: string) => {
        if (main.playerRef.current) {
            (main.playerRef.current as any).setPlaybackQuality(q);
        }
        setQuality(q);
    };

    const playerTransform = `translate(-50%, -50%) scale(${scale})`;

    return (
        <>
            {/* Vidéo principale — permanente */}
            <div
                className="fixed inset-0 -z-10 overflow-hidden"
                style={{ filter: grayscale, transition: `filter 0.5s` }}
            >
                <div
                    ref={main.containerRef}
                    className="absolute top-1/2 left-1/2 w-[1920px] h-[1080px] origin-center"
                    style={{ transform: playerTransform }}
                />
                <div className="absolute inset-0 bg-black/30" />
            </div>

            {/* Vidéo cyclique — fondue par-dessus */}
            <div
                className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
                style={{
                    opacity: cycleOpacity,
                    filter: grayscale,
                    transition: `opacity ${transitionMs}ms ease, filter 0.5s`,
                }}
            >
                <div
                    ref={cycle.containerRef}
                    className="absolute top-1/2 left-1/2 w-[1920px] h-[1080px] origin-center"
                    style={{ transform: playerTransform }}
                />
            </div>

            {/* Contrôles qualité + son */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col sm:flex-row items-end gap-2">
                <div className="flex rounded-lg overflow-hidden border border-white/20 bg-black/60 backdrop-blur-sm">
                    {QUALITY_OPTIONS.map(({ value, label }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => handleQuality(value)}
                            className={`px-3 py-2 text-xs font-medium transition ${quality === value ? "bg-purple-500 text-white" : "text-white/90 hover:bg-white/10"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={handleMute}
                    className="px-4 py-2 rounded-lg border border-white/20 bg-black/60 backdrop-blur-sm text-white/90 hover:bg-white/10 transition text-sm"
                >
                    {muted ? "🔇 Activer le son" : "🔊 Son activé"}
                </button>
            </div>
        </>
    );
}
