"use client";

/**
 * Vidéo de fond globale (YouTube ou MP4) : main_video sur toutes les routes où le fond est actif.
 * Sur la route /explore uniquement : seconde piste cycle (admin) derrière la principale, fondu temporisé
 * (enableVideoCycle + sliders Options) ou superposition continue (principale semi-transparente).
 * Contrôles : qualité, mute, voile. Override possible depuis Explore (musique planète).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { usePlanetsOptions } from "@/contexts/PlanetsOptionsContext";
import { usePlanetMusicOverride } from "@/contexts/PlanetMusicOverrideContext";
import {
    DEFAULT_AMBIENT_VIDEO_SOUND_API,
    useAmbientVideoSoundSetter,
} from "@/contexts/AmbientVideoSoundContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
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
const DEFAULT_CYCLE_YT_ID = process.env.NEXT_PUBLIC_YOUTUBE_CYCLE_VIDEO_ID || "eZhq_RMYRKQ";

/** Opacités main (devant) / cycle (derrière) pour le mode « Vidéo en fondue » sur Explore. */
function computeExploreVideoCrossfade(
    nowMs: number,
    visibleMs: number,
    hiddenMs: number,
    transitionMs: number
): { main: number; cycle: number } {
    const Tv = Math.max(0, visibleMs);
    const Th = Math.max(0, hiddenMs);
    const Tt = Math.max(transitionMs, 16);
    const P = Tv + Tt + Th + Tt;
    if (P < Tt * 2 + 50) {
        return { main: 0.65, cycle: 1 };
    }
    const t = nowMs % P;
    if (t < Tv) {
        return { main: 1, cycle: 0 };
    }
    if (t < Tv + Tt) {
        const u = (t - Tv) / Tt;
        return { main: 1 - u, cycle: u };
    }
    if (t < Tv + Tt + Th) {
        return { main: 0, cycle: 1 };
    }
    const u = (t - Tv - Tt - Th) / Tt;
    return { main: u, cycle: 1 - u };
}

const YT_STATE_ENDED = 0;
const YT_STATE_PLAYING = 1;
const YT_STATE_PAUSED = 2;
const YT_STATE_BUFFERING = 3;

/**
 * Boucle manuelle sans `playlist` (évite les boutons prev/next au centre du lecteur YT).
 * La pause est également relancée : le fond est purement décoratif et YouTube affiche
 * son gros indicateur pause/play au centre de l'iframe (non stylable, cross-origin).
 */
function handleAmbientYoutubeStateChange(
    e: { target: YTPlayer; data: number },
    onPlaying?: (target: YTPlayer) => void
) {
    if (e.data === YT_STATE_PLAYING) {
        onPlaying?.(e.target);
    }
    if (e.data === YT_STATE_ENDED) {
        try {
            e.target.seekTo?.(0, true);
            e.target.playVideo?.();
        } catch {
            /* ignore */
        }
    }
    if (e.data === YT_STATE_PAUSED) {
        try {
            e.target.playVideo?.();
        } catch {
            /* ignore */
        }
    }
}

function getYoutubeVideoId(url: string): string | null {
    if (!url) return null;
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
}

/** Fréquence de surveillance de l'état des lecteurs d'ambiance. */
const AMBIENT_STATE_POLL_MS = 500;

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
    /**
     * Tant que la lecture n'a pas démarré, l'iframe reste invisible : YouTube y affiche
     * sa première image accompagnée de l'indicateur pause/play central, qu'on ne peut pas
     * masquer en CSS (iframe cross-origin).
     */
    const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
    const preferUnmutedRef = useRef(preferUnmuted);
    preferUnmutedRef.current = preferUnmuted;
    const playbackQualityRef = useRef(playbackQuality);
    playbackQualityRef.current = playbackQuality;

    // Recréer le player seulement si l’API / la vidéo / l’activation changent — pas si la qualité change
    // (sinon accueil ↔ menu relance la piste depuis le début).
    useEffect(() => {
        if (!active || !ready || !containerRef.current || !videoId) return;

        setHasStartedPlaying(false);

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
                controls: 0,
                disablekb: 1,
                fs: 0,
                modestbranding: 1,
                iv_load_policy: 3,
                cc_load_policy: 0,
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
                    // iOS Safari ignore parfois `autoplay=1` même si la vidéo est muette.
                    // Un `playVideo()` explicite (best-effort) suffit souvent à lancer la lecture.
                    try {
                        e.target.playVideo?.();
                        // Retry court pour les cas où le player n'est pas encore pleinement prêt.
                        window.setTimeout(() => e.target.playVideo?.(), 250);
                        window.setTimeout(() => e.target.playVideo?.(), 1000);
                    } catch {
                        /* ignore */
                    }

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
                    handleAmbientYoutubeStateChange(e, (target) => {
                        setHasStartedPlaying(true);
                        try { target.setPlaybackQuality(playbackQualityRef.current); } catch (err) { }
                    });
                }
            }
        });
        return () => {
            if (playerRef.current?.destroy) playerRef.current.destroy();
            playerRef.current = null;
        };
    }, [ready, videoId, active]);

    /**
     * `onStateChange` ne suffit pas : un lecteur dont l'autoplay est refusé reste
     * en « non démarré » sans jamais émettre d'événement, tout en affichant sa
     * première image et l'indicateur pause/play central. On surveille donc l'état
     * réel : visible uniquement en lecture, et relance tant que ce n'est pas le cas.
     */
    useEffect(() => {
        if (!active || !ready) return;
        const timer = window.setInterval(() => {
            const player = playerRef.current;
            if (!player?.getPlayerState) return;
            let state: number;
            try {
                state = player.getPlayerState();
            } catch {
                return;
            }
            if (state === YT_STATE_PLAYING) {
                setHasStartedPlaying(true);
                return;
            }
            // Mémoire tampon / fin de boucle : on ne masque pas (évite un clignotement).
            if (state === YT_STATE_BUFFERING) return;
            setHasStartedPlaying(false);
            try {
                if (state === YT_STATE_ENDED) player.seekTo?.(0, true);
                player.playVideo?.();
            } catch {
                /* ignore */
            }
        }, AMBIENT_STATE_POLL_MS);
        return () => window.clearInterval(timer);
    }, [active, ready, videoId]);

    return { containerRef, playerRef, hasStartedPlaying };
}

export function GlobalVideoBackground({ config }: { config: SiteConfigurationApi | null }) {
    const t = useTranslations("explore");
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
    const [exploreLayerOpacities, setExploreLayerOpacities] = useState({ main: 1, cycle: 0 });

    const mainType = config?.main_video_type || 'youtube';

    const mainYTId = config?.main_video_youtube_id || DEFAULT_VIDEO_MAIN;

    const formatUrl = (path?: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";
        return `${baseApiUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const mainMp4Url = formatUrl(config?.main_video_file);
    const hasUsableMainMp4 = useMemo(() => {
        if (!mainMp4Url) return false;
        // En prod, si NEXT_PUBLIC_API_URL n'est pas configuré, `formatUrl` peut fabriquer une URL locale.
        // Sur iOS, ça forcerait un fallback MP4... vers un fichier inaccessible.
        return !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\b/i.test(mainMp4Url);
    }, [mainMp4Url]);

    /**
     * iOS Safari (et certains WebViews) bloquent fréquemment l'autoplay des iframes YouTube,
     * même mutées, surtout en mode économie d'énergie / data saver / restrictions médias.
     * On bascule automatiquement sur un MP4 natif si disponible.
     */
    const isIos = useMemo(() => {
        if (typeof navigator === "undefined") return false;
        const ua = navigator.userAgent || "";
        // iPadOS 13+ peut se présenter comme "Macintosh" mais avec touch points.
        const isAppleMobile = /iPhone|iPad|iPod/i.test(ua);
        const isIpadOs = /Macintosh/i.test(ua) && (navigator as any).maxTouchPoints > 1;
        return isAppleMobile || isIpadOs;
    }, []);

    const mainRenderType: "youtube" | "file" = useMemo(() => {
        if (mainType !== "youtube") return "file";
        if (isIos && hasUsableMainMp4) return "file";
        return "youtube";
    }, [mainType, isIos, hasUsableMainMp4]);

    const excludedForVideo = ["/dashboard", "/login", "/register"].some((route) => pathname.startsWith(route));
    const showBlackForVideo = opts.useBlackBackground || opts.disableYouTubeIframes;
    const cycleType = config?.cycle_video_type ?? "youtube";
    const cycleYTId = config?.cycle_video_youtube_id?.trim() || DEFAULT_CYCLE_YT_ID;
    const cycleMp4Url = formatUrl(config?.cycle_video_file ?? null);
    const exploreCycleWanted =
        pathname === "/explore" &&
        !effectiveOverride &&
        !showBlackForVideo &&
        !excludedForVideo &&
        (cycleType === "youtube"
            ? !opts.disableYouTubeIframes && !!cycleYTId
            : !!cycleMp4Url);

    // Don't create YT players if iframes are disabled
    const ytEnabled = !opts.disableYouTubeIframes;
    const preferUnmuted = !muted;

    const mainYT = useYTPlayer(
        mainYTId,
        apiReady && ytEnabled,
        mainRenderType === "youtube" && !effectiveOverride && ytEnabled,
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

    const cycleYT = useYTPlayer(
        cycleYTId,
        apiReady && ytEnabled,
        exploreCycleWanted && cycleType === "youtube" && ytEnabled,
        "cycle",
        quality,
        false
    );

    const mainNativeRef = useRef<HTMLVideoElement>(null);
    const overrideNativeRef = useRef<HTMLVideoElement>(null);
    const cycleNativeRef = useRef<HTMLVideoElement>(null);

    // iOS + YouTube : l'autoplay est parfois refusé tant qu'il n'y a pas eu de geste utilisateur.
    // On "kick" le player au premier touch/click global, sans overlay intrusif.
    useEffect(() => {
        if (!isIos) return;
        if (mainRenderType !== "youtube") return;
        if (!ytEnabled) return;

        const tryPlay = () => {
            try {
                mainYT.playerRef.current?.playVideo?.();
                window.setTimeout(() => mainYT.playerRef.current?.playVideo?.(), 250);
            } catch {
                // ignore
            }
        };

        // Tentative immédiate (au cas où autoplay est autorisé)
        tryPlay();

        const onFirstGesture = () => {
            tryPlay();
            window.removeEventListener("touchstart", onFirstGesture, { capture: true } as any);
            window.removeEventListener("click", onFirstGesture, { capture: true } as any);
        };

        window.addEventListener("touchstart", onFirstGesture, { capture: true, passive: true });
        window.addEventListener("click", onFirstGesture, { capture: true, passive: true } as any);

        return () => {
            window.removeEventListener("touchstart", onFirstGesture, { capture: true } as any);
            window.removeEventListener("click", onFirstGesture, { capture: true } as any);
        };
    }, [isIos, mainRenderType, ytEnabled, mainYT.playerRef]);

    // iOS : "kick" au premier geste utilisateur pour garantir play() (autoplay parfois ignoré)
    useEffect(() => {
        if (!isIos) return;
        const v = mainNativeRef.current;
        if (!v) return;
        if (mainRenderType !== "file") return;
        const tryPlay = () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                v.play();
            } catch {
                // ignore
            }
        };
        // Essayer immédiatement (au cas où l'autoplay est autorisé)
        tryPlay();
        const onFirstTouch = () => {
            tryPlay();
            window.removeEventListener("touchstart", onFirstTouch, { capture: true } as any);
            window.removeEventListener("click", onFirstTouch, { capture: true } as any);
        };
        window.addEventListener("touchstart", onFirstTouch, { capture: true, passive: true });
        window.addEventListener("click", onFirstTouch, { capture: true, passive: true } as any);
        return () => {
            window.removeEventListener("touchstart", onFirstTouch, { capture: true } as any);
            window.removeEventListener("click", onFirstTouch, { capture: true } as any);
        };
    }, [isIos, mainRenderType]);

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

    // Superposition main + cycle sur /explore (fondue temporisée ou continue)
    useEffect(() => {
        if (!exploreCycleWanted) {
            setExploreLayerOpacities({ main: 1, cycle: 0 });
            return;
        }
        if (!opts.enableVideoCycle) {
            setExploreLayerOpacities({ main: 0.68, cycle: 1 });
            return;
        }
        const tick = () => {
            setExploreLayerOpacities(
                computeExploreVideoCrossfade(
                    performance.now(),
                    opts.videoCycleVisible * 1000,
                    opts.videoCycleHidden * 1000,
                    Math.max(opts.videoTransition, 16)
                )
            );
        };
        tick();
        const id = setInterval(tick, 80);
        return () => clearInterval(id);
    }, [
        exploreCycleWanted,
        opts.enableVideoCycle,
        opts.videoCycleVisible,
        opts.videoCycleHidden,
        opts.videoTransition,
    ]);

    // Responsive scale pour YT
    useEffect(() => {
        const update = () => setScale(Math.max(window.innerWidth / 1920, window.innerHeight / 1080));
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    /** Évite les overlays navigateur (prev/pause/next) liés à Media Session sur fond vidéo. */
    useEffect(() => {
        if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
        const ms = navigator.mediaSession;
        try {
            ms.metadata = null;
            (
                [
                    "play",
                    "pause",
                    "previoustrack",
                    "nexttrack",
                    "seekbackward",
                    "seekforward",
                    "seekto",
                ] as const
            ).forEach((action) => {
                try {
                    ms.setActionHandler(action, null);
                } catch {
                    /* ignore */
                }
            });
        } catch {
            /* ignore */
        }
    }, []);

    // Load YT API conditionally — DEFERRED by 1.5s to improve FCP
    // Skip loading entirely if YouTube iframes are disabled
    useEffect(() => {
        if (opts.disableYouTubeIframes) return;
        const needsYtForOverride =
            effectiveOverride?.type === "youtube" && !!effectiveOverride.youtubeUrl;
        const needsYtForExploreCycle =
            pathname === "/explore" &&
            (config?.cycle_video_type ?? "youtube") === "youtube" &&
            !opts.useBlackBackground;
        if (mainType !== "youtube" && !needsYtForOverride && !needsYtForExploreCycle) return;
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
    }, [mainType, opts.disableYouTubeIframes, effectiveOverride, pathname, config?.cycle_video_type, opts.useBlackBackground]);

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
        try {
            cycleYT.playerRef.current?.setPlaybackQuality?.(q);
        } catch {
            /* ignore */
        }
        setQuality(q);
    };

    // Determine if we should show black background (either option C or YouTube disabled)
    const showBlackBg = opts.useBlackBackground || opts.disableYouTubeIframes;

    const setAmbientApi = useAmbientVideoSoundSetter();
    const handleMuteRef = useRef(handleMute);
    handleMuteRef.current = handleMute;

    useEffect(() => {
        if (!isVisibleGlobally) {
            setAmbientApi(DEFAULT_AMBIENT_VIDEO_SOUND_API);
            return;
        }
        const disabled = showBlackBg || (youtubeAmbientSuspended && !effectiveOverride);
        setAmbientApi({
            muted,
            disabled,
            toggle: () => {
                handleMuteRef.current();
            },
        });
        return () => {
            setAmbientApi(DEFAULT_AMBIENT_VIDEO_SOUND_API);
        };
    }, [
        isVisibleGlobally,
        muted,
        showBlackBg,
        youtubeAmbientSuspended,
        effectiveOverride,
        setAmbientApi,
    ]);

    return (
        <>
            {/* Option C : Fond noir solide (remplace toutes les vidéos) */}
            {/* Also used when YouTube iframes are disabled for performance testing */}
            {showBlackBg && (
                <div className="fixed inset-0 -z-10 bg-[#0a0e27]" />
            )}

            {/* /explore : vidéo cycle (admin), derrière la principale */}
            {exploreCycleWanted && (
                <div
                    className="ambient-video-layer fixed inset-0 -z-10 overflow-hidden pointer-events-none"
                    style={{
                        filter: grayscale,
                        opacity: exploreLayerOpacities.cycle,
                        transition:
                            exploreCycleWanted && opts.enableVideoCycle ? "filter 0.5s" : "filter 0.5s, opacity 0.35s",
                    }}
                >
                    {cycleType === "youtube" ? (
                        <div
                            className="absolute inset-0"
                            style={{
                                opacity: cycleYT.hasStartedPlaying ? 1 : 0,
                                transition: "opacity 0.4s",
                            }}
                        >
                            <div
                                ref={cycleYT.containerRef}
                                className="absolute top-1/2 left-1/2 w-[1920px] h-[1080px] origin-center"
                                style={{ transform: playerTransform }}
                            />
                        </div>
                    ) : (
                        cycleMp4Url && (
                            <video
                                ref={cycleNativeRef}
                                src={cycleMp4Url}
                                autoPlay
                                loop
                                muted
                                playsInline
                                disablePictureInPicture
                                controlsList="nodownload nofullscreen noremoteplayback"
                                className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover"
                                style={{ transform: "translate(-50%, -50%)" }}
                            />
                        )
                    )}
                </div>
            )}

            {/* Vidéo principale (masquée si option C active ou YouTube disabled) */}
            <div
                className="ambient-video-layer fixed inset-0 -z-10 overflow-hidden pointer-events-none"
                style={{
                    filter: grayscale,
                    transition:
                        exploreCycleWanted && opts.enableVideoCycle ? "filter 0.5s" : "filter 0.5s, opacity 0.5s",
                    opacity: showBlackBg
                        ? 0
                        : effectiveOverride
                          ? 0.3
                          : exploreCycleWanted
                            ? exploreLayerOpacities.main
                            : 1,
                }}
            >
                {mainRenderType === "youtube" ? (
                    // Wrapper porteur de l'opacité : l'API YT remplace le div `containerRef`
                    // par son iframe, donc React ne peut plus en modifier le style ensuite.
                    <div
                        className="absolute inset-0"
                        style={{
                            opacity: mainYT.hasStartedPlaying ? 1 : 0,
                            transition: "opacity 0.4s",
                        }}
                    >
                        <div
                            ref={mainYT.containerRef}
                            className="absolute top-1/2 left-1/2 w-[1920px] h-[1080px] origin-center"
                            style={{ transform: playerTransform }}
                        />
                    </div>
                ) : (
                    mainMp4Url && (
                        <video
                            ref={mainNativeRef}
                            src={mainMp4Url}
                            autoPlay
                            loop
                            muted={muted}
                            playsInline
                            preload="auto"
                            disablePictureInPicture
                            controlsList="nodownload nofullscreen noremoteplayback"
                            className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover"
                            style={{ transform: "translate(-50%, -50%)" }}
                        />
                    )
                )}
            </div>

            {/* Musique de fond planète / partenaire (override effectif) — prend le pas sur la vidéo d'accueil */}
            {effectiveOverride && (
                <div className="ambient-video-layer fixed inset-0 -z-10 overflow-hidden pointer-events-none" style={{ transition: "opacity 0.5s", opacity: showBlackBg ? 0 : 1 }}>
                    {effectiveOverride.type === "youtube" && overrideYTId && (
                        <div
                            className="absolute inset-0"
                            style={{
                                opacity: overrideYT.hasStartedPlaying ? 1 : 0,
                                transition: "opacity 0.4s",
                            }}
                        >
                            <div
                                ref={overrideYT.containerRef}
                                className="absolute top-1/2 left-1/2 w-[1920px] h-[1080px] origin-center"
                                style={{ transform: playerTransform }}
                            />
                        </div>
                    )}
                    {effectiveOverride.type === "file" && effectiveOverride.fileUrl && (
                        <video
                            ref={overrideNativeRef}
                            src={effectiveOverride.fileUrl}
                            autoPlay
                            loop
                            muted={muted}
                            playsInline
                            disablePictureInPicture
                            controlsList="nodownload nofullscreen noremoteplayback"
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
                        title={t("videoAdmin.overlayTitle")}
                    >
                        {t("videoAdmin.overlayButton")}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => opts.set("enableTextShadow", !opts.enableTextShadow)} 
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${opts.enableTextShadow ? "bg-purple-500 border-purple-500 text-white" : "border-white/20 bg-black/60 backdrop-blur-sm text-white/90 hover:bg-white/10"}`}
                        title={t("videoAdmin.textShadowTitle")}
                    >
                        {t("videoAdmin.textShadowButton")}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => opts.set("useBlackBackground", !opts.useBlackBackground)} 
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${opts.useBlackBackground ? "bg-purple-500 border-purple-500 text-white" : "border-white/20 bg-black/60 backdrop-blur-sm text-white/90 hover:bg-white/10"}`}
                        title={t("videoAdmin.blackBackgroundTitle")}
                    >
                        {t("videoAdmin.blackBackgroundButton")}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => opts.set("disableYouTubeIframes", !opts.disableYouTubeIframes)} 
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${opts.disableYouTubeIframes ? "bg-red-500 border-red-500 text-white" : "border-white/20 bg-black/60 backdrop-blur-sm text-white/90 hover:bg-white/10"}`}
                        title={t("videoAdmin.disableYouTubeTitle")}
                    >
                        {t("videoAdmin.disableYouTubeButton")}
                    </button>
                    <button
                        type="button"
                        onClick={() => opts.set("backgroundMusicMode", "site")}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${opts.backgroundMusicMode === "site" ? "bg-amber-500 border-amber-500 text-white" : "border-white/20 bg-black/60 backdrop-blur-sm text-white/90 hover:bg-white/10"}`}
                        title={t("videoAdmin.musicModeSiteTitle")}
                    >
                        {t("videoAdmin.musicModeSiteButton")}
                    </button>
                    <button
                        type="button"
                        onClick={() => opts.set("backgroundMusicMode", "context")}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${opts.backgroundMusicMode === "context" ? "bg-teal-600 border-teal-500 text-white" : "border-white/20 bg-black/60 backdrop-blur-sm text-white/90 hover:bg-white/10"}`}
                        title={t("videoAdmin.musicModeContextTitle")}
                    >
                        {t("videoAdmin.musicModeContextButton")}
                    </button>
                </div>
                )}

                {/* Contrôle son — desktop uniquement (mobile : icône dans la Navbar) */}
                <button
                    type="button"
                    onClick={handleMute}
                    className="hidden xl:flex px-4 py-2 rounded-lg border border-white/20 bg-black/60 backdrop-blur-sm text-white/90 hover:bg-white/10 transition text-sm items-center gap-2"
                >
                    {muted ? t("video.enableSound") : t("video.soundEnabled")}
                </button>
            </div>
        </>
    );
}
