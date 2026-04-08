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
import type { YTPlayer } from "@/types/youtube.d";

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

// Hook helper pour YT avec marqueurs de performance
function useYTPlayer(videoId: string, ready: boolean, active: boolean, label: string) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YTPlayer | null>(null);

    useEffect(() => {
        if (!active || !ready || !containerRef.current || !videoId) return;

        // Marqueur: début d'initialisation du player
        if (typeof performance !== "undefined") {
            try {
                performance.mark(`yt-player-${label}-init`);
            } catch {
                // ignore
            }
        }

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

                    // Marqueur: player prêt + mesure depuis l'API prête
                    if (typeof performance !== "undefined") {
                        try {
                            performance.mark(`yt-player-${label}-ready`);
                            // Mesure globale depuis l'API prête (si le marqueur existe)
                            const hasApiReady =
                                performance.getEntriesByName("yt-api-ready").length > 0;
                            if (hasApiReady) {
                                const measure = performance.measure(
                                    `yt-player-${label}-from-api`,
                                    "yt-api-ready",
                                    `yt-player-${label}-ready`
                                );
                                if (process.env.NODE_ENV !== "production") {
                                    // eslint-disable-next-line no-console
                                    console.log(
                                        "[YTPerf] Player",
                                        label,
                                        "ready in",
                                        `${measure.duration.toFixed(0)} ms`
                                    );
                                }
                            }
                        } catch {
                            // ignore
                        }
                    }
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
    const {
        override: planetMusicOverride,
        youtubeAmbientSuspended,
        setYoutubeAmbientSuspended,
        setOverride: setPlanetMusicOverride,
    } = usePlanetMusicOverride();

    /** En mode `site`, on ignore les musiques planètes / partenaires (son = vidéos accueil + cycle uniquement). */
    const effectiveOverride =
        opts.backgroundMusicMode === "context" ? planetMusicOverride : null;

    const [apiReady, setApiReady] = useState(false);
    /** Délai avant de créer le player "cycle" pour étaler la charge (perf: évite 2 iframes lourds en même temps) */
    const [cyclePlayerAllowed, setCyclePlayerAllowed] = useState(false);
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
    const mainYT = useYTPlayer(
        mainYTId,
        apiReady && ytEnabled,
        mainType === 'youtube' && !effectiveOverride && ytEnabled,
        "main"
    );
    const cycleYT = useYTPlayer(
        cycleYTId,
        apiReady && ytEnabled,
        cycleType === 'youtube' && !effectiveOverride && ytEnabled && cyclePlayerAllowed,
        "cycle"
    );

    const overrideYTId = effectiveOverride?.type === "youtube" && effectiveOverride?.youtubeUrl
        ? getYoutubeVideoId(effectiveOverride.youtubeUrl)
        : "";
    const overrideYT = useYTPlayer(
        overrideYTId || "jfKfPfyJRdk",
        apiReady && ytEnabled,
        !!overrideYTId && ytEnabled,
        "override"
    );

    const mainNativeRef = useRef<HTMLVideoElement>(null);
    const cycleNativeRef = useRef<HTMLVideoElement>(null);
    const overrideNativeRef = useRef<HTMLVideoElement>(null);

    // Quand override (effectif) YouTube est actif, garder l'API YT chargée si besoin
    useEffect(() => {
        if (effectiveOverride?.type !== "youtube" || !effectiveOverride?.youtubeUrl) return;
        if (mainType !== 'youtube' && cycleType !== 'youtube' && !window.YT?.Player) return;
        if (typeof window === "undefined") return;
        if (document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) return;
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
    }, [effectiveOverride, mainType, cycleType]);

    // Autoriser le player "cycle" après un délai pour étaler la charge (perf)
    useEffect(() => {
        if (!apiReady || !ytEnabled || cycleType !== 'youtube') return;
        const t = setTimeout(() => setCyclePlayerAllowed(true), 1200);
        return () => clearTimeout(t);
    }, [apiReady, ytEnabled, cycleType]);

    // Accueil : musique structure/partenaire persistante doit s’arrêter (retour hub).
    useEffect(() => {
        if (isHome) {
            setPlanetMusicOverride(null);
        }
    }, [isHome, setPlanetMusicOverride]);

    // Accueil / explore : lever la suspension du son ambiant (vidéos YouTube du site)
    useEffect(() => {
        if (isHome || isExplore) {
            setYoutubeAmbientSuspended(false);
        }
    }, [isHome, isExplore, setYoutubeAmbientSuspended]);

    // Mute main/cycle quand override effectif (planète / partenaire) OU suspension post-fiche partenaire
    useEffect(() => {
        if (effectiveOverride) {
            if (mainYT.playerRef.current) mainYT.playerRef.current.mute();
            if (cycleYT.playerRef.current) cycleYT.playerRef.current.mute();
            if (mainNativeRef.current) mainNativeRef.current.muted = true;
            if (cycleNativeRef.current) cycleNativeRef.current.muted = true;
            return;
        }
        if (youtubeAmbientSuspended) {
            if (mainYT.playerRef.current) mainYT.playerRef.current.mute();
            if (cycleYT.playerRef.current) cycleYT.playerRef.current.mute();
            if (mainNativeRef.current) mainNativeRef.current.muted = true;
            if (cycleNativeRef.current) cycleNativeRef.current.muted = true;
            setMuted(true);
        }
    }, [effectiveOverride, youtubeAmbientSuspended, apiReady]);

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
            if (typeof performance !== "undefined") {
                try {
                    performance.mark("yt-api-ready");
                } catch {
                    // ignore
                }
            }
            return;
        }

        // Différer le chargement de l'API YouTube pour améliorer le FCP
        const DEFER_YT_MS = 1500;
        
        const loadYT = () => {
            if (typeof performance !== "undefined") {
                try {
                    performance.mark("yt-api-load-start");
                } catch {
                    // ignore
                }
            }

            // On vérifie régulièrement si YT API devient disponible
            const interval = setInterval(() => {
                if (window.YT?.Player) {
                    setApiReady(true);
                    if (typeof performance !== "undefined") {
                        try {
                            performance.mark("yt-api-ready");
                            const hasStart =
                                performance.getEntriesByName("yt-api-load-start").length > 0;
                            if (hasStart) {
                                const measure = performance.measure(
                                    "yt-api-total",
                                    "yt-api-load-start",
                                    "yt-api-ready"
                                );
                                if (process.env.NODE_ENV !== "production") {
                                    // eslint-disable-next-line no-console
                                    console.log(
                                        "[YTPerf] YouTube Iframe API ready in",
                                        `${measure.duration.toFixed(0)} ms`
                                    );
                                }
                            }
                        } catch {
                            // ignore
                        }
                    }
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
        if (youtubeAmbientSuspended && !effectiveOverride) {
            return;
        }
        const newMute = !muted;
        setMuted(newMute);
        if (effectiveOverride) {
            if (effectiveOverride.type === "youtube" && overrideYT.playerRef.current) {
                newMute ? overrideYT.playerRef.current.mute() : overrideYT.playerRef.current.unMute();
            }
            if (effectiveOverride.type === "file" && overrideNativeRef.current) {
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
            <div className="fixed inset-0 -z-10 overflow-hidden" style={{ filter: grayscale, transition: `filter 0.5s, opacity 0.5s`, opacity: showBlackBg ? 0 : (effectiveOverride ? 0.3 : 1) }}>
                {mainType === 'youtube' ? (
                    <div ref={mainYT.containerRef} className="absolute top-1/2 left-1/2 w-[1920px] h-[1080px] origin-center" style={{ transform: playerTransform }} />
                ) : (
                    mainMp4Url && (
                        <video ref={mainNativeRef} src={mainMp4Url} autoPlay loop muted playsInline className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover" style={{ transform: "translate(-50%, -50%)" }} />
                    )
                )}
            </div>

            {/* Vidéo cycle (masquée si option C active ou YouTube disabled) */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" style={{ opacity: showBlackBg ? 0 : (effectiveOverride ? 0 : cycleOpacity), filter: grayscale, transition: `opacity ${opts.videoTransition}ms ease, filter 0.5s` }}>
                {cycleType === 'youtube' ? (
                    <div ref={cycleYT.containerRef} className="absolute top-1/2 left-1/2 w-[1920px] h-[1080px] origin-center" style={{ transform: playerTransform }} />
                ) : (
                    cycleMp4Url && (
                        <video ref={cycleNativeRef} src={cycleMp4Url} autoPlay loop muted playsInline className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover" style={{ transform: "translate(-50%, -50%)" }} />
                    )
                )}
            </div>

            {/* Musique de fond planète / partenaire (override effectif) — prend le pas sur la vidéo d'accueil */}
            {effectiveOverride && (
                <div className="fixed inset-0 -z-10 overflow-hidden" style={{ transition: "opacity 0.5s", opacity: showBlackBg ? 0 : 1 }}>
                    {effectiveOverride.type === "youtube" && overrideYTId && (
                        <div ref={overrideYT.containerRef} className="absolute top-1/2 left-1/2 w-[1920px] h-[1080px] origin-center" style={{ transform: playerTransform }} />
                    )}
                    {effectiveOverride.type === "file" && effectiveOverride.fileUrl && (
                        <video
                            ref={overrideNativeRef}
                            src={effectiveOverride.fileUrl}
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
                    <button
                        type="button"
                        onClick={() => opts.set("backgroundMusicMode", "site")}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${opts.backgroundMusicMode === "site" ? "bg-amber-500 border-amber-500 text-white" : "border-white/20 bg-black/60 backdrop-blur-sm text-white/90 hover:bg-white/10"}`}
                        title="Son uniquement des vidéos du site (page d’accueil + cycle), sans musiques planètes ni partenaires"
                    >
                        🏠 Accueil
                    </button>
                    <button
                        type="button"
                        onClick={() => opts.set("backgroundMusicMode", "context")}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${opts.backgroundMusicMode === "context" ? "bg-teal-600 border-teal-500 text-white" : "border-white/20 bg-black/60 backdrop-blur-sm text-white/90 hover:bg-white/10"}`}
                        title="Musiques dédiées : planètes Explore et structures partenaires quand elles en ont une"
                    >
                        🤝 Dédiées
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
