"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdherentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/trainings/adherents");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 md:px-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          <p className="text-white/40 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-white/50 mb-8 animate-in fade-in duration-500">
          <Link href="/trainings" className="hover:text-white transition">Trainings</Link>
          <span>/</span>
          <span className="text-white">Espace adhérent</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Espace personnel
          </p>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Bonjour,{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {user.first_name || user.username}
            </span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Gérez vos inscriptions et suivez votre activité.
          </p>
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mon abonnement */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🎫</span> Mon abonnement
            </h2>
            <div className="text-center py-8">
              <p className="text-white/50 mb-4">Aucun abonnement actif</p>
              <Link
                href="/trainings"
                className="inline-block px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-medium transition"
              >
                Découvrir les formules
              </Link>
            </div>
          </div>

          {/* Mes inscriptions */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📅</span> Mes inscriptions
            </h2>
            <div className="text-center py-8">
              <p className="text-white/50 mb-4">Aucune inscription à venir</p>
              <Link
                href="/trainings/sessions"
                className="inline-block px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition"
              >
                Voir les sessions
              </Link>
            </div>
          </div>

          {/* Historique */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 md:col-span-2">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span> Historique
            </h2>
            <div className="text-center py-8">
              <p className="text-white/50">
                Votre historique de sessions apparaîtra ici.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
