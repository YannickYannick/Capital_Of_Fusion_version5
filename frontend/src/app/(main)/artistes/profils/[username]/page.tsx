"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getArtistByUsername } from "@/lib/api";
import type { ArtistApi } from "@/types/user";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

/**
 * Page de profil individuel d'un artiste.
 * URL: /artistes/profils/[username]
 */
export default function ArtistProfilePage() {
    const { username } = useParams();
    const [artist, setArtist] = useState<ArtistApi | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (username) {
            getArtistByUsername(username as string)
                .then(setArtist)
                .catch(() => setError("Artiste introuvable"))
                .finally(() => setLoading(false));
        }
    }, [username]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !artist) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
                <h1 className="text-4xl font-bold mb-4">Oups !</h1>
                <p className="text-white/60 mb-8">{error || "Cet artiste n'existe pas."}</p>
                <Link href="/artistes" className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full transition border border-white/10">
                    Retour à l'annuaire
                </Link>
            </div>
        );
    }

    const photoUrl = artist.profile_picture || "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop";

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section Profil */}
            <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
                <Image
                    src={photoUrl}
                    alt={`${artist.first_name} ${artist.last_name}`}
                    fill
                    className="object-cover"
                    priority
                    unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex flex-wrap gap-2 mb-4">
                            {artist.professions.map((prof) => (
                                <span key={prof.id} className="px-3 py-1 bg-purple-600/80 backdrop-blur-sm text-[10px] uppercase tracking-widest font-bold rounded-full">
                                    {prof.name}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-4">
                            {artist.first_name} {artist.last_name}
                        </h1>
                    </motion.div>
                </div>
            </section>

            {/* Content Section */}
            <section className="max-w-7xl mx-auto px-8 md:px-16 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
                {/* Bio & Details */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl font-bold mb-6 text-purple-400">À propos</h2>
                        <div className="prose prose-invert max-w-none text-lg text-white/70 leading-relaxed font-light">
                            {artist.bio || "Aucune biographie disponible pour cet artiste."}
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar / Stats */}
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md"
                    >
                        <h3 className="text-xl font-bold mb-6">Informations</h3>
                        <ul className="space-y-4">
                            <li className="flex justify-between items-center py-3 border-b border-white/5">
                                <span className="text-white/40">Nom</span>
                                <span>{artist.first_name} {artist.last_name}</span>
                            </li>
                            <li className="flex justify-between items-center py-3 border-b border-white/5">
                                <span className="text-white/40">Username</span>
                                <span className="text-purple-400">@{artist.username}</span>
                            </li>
                            {artist.dance_level && (
                                <li className="flex justify-between items-center py-3 border-b border-white/5">
                                    <span className="text-white/40">Expérience</span>
                                    <span style={{ color: artist.dance_level.color }}>{artist.dance_level.name}</span>
                                </li>
                            )}
                        </ul>

                        <button className="w-full mt-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-purple-500 hover:text-white transition-colors duration-300">
                            Contacter l'artiste
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Navigation Footer */}
            <div className="max-w-7xl mx-auto px-8 md:px-16 pb-16">
                <Link href="/artistes" className="text-white/40 hover:text-white transition flex items-center gap-2 group">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Retour à l'annuaire des artistes
                </Link>
            </div>
        </div>
    );
}
