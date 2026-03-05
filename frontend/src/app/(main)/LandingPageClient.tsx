"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSiteConfig } from "@/lib/api";
import type { SiteConfigurationApi } from "@/types/config";

/**
 * LandingPageClient — Version restaurée et améliorée.
 * Interface premium avec Hero immersif, CTA Explore 3D et navigation rapide.
 */
export default function LandingPageClient() {
    const [config, setConfig] = useState<SiteConfigurationApi | null>(null);

    useEffect(() => {
        getSiteConfig().then(setConfig).catch(() => null);
    }, []);

    const heroTitle = config?.hero_title || "Capital of Fusion";
    const heroSubtitle = config?.hero_subtitle || "L'école nationale de danse. Explorez la Bachata, la Salsa et la Kizomba dans une expérience 3D unique.";

    return (
        <div className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center text-white px-4">
            {/* Hero Section Content */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center max-w-4xl z-10"
            >
                <motion.h1
                    className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    {heroTitle}
                </motion.h1>

                <motion.p
                    className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                >
                    {heroSubtitle}
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    <Link
                        href="/explore"
                        className="group relative px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
                    >
                        <span className="relative z-10">Lancer l'Expérience 3D</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                    </Link>

                    <Link
                        href="/cours"
                        className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white font-bold rounded-full transition-all hover:scale-105 active:scale-95"
                    >
                        Voir les Cours
                    </Link>
                </motion.div>
            </motion.div>

            {/* Floating Elements / Decorative */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
            </div>

            {/* Bottom Hint */}
            <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 flex flex-col items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
            >
                <span className="text-[10px] uppercase tracking-widest font-medium">Scroll pour en découvrir plus</span>
                <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
            </motion.div>
        </div>
    );
}
