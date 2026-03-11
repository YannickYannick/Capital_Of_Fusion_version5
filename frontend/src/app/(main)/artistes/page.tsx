"use client";

import { useEffect, useState } from "react";
import { getArtists } from "@/lib/api";
import type { ArtistApi } from "@/types/user";
import ArtistCard from "@/components/features/artists/ArtistCard";
import { AnimatedDiv } from "@/components/shared/AnimatedDiv";
import { StandardPageShell, StandardPageHero } from "@/components/shared/StandardPage";

export default function ArtistesPage() {
  const [artists, setArtists] = useState<ArtistApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'staff' | 'others'>('all');

  useEffect(() => {
    setLoading(true);
    let staffOnly: boolean | undefined = undefined;
    if (filter === 'staff') staffOnly = true;
    if (filter === 'others') staffOnly = false;

    getArtists(staffOnly)
      .then(setArtists)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading && artists.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <StandardPageShell>
      <div className="text-white">
        <StandardPageHero
          eyebrow="Nos artistes"
          title="Nos"
          highlight="Artistes"
          description="Découvrez les talents qui font battre le cœur de Capital of Fusion. Membres officiels et artistes partenaires."
        />

        <AnimatedDiv
          animation="fadeInUp"
          delay={0.05}
          className="mb-14"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-3">
            Filtrer
          </p>
          <div className="flex flex-wrap gap-2 p-2 bg-white/[0.03] border border-white/10 rounded-2xl max-w-full">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'staff', label: 'Team CoF' },
              { id: 'others', label: 'Externe' }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id as 'all' | 'staff' | 'others')}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                  filter === btn.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </AnimatedDiv>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] text-red-500 text-center">
            <p className="text-2xl font-black mb-2 uppercase italic tracking-tighter">Erreur de connexion</p>
            <p className="text-sm font-light opacity-60">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {artists.map((artist, idx) => (
              <AnimatedDiv
                key={artist.id}
                animation="fadeInUp"
                delay={Math.min(idx * 0.04, 0.3)}
              >
                <ArtistCard artist={artist} priority={idx < 4} />
              </AnimatedDiv>
            ))}
          </div>
        )}

        {!loading && artists.length === 0 && !error && (
          <div className="text-center py-32 text-white/10 border-2 border-dashed border-white/5 rounded-[3rem]">
            <p className="text-3xl font-black tracking-widest uppercase italic italic">VIDE</p>
            <p className="text-xs mt-4 tracking-[0.3em] font-light">AUCUN ARTISTE NE CORRESPOND À CETTE CATÉGORIE</p>
          </div>
        )}
      </div>
    </StandardPageShell>
  );
}
