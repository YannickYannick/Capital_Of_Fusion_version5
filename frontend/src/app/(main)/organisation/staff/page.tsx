"use client";

import { useEffect, useState } from "react";
import { getStaffMembers, getPoles } from "@/lib/api";
import type { StaffMemberApi, PoleApi } from "@/types/organization";
import { StaffCard } from "@/components/features/organisation/StaffCard";
import { motion } from "framer-motion";

/**
 * Page Organisation / Staff — liste des membres du staff (UX proche de /artistes).
 * Filtre par pôle (Tous + liste des pôles). Données : User STAFF/ADMIN via API organization/staff.
 */
export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMemberApi[]>([]);
  const [poles, setPoles] = useState<PoleApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    getPoles()
      .then(setPoles)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const poleSlug = filter === "all" ? undefined : filter;
    getStaffMembers(poleSlug)
      .then(setStaff)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading && staff.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-24 px-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-6xl font-black tracking-tighter mb-4 italic">
              NOTRE <span className="text-purple-500">STAFF</span>
            </h1>
            <p className="text-xl text-white/60 max-w-xl font-light leading-relaxed">
              Les personnes qui font vivre Capital of Fusion au quotidien. Filtrez par pôle pour découvrir les équipes.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-wrap gap-2 p-1 bg-white/[0.03] border border-white/10 rounded-2xl"
          >
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                filter === "all"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "text-white/40 hover:text-white"
              }`}
            >
              Tous
            </button>
            {poles.map((pole) => (
              <button
                key={pole.id}
                onClick={() => setFilter(pole.slug)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${
                  filter === pole.slug
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {pole.name}
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
            {staff.map((member, idx) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <StaffCard member={member} />
              </motion.div>
            ))}
          </div>
        )}

        {!loading && staff.length === 0 && !error && (
          <div className="text-center py-32 text-white/10 border-2 border-dashed border-white/5 rounded-[3rem]">
            <p className="text-3xl font-black tracking-widest uppercase italic">Aucun membre</p>
            <p className="text-xs mt-4 tracking-[0.3em] font-light">
              Aucun membre du staff ne correspond à ce filtre. Les comptes staff sont gérés dans l’admin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
