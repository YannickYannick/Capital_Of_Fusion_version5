"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { YouTubeVideoBackground } from "@/components/shared/YouTubeVideoBackground";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const YOUTUBE_VIDEO_ID =
    process.env.NEXT_PUBLIC_YOUTUBE_VIDEO_ID || "jfKfPfyJRdk";
// La vidéo qu'on trouvera sur la page Explore
const EXPLORE_VIDEO_CYCLE = "yaGM4tF42Jk";

export default function LandingPageClient() {
    const router = useRouter();
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleStartPushed = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setIsTransitioning(true);
        // Délai pour laisser le temps au framer-motion fade-in (1.5s)
        setTimeout(() => {
            router.push("/explore");
        }, 1500);
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 py-16 relative">
            <YouTubeVideoBackground videoId={YOUTUBE_VIDEO_ID} />

            <div
                className="absolute inset-0 bg-gradient-to-b from-[#0a0e27] via-[#0a0e27]/60 to-transparent pointer-events-none"
                aria-hidden
            />

            <section className="relative z-10 max-w-3xl mx-auto text-center">
                <p className="text-sm uppercase tracking-widest text-purple-300/90 mb-4">
                    Nouvelle Version Immersive
                </p>
                <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-white via-purple-100 to-purple-200 bg-clip-text text-transparent">
                    Capital of Fusion
                </h1>
                <p className="mt-6 text-lg sm:text-xl text-white/85 leading-relaxed">
                    Découvrez l&apos;univers de la Bachata comme jamais.
                    <br />
                    Une expérience interactive en 3D au cœur de la danse.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="/explore"
                        onClick={handleStartPushed}
                        className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition cursor-pointer relative overflow-hidden group"
                    >
                        <span className="relative z-10">Commencer l&apos;Expérience</span>
                        {isTransitioning && (
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1.5, ease: "linear" }}
                                className="absolute inset-0 bg-purple-400/30 z-0"
                            />
                        )}
                    </a>
                    <Link
                        href="/cours"
                        className="px-6 py-3 rounded-lg border border-white/30 hover:bg-white/10 text-white font-medium transition"
                    >
                        Voir les Cours
                    </Link>
                </div>

                <p className="mt-8 text-sm text-white/50">
                    Paris, France • École Nationale de Danse
                </p>
            </section>

            {/* Transition: Faire apparaitre la vidéo d'explore en fondu quand on clique */}
            <AnimatePresence>
                {isTransitioning && (
                    <motion.div
                        key="video-transition"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="fixed inset-0 z-50 pointer-events-none"
                    >
                        <div className="absolute inset-0 bg-black/30 z-10" />
                        <YouTubeVideoBackground videoId={EXPLORE_VIDEO_CYCLE} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
