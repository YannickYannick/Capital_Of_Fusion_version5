"use client";

import { useEffect, useState } from "react";
import { getPoles } from "@/lib/api";
import type { PoleApi } from "@/types/organization";
import { motion } from "framer-motion";

/**
 * Page Organisation / Pôles — liste des pôles avec le nombre de membres (staff/admin).
 * Les comptes sont rattachés aux pôles dans l’admin Django (Utilisateurs > Pôle).
 */
export default function PolesPage() {
  const [poles, setPoles] = useState<PoleApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPoles()
      .then(setPoles)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  if (loading && poles.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-40 pb-24 px-6 sm:px-8 md:px-12 lg:px-16">
      <div className="max-w-4xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl sm:text-6xl font-black tracking-tighter mb-5 italic">
            NOS <span className="text-purple-500">PÔLES</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/60 max-w-xl font-light leading-relaxed">
            Les équipes qui font vivre Capital of Fusion. Le nombre de membres est mis à jour automatiquement.
          </p>
        </motion.header>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] text-red-500 text-center">
            <p className="text-2xl font-black mb-2 uppercase italic tracking-tighter">Erreur de connexion</p>
            <p className="text-sm font-light opacity-60">{error}</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {poles.map((pole, idx) => (
              <motion.li
                key={pole.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="flex items-center justify-between gap-6 py-5 px-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors"
              >
                <span className="text-lg font-semibold text-white">{pole.name}</span>
                <span className="text-sm text-white/50 tabular-nums">
                  {pole.members_count} membre{pole.members_count !== 1 ? "s" : ""}
                </span>
              </motion.li>
            ))}
          </ul>
        )}

        {!loading && poles.length === 0 && !error && (
          <div className="text-center py-32 text-white/10 border-2 border-dashed border-white/5 rounded-[3rem]">
            <p className="text-3xl font-black tracking-widest uppercase italic">Aucun pôle</p>
            <p className="text-xs mt-4 tracking-[0.3em] font-light">Les pôles sont configurés dans l’admin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
