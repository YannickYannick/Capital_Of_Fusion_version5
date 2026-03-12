"use client";

/**
 * Vidéo de fond globale (YouTube ou MP4) :
 * - Page d'accueil (/) : main_video.
 * - Autres pages menu (hors /dashboard, /login, /register) : cycle_video (explore).
 * - Contrôles : qualité, mute, voile. Override possible depuis Explore (musique planète).
 */
import { useEffect, useRef, useState } from "react";
import { usePlanetsOptions } from "@/contexts/PlanetsOptionsContext";
import { usePlanetMusicOverride } from "@/contexts/PlanetMusicOverrideContext";
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

function getYoutubeVideoId(url: string): string | null {
    if (!url) return null;
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
}

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
                autoplay: 1, mute: 1, loop: 1, playlist: videoId,
                controls: 0, rel: 0, playsinline: 1, vq: 'hd1080',
                origin: typeof window !== "undefined" ? window.location.origin : "",
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
    const { override: planetMusicOverride } = usePlanetMusicOverride();

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

    // Don't create YT players if iframes are disabled
    const ytEnabled = !opts.disableYouTubeIframes;
    const mainYT = useYTPlayer(mainYTId, apiReady && ytEnabled, mainType === 'youtube' && !planetMusicOverride && ytEnabled);
    const cycleYT = useYTPlayer(cycleYTId, apiReady && ytEnabled, cycleType === 'youtube' && !planetMusicOverride && ytEnabled);

    const overrideYTId = planetMusicOverride?.type === "youtube" && planetMusicOverride?.youtubeUrl
        ? getYoutubeVideoId(planetMusicOverride.youtubeUrl)
        : "";
    const overrideYT = useYTPlayer(overrideYTId || "jfKfPfyJRdk", apiReady && ytEnabled, !!overrideYTId && ytEnabled);

    const mainNativeRef = useRef<HTMLVideoElement>(null);
    const cycleNativeRef = useRef<HTMLVideoElement>(null);
    const overrideNativeRef = useRef<HTMLVideoElement>(null);

    // Quand override planète est actif, garder l'API YT chargée si besoin
    useEffect(() => {
        if (planetMusicOverride?.type !== "youtube" || !planetMusicOverride?.youtubeUrl) return;
        if (mainType !== 'youtube' && cycleType !== 'youtube' && !window.YT?.Player) return;
        if (typeof window === "undefined") return;
        if (document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) return;
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
    }, [planetMusicOverride, mainType, cycleType]);

    // Mute main/cycle quand override planète actif
    useEffect(() => {
        if (!planetMusicOverride) return;
        if (mainYT.playerRef.current) mainYT.playerRef.current.mute();
        if (cycleYT.playerRef.current) cycleYT.playerRef.current.mute();
        if (mainNativeRef.current) mainNativeRef.current.muted = true;
        if (cycleNativeRef.current) cycleNativeRef.current.muted = true;
    }, [planetMusicOverride]);

    // Responsive scale pour YT
    useEffect(() => {
        const update = () => setScale(Math.max(window.innerWidth / 1920, window.innerHeight / 1080));
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    // Load YT API conditionally — DEFERRED by 1.5s to improve FCP
    // Skip loading entirely if YouTube iframes are disabled
    useEffect(() => {
        if (opts.disableYouTubeIframes) return;
        if (mainType !== 'youtube' && cycleType !== 'youtube') return;
        if (typeof window === "undefined") return;

        // Si l'API est déjà dispo
        if (window.YT?.Player) {
            setApiReady(true);
            return;
        }

        // Différer le chargement de l'API YouTube pour améliorer le FCP
        const DEFER_YT_MS = 1500;
        
        const loadYT = () => {
            // On vérifie régulièrement si YT API devient disponible
            const interval = setInterval(() => {
                if (window.YT?.Player) {
                    setApiReady(true);
                    clearInterval(interval);
                }
            }, 100);

            // Ajout du script seulement s'il n'existe pas
            if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
                const tag = document.createElement("script");
                tag.src = "https://www.youtube.com/iframe_api";
                tag.async = true;
                document.head.appendChild(tag);
            }

            return () => clearInterval(interval);
        };

        // Différer le chargement ou charger immédiatement si requestIdleCallback dispo
        let cleanupInterval: (() => void) | undefined;
        const deferTimer = setTimeout(() => {
            if ('requestIdleCallback' in window) {
                (window as any).requestIdleCallback(() => {
                    cleanupInterval = loadYT();
                });
            } else {
                cleanupInterval = loadYT();
            }
        }, DEFER_YT_MS);

        return () => {
            clearTimeout(deferTimer);
            cleanupInterval?.();
        };
    }, [mainType, cycleType, opts.disableYouTubeIframes]);

    // Visibilité du cycle
    useEffect(() => {
        // Transition vers explore depuis home
        if (opts.isTransitioningToExplore) {
            setCycleOpacity(1);
            return;
        }
        
        // Sur la page d'accueil : main_video uniquement (cycle masqué)
        if (isHome) {
            setCycleOpacity(0);
            return;
        }
        
        // Sur toutes les autres pages (menu) : cycle_video visible
        // Si enableVideoCycle est désactivé, afficher cycle en continu
        if (!opts.enableVideoCycle) {
            setCycleOpacity(1);
            return;
        }
        
        // Si enableVideoCycle est actif et on est sur /explore : cycle alterne
        if (isExplore) {
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
        }
        
        // Autres pages menu : cycle_video toujours visible
        setCycleOpacity(1);
    }, [opts.enableVideoCycle, opts.videoCycleVisible, opts.videoCycleHidden, isExplore, isHome, opts.isTransitioningToExplore]);

    // Routes exclues de la vidéo de fond (admin, authentification)
    const excludedRoutes = ["/dashboard", "/login", "/register"];
    const isExcluded = excludedRoutes.some(route => pathname.startsWith(route));
    
    // La vidéo est visible sur toutes les pages sauf celles exclues
    const isVisibleGlobally = !isExcluded || opts.isTransitioningToExplore;
    if (!isVisibleGlobally) return null;

    const grayscale = opts.grayscaleVideo ? "grayscale(100%)" : "none";
    const playerTransform = `translate(-50%, -50%) scale(${scale})`;

    const handleMute = () => {
        const newMute = !muted;
        setMuted(newMute);
        if (planetMusicOverride) {
            if (planetMusicOverride.type === "youtube" && overrideYT.playerRef.current) {
                newMute ? overrideYT.playerRef.current.mute() : overrideYT.playerRef.current.unMute();
            }
            if (planetMusicOverride.type === "file" && overrideNativeRef.current) {
                overrideNativeRef.current.muted = newMute;
            }
        } else {
            if (mainYT.playerRef.current) newMute ? mainYT.playerRef.current.mute() : mainYT.playerRef.current.unMute();
            if (cycleYT.playerRef.current) newMute ? cycleYT.playerRef.current.mute() : cycleYT.playerRef.current.unMute();
            if (mainNativeRef.current) mainNativeRef.current.muted = newMute;
            if (cycleNativeRef.current) cycleNativeRef.current.muted = newMute;
        }
    };

    const handleQuality = (q: string) => {
        if (mainYT.playerRef.current) (mainYT.playerRef.current as any).setPlaybackQuality(q);
        if (cycleYT.playerRef.current) (cycleYT.playerRef.current as any).setPlaybackQuality(q);
        setQuality(q);
    };

    // Determine if we should show black background (either option C or YouTube disabled)
    const showBlackBg = opts.useBlackBackground || opts.disableYouTubeIframes;

    return (
        <>
            {/* Option C : Fond noir solide (remplace toutes les vidéos) */}
            {/* Also used when YouTube iframes are disabled for performance testing */}
            {showBlackBg && (
                <div className="fixed inset-0 -z-10 bg-[#0a0e27]" />
            )}

            {/* Vidéo principale (masquée si option C active ou YouTube disabled) */}
            <div className="fixed inset-0 -z-10 overflow-hidden" style={{ filter: grayscale, transition: `filter 0.5s, opacity 0.5s`, opacity: showBlackBg ? 0 : (planetMusicOverride ? 0.3 : 1) }}>
                {mainType === 'youtube' ? (
                    <div ref={mainYT.containerRef} className="absolute top-1/2 left-1/2 w-[1920px] h-[1080px] origin-center" style={{ transform: playerTransform }} />
                ) : (
                    mainMp4Url && (
                        <video ref={mainNativeRef} src={mainMp4Url} autoPlay loop muted playsInline className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover" style={{ transform: "translate(-50%, -50%)" }} />
                    )
                )}
            </div>

            {/* Vidéo cycle (masquée si option C active ou YouTube disabled) */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" style={{ opacity: showBlackBg ? 0 : (planetMusicOverride ? 0 : cycleOpacity), filter: grayscale, transition: `opacity ${opts.videoTransition}ms ease, filter 0.5s` }}>
                {cycleType === 'youtube' ? (
                    <div ref={cycleYT.containerRef} className="absolute top-1/2 left-1/2 w-[1920px] h-[1080px] origin-center" style={{ transform: playerTransform }} />
                ) : (
                    cycleMp4Url && (
                        <video ref={cycleNativeRef} src={cycleMp4Url} autoPlay loop muted playsInline className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover" style={{ transform: "translate(-50%, -50%)" }} />
                    )
                )}
            </div>

            {/* Musique de fond planète (override) — prend le pas sur la vidéo d'accueil */}
            {planetMusicOverride && (
                <div className="fixed inset-0 -z-10 overflow-hidden" style={{ transition: "opacity 0.5s", opacity: showBlackBg ? 0 : 1 }}>
                    {planetMusicOverride.type === "youtube" && overrideYTId && (
                        <div ref={overrideYT.containerRef} className="absolute top-1/2 left-1/2 w-[1920px] h-[1080px] origin-center" style={{ transform: playerTransform }} />
                    )}
                    {planetMusicOverride.type === "file" && planetMusicOverride.fileUrl && (
                        <video
                            ref={overrideNativeRef}
                            src={planetMusicOverride.fileUrl}
                            autoPlay
                            loop
                            muted={muted}
                            playsInline
                            className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover"
                            style={{ transform: "translate(-50%, -50%)" }}
                        />
                    )}
                </div>
            )}

            {/* Option A : Voile sombre global (au-dessus de toutes les vidéos) */}
            {opts.showVideoOverlay && !showBlackBg && (
                <div className="fixed inset-0 -z-10 bg-black/50 pointer-events-none" />
            )}

            <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
                {/* Contrôles de qualité vidéo */}
                {(mainType === 'youtube' || cycleType === 'youtube') && (
                    <div className="flex rounded-lg overflow-hidden border border-white/20 bg-black/60 backdrop-blur-sm">
                        {QUALITY_OPTIONS.map(({ value, label }) => (
                            <button key={value} type="button" onClick={() => handleQuality(value)} className={`px-3 py-2 text-xs font-medium transition ${quality === value ? "bg-purple-500 text-white" : "text-white/90 hover:bg-white/10"}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                )}
                
                {/* Contrôles de contraste (A, B, C) */}
                <div className="flex flex-wrap justify-end gap-1 max-w-xs">
                    <button 
                        type="button" 
                        onClick={() => opts.set("showVideoOverlay", !opts.showVideoOverlay)} 
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${opts.showVideoOverlay ? "bg-purple-500 border-purple-500 text-white" : "border-white/20 bg-black/60 backdrop-blur-sm text-white/90 hover:bg-white/10"}`}
                        title="Ajoute un voile sombre sur la vidéo"
                    >
                        A: Voile
                    </button>
                    <button 
                        type="button" 
                        onClick={() => opts.set("enableTextShadow", !opts.enableTextShadow)} 
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${opts.enableTextShadow ? "bg-purple-500 border-purple-500 text-white" : "border-white/20 bg-black/60 backdrop-blur-sm text-white/90 hover:bg-white/10"}`}
                        title="Ajoute une ombre sur les textes"
                    >
                        B: Ombre texte
                    </button>
                    <button 
                        type="button" 
                        onClick={() => opts.set("useBlackBackground", !opts.useBlackBackground)} 
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${opts.useBlackBackground ? "bg-purple-500 border-purple-500 text-white" : "border-white/20 bg-black/60 backdrop-blur-sm text-white/90 hover:bg-white/10"}`}
                        title="Remplace la vidéo par un fond noir"
                    >
                        C: Fond noir
                    </button>
                    <button 
                        type="button" 
                        onClick={() => opts.set("disableYouTubeIframes", !opts.disableYouTubeIframes)} 
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${opts.disableYouTubeIframes ? "bg-red-500 border-red-500 text-white" : "border-white/20 bg-black/60 backdrop-blur-sm text-white/90 hover:bg-white/10"}`}
                        title="Désactive complètement les iframes YouTube (test perf)"
                    >
                        🚫 YT
                    </button>
                </div>

                {/* Contrôle son */}
                <button type="button" onClick={handleMute} className="px-4 py-2 rounded-lg border border-white/20 bg-black/60 backdrop-blur-sm text-white/90 hover:bg-white/10 transition text-sm flex items-center gap-2">
                    {muted ? "🔇 Activer le son" : "🔊 Son activé"}
                </button>
            </div>
        </>
    );
}
