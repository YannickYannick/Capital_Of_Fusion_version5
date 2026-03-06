"use client";

import { useEffect, useState } from "react";
import { getArtists } from "@/lib/api";
import type { ArtistApi } from "@/types/user";
import ArtistCard from "@/components/features/artists/ArtistCard";
import { motion } from "framer-motion";

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-24 px-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-6xl font-black tracking-tighter mb-4 italic">NOS <span className="text-purple-500">ARTISTES</span></h1>
            <p className="text-xl text-white/60 max-w-xl font-light leading-relaxed">
              Découvrez les talents qui font battre le cœur de Capital of Fusion.
              Membres officiels et artistes partenaires.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex p-1 bg-white/[0.03] border border-white/10 rounded-2xl"
          >
            {[
              { id: 'all', label: 'Tous' },
              { id: 'staff', label: 'Team CoF' },
              { id: 'others', label: 'Externe' }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id as any)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${filter === btn.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'text-white/40 hover:text-white'
                  }`}
              >
                {btn.label}
              </button>
            ))}
          </motion.div>
        </div>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] text-red-500 text-center">
            <p className="text-2xl font-black mb-2 uppercase italic tracking-tighter">Erreur de connexion</p>
            <p className="text-sm font-light opacity-60">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {artists.map((artist, idx) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <ArtistCard artist={artist} />
              </motion.div>
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
    </div>
  );
}
