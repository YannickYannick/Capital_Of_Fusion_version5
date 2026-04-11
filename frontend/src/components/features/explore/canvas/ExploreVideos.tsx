"use client";

/**
 * Vidéo de fond globale (YouTube ou MP4) : **main_video** sur toutes les routes où le fond est actif.
 * La seconde piste « cycle » configurée en admin n’est plus affichée (un seul lecteur = visuel cohérent + moins de charge).
 * Contrôles : qualité, mute, voile. Override possible depuis Explore (musique planète).
 */
import { useEffect, useRef, useState } from "react";
import { usePlanetsOptions } from "@/contexts/PlanetsOptionsContext";
import { usePlanetMusicOverride } from "@/contexts/PlanetMusicOverrideContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { isOrganizationNodeVideoBackgroundPath } from "@/lib/routeSegments";
import type { SiteConfigurationApi } from "@/types/config";
import type { YTPlayer } from "@/types/youtube.d";

const QUALITY_OPTIONS = [
    { value: "medium", label: "360p" },
    { value: "large", label: "480p" },
    { value: "hd720", label: "720p" },
    { value: "hd1080", label: "1080p" },
] as const;

type YoutubeQualitySetting = (typeof QUALITY_OPTIONS)[number]["value"];

const ADMIN_DEFAULT_QUALITIES = new Set<string>(
    QUALITY_OPTIONS.map((o) => o.value)
);

const DEFAULT_VIDEO_MAIN = process.env.NEXT_PUBLIC_YOUTUBE_VIDEO_ID || "jfKfPfyJRdk";

function getYoutubeVideoId(url: string): string | null {
    if (!url) return null;
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
}

/** Valeur initiale suggérée selon la route (premier rendu seulement) ; ensuite la qualité reste « collante » pour ne pas relancer le buffer au changement de page. */
const YT_QUALITY_HERO = "hd1080";
const YT_QUALITY_AMBIENT_MENU = "large";

// Hook helper pour YT avec marqueurs de performance
function useYTPlayer(
    videoId: string,
    ready: boolean,
    active: boolean,
    label: string,
    playbackQuality: string,
    /** Si true, le player démarre non muet (reprend le choix utilisateur après recréation du player, ex. changement de route / qualité). */
    preferUnmuted: boolean
) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YTPlayer | null>(null);
    const preferUnmutedRef = useRef(preferUnmuted);
    preferUnmutedRef.current = preferUnmuted;
    const playbackQualityRef = useRef(playbackQuality);
    playbackQualityRef.current = playbackQuality;

    // Recréer le player seulement si l’API / la vidéo / l’activation changent — pas si la qualité change
    // (sinon accueil ↔ menu relance la piste depuis le début).
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
                autoplay: 1,
                mute: preferUnmutedRef.current ? 0 : 1,
                loop: 1,
                playlist: videoId,
                controls: 0,
                rel: 0,
                playsinline: 1,
                vq: playbackQualityRef.current,
                origin: typeof window !== "undefined" ? window.location.origin : "",
            },
            events: {
                onReady: (e: { target: YTPlayer }) => {
                    playerRef.current = e.target;
                    try {
                        if (preferUnmutedRef.current) {
                            e.target.unMute();
                        } else {
                            e.target.mute();
                        }
                    } catch {
                        /* ignore */
                    }
                    try { e.target.setPlaybackQuality(playbackQualityRef.current); } catch (err) { }

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
                        try { e.target.setPlaybackQuality(playbackQualityRef.current); } catch (err) { }
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
    /** Accueil + Explore : 1080p. Autres pages (dont /promotions-festivals) : 480p — même rendu visuel derrière le flou, beaucoup moins lourd. */
    const bgYoutubeQuality = isHome || isExplore ? YT_QUALITY_HERO : YT_QUALITY_AMBIENT_MENU;
    const opts = usePlanetsOptions();
    const { user } = useAuth();
    const isAdmin = user?.user_type === "ADMIN";
    const {
        override: planetMusicOverride,
        youtubeAmbientSuspended,
        setYoutubeAmbientSuspended,
        setOverride: setPlanetMusicOverride,
    } = usePlanetMusicOverride();

    /** En mode `site`, on ignore les musiques planètes / partenaires (son = vidéo principale uniquement). */
    const effectiveOverride =
        opts.backgroundMusicMode === "context" ? planetMusicOverride : null;

    const [apiReady, setApiReady] = useState(false);
    const [scale, setScale] = useState(1);
    /** Qualité : défaut depuis l’admin Django si défini, sinon selon la route ; inchangée au navigate. */
    const adminDefaultQ = config?.video_ambience?.default_youtube_quality;
    const [quality, setQuality] = useState<YoutubeQualitySetting>(() => {
        if (adminDefaultQ && ADMIN_DEFAULT_QUALITIES.has(adminDefaultQ)) {
            return adminDefaultQ as YoutubeQualitySetting;
        }
        return bgYoutubeQuality as YoutubeQualitySetting;
    });
    const [muted, setMuted] = useState(true);

    const mainType = config?.main_video_type || 'youtube';

    const mainYTId = config?.main_video_youtube_id || DEFAULT_VIDEO_MAIN;

    const formatUrl = (path?: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";
        return `${baseApiUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const mainMp4Url = formatUrl(config?.main_video_file);

    // Don't create YT players if iframes are disabled
    const ytEnabled = !opts.disableYouTubeIframes;
    const preferUnmuted = !muted;

    const mainYT = useYTPlayer(
        mainYTId,
        apiReady && ytEnabled,
        mainType === 'youtube' && !effectiveOverride && ytEnabled,
        "main",
        quality,
        preferUnmuted
    );

    const overrideYTId = effectiveOverride?.type === "youtube" && effectiveOverride?.youtubeUrl
        ? getYoutubeVideoId(effectiveOverride.youtubeUrl)
        : "";
    const overrideYT = useYTPlayer(
        overrideYTId || "jfKfPfyJRdk",
        apiReady && ytEnabled,
        !!overrideYTId && ytEnabled,
        "override",
        YT_QUALITY_HERO,
        preferUnmuted
    );

    const mainNativeRef = useRef<HTMLVideoElement>(null);
    const overrideNativeRef = useRef<HTMLVideoElement>(null);

    // Quand override (effectif) YouTube est actif, charger l’API si la vidéo principale ne l’a pas déjà fait (ex. main en MP4).
    useEffect(() => {
        if (effectiveOverride?.type !== "youtube" || !effectiveOverride?.youtubeUrl) return;
        if (typeof window === "undefined") return;
        if (document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) return;
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
    }, [effectiveOverride]);

    // Accueil : musique structure/partenaire persistante doit s’arrêter (retour hub).
    useEffect(() => {
        if (isHome) {
            setPlanetMusicOverride(null);
        }
    }, [isHome, setPlanetMusicOverride]);

    // Accueil / explore / mode Accueil (site) / fiche nœud org : lever la suspension du son ambiant partout où le player tourne
    useEffect(() => {
        if (
            isHome ||
            isExplore ||
            opts.backgroundMusicMode === "site" ||
            isOrganizationNodeVideoBackgroundPath(pathname)
        ) {
            setYoutubeAmbientSuspended(false);
        }
    }, [isHome, isExplore, opts.backgroundMusicMode, pathname, setYoutubeAmbientSuspended]);

    // Mute main quand override effectif (planète / partenaire) OU suspension post-fiche partenaire
    useEffect(() => {
        if (effectiveOverride) {
            if (mainYT.playerRef.current) mainYT.playerRef.current.mute();
            if (mainNativeRef.current) mainNativeRef.current.muted = true;
            return;
        }
        if (youtubeAmbientSuspended) {
            if (mainYT.playerRef.current) mainYT.playerRef.current.mute();
            if (mainNativeRef.current) mainNativeRef.current.muted = true;
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
        const needsYtForOverride =
            effectiveOverride?.type === "youtube" && !!effectiveOverride.youtubeUrl;
        if (mainType !== "youtube" && !needsYtForOverride) return;
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
    }, [mainType, opts.disableYouTubeIframes, effectiveOverride]);

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
            if (mainNativeRef.current) mainNativeRef.current.muted = newMute;
        }
    };

    const handleQuality = (q: YoutubeQualitySetting) => {
        if (mainYT.playerRef.current) (mainYT.playerRef.current as any).setPlaybackQuality(q);
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
                        <video ref={mainNativeRef} src={mainMp4Url} autoPlay loop muted={muted} playsInline className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover" style={{ transform: "translate(-50%, -50%)" }} />
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
                {isAdmin && mainType === "youtube" && (
                    <div className="flex rounded-lg overflow-hidden border border-white/20 bg-black/60 backdrop-blur-sm">
                        {QUALITY_OPTIONS.map(({ value, label }) => (
                            <button key={value} type="button" onClick={() => handleQuality(value)} className={`px-3 py-2 text-xs font-medium transition ${quality === value ? "bg-purple-500 text-white" : "text-white/90 hover:bg-white/10"}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                )}

                {isAdmin && (
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
                )}

                {/* Contrôle son — visible pour tous les visiteurs */}
                <button type="button" onClick={handleMute} className="px-4 py-2 rounded-lg border border-white/20 bg-black/60 backdrop-blur-sm text-white/90 hover:bg-white/10 transition text-sm flex items-center gap-2">
                    {muted ? "🔇 Activer le son" : "🔊 Son activé"}
                </button>
            </div>
        </>
    );
}
