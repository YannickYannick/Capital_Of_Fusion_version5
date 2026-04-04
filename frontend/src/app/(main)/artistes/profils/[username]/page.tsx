"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { getArtistByUsername, getApiBaseUrl } from "@/lib/api";
import { getArtistBioForLocale } from "@/lib/artistBio";
import { AdminEditButton } from "@/components/shared/AdminEditButton";
import type { ArtistApi } from "@/types/user";
import { AnimatedDiv } from "@/components/shared/AnimatedDiv";
import Image from "next/image";
import Link from "next/link";

export default function ArtistProfilePage() {
    const locale = useLocale();
    const tp = useTranslations("artistPublic");
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
                <h1 className="text-4xl font-bold mb-4 tracking-tighter">Oups !</h1>
                <p className="text-white/60 mb-8 font-light">{error || "Cet artiste n'existe pas."}</p>
                <Link href="/artistes" className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full transition border border-white/10 uppercase tracking-widest text-[10px] font-bold">
                    Retour à l'annuaire
                </Link>
            </div>
        );
    }

    const base = getApiBaseUrl().replace(/\/$/, "");
    const resolveMedia = (raw: string | null | undefined) => {
        if (!raw) return null;
        if (raw.startsWith("//")) return `https:${raw}`;
        if (raw.startsWith("http")) return raw;
        return `${base}${raw.startsWith("/") ? "" : "/"}${raw}`;
    };
    const fallbackHero = "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop";
    const photoUrl =
        resolveMedia(artist.cover_image) ??
        resolveMedia(artist.profile_picture) ??
        fallbackHero;

    return (
        <div className="min-h-screen bg-black text-white relative -mt-16">
            {/* Annule le pt-16 du layout : évite la bande bleue (fond html) sous la navbar transparente */}
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
                    <AnimatedDiv animation="fadeInUp">
                        <div className="flex flex-wrap gap-2 mb-4 text-purple-400">
                            {artist.professions.map((prof) => (
                                <span key={prof.id} className="px-3 py-1 bg-purple-600/20 backdrop-blur-md text-[10px] uppercase tracking-widest font-black rounded-full border border-purple-500/30">
                                    {prof.name}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter mb-4">
                            {artist.first_name} <span className="text-purple-500">{artist.last_name}</span>
                        </h1>
                    </AnimatedDiv>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-8 md:px-16 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div className="lg:col-span-2">
                    <AnimatedDiv animation="fadeIn">
                        <h2 className="text-xs uppercase tracking-[0.3em] font-black mb-8 text-white/30 italic underline decoration-purple-500/50 decoration-4 underline-offset-8">{tp("biography")}</h2>
                        <div className="prose prose-invert max-w-none text-lg text-white/70 leading-relaxed font-light">
                            {getArtistBioForLocale(artist, locale) || tp("noBio")}
                        </div>
                    </AnimatedDiv>
                </div>

                <div className="space-y-8">
                    <AnimatedDiv
                        animation="fadeIn"
                        className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-3xl"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                            <h3 className="text-xs uppercase tracking-[0.3em] font-black text-white/30 italic shrink-0">
                                Details
                            </h3>
                            <AdminEditButton
                                editUrl={`/artistes/${encodeURIComponent(artist.username)}/edit`}
                                position="inline"
                                label="Modifier"
                            />
                        </div>
                        <ul className="space-y-6">
                            <li className="flex justify-between items-center py-2">
                                <span className="text-white/20 uppercase text-[10px] tracking-widest font-bold">Pseudo</span>
                                <span className="text-purple-400 font-mono">@{artist.username}</span>
                            </li>
                            {artist.dance_level && (
                                <li className="flex justify-between items-center py-2">
                                    <span className="text-white/20 uppercase text-[10px] tracking-widest font-bold">Niveau</span>
                                    <span style={{ color: artist.dance_level.color }} className="font-bold tracking-tight uppercase text-sm italic">{artist.dance_level.name}</span>
                                </li>
                            )}
                        </ul>

                        <button className="w-full mt-12 py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-purple-500 hover:text-white transition-all duration-500 shadow-2xl hover:shadow-purple-500/20">
                            Booking Info
                        </button>
                    </AnimatedDiv>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-8 md:px-16 pb-16">
                <Link href="/artistes" className="text-white/20 hover:text-white transition-all flex items-center gap-3 group text-[10px] uppercase font-black tracking-widest">
                    <span className="group-hover:-translate-x-2 transition-transform">←</span>
                    Annuaire des artistes
                </Link>
            </div>
        </div>
    );
}
