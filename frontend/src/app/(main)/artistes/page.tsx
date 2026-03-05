"use client";

import { useEffect, useState } from "react";
import { getArtists } from "@/lib/api";
import { ArtistCard } from "@/components/features/artists/ArtistCard";
import type { ArtistApi } from "@/types/user";
import { motion } from "framer-motion";

/**
 * Page /artistes — Hub des artistes.
 * Affiche la liste des professeurs, DJs et autres professionnels de la danse.
 */
export default function ArtistesPage() {
    const [artists, setArtists] = useState<ArtistApi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getArtists()
            .then(setArtists)
            .catch((err) => setError("Impossible de charger les artistes."))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black mb-4 tracking-tighter"
                    >
                        Nos Artistes
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/60 text-lg max-w-2xl mx-auto"
                    >
                        Découvrez les talents qui font vibrer la scène Bachata, Salsa et Kizomba.
                        Professeurs de renommée, DJs passionnés et créatifs inspirants.
                    </motion.p>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full transition"
                        >
                            Réessayer
                        </button>
                    </div>
                ) : artists.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-white/40 italic">Aucun artiste n'est disponible pour le moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {artists.map((artist, idx) => (
                            <motion.div
                                key={artist.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <ArtistCard artist={artist} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
