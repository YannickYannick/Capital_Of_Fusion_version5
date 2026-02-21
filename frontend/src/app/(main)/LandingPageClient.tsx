"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePlanetsOptions } from "@/contexts/PlanetsOptionsContext";

export default function LandingPageClient() {
    const router = useRouter();
    const opts = usePlanetsOptions();
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleStartPushed = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setIsTransitioning(true);
        // Déclenche le cycle fondu dans la GlobalVideoBackground (gérée dans layout.tsx)
        opts.set("isTransitioningToExplore", true);

        // Délai pour laisser le temps au fondu vidéo paramétré dans GlobalVideoBackground (1.5s)
        setTimeout(() => {
            router.push("/explore");
        }, 1500);
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 py-16 relative">
            {/* Le fond vidéo principal est maintenant géré globalement dans layout.tsx (GlobalVideoBackground) */}

            {/* Le voile dégradé de la page d'accueil - peut être toggle par l'overlay global si on le souhaite, 
                mais on le garde local à la homepage pour l'instant sauf si opts le masque */}
            {opts.showVideoOverlay && (
                <div
                    className="absolute inset-0 bg-gradient-to-b from-[#0a0e27] via-[#0a0e27]/60 to-transparent pointer-events-none"
                    aria-hidden
                />
            )}

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

        </div>
    );
}
