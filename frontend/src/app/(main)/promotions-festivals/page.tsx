"use client";

/**
 * Promotions festivals — festivals des partenaires (type FESTIVAL uniquement).
 * Réutilise le modèle des événements partenaires, filtre type=FESTIVAL.
 */
import { useState, useEffect } from "react";
import Link from "next/link";
import { getPartnerEvents } from "@/lib/api";
import type { PartnerEventApi } from "@/types/partner";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function PromotionsFestivalsPage() {
  const [events, setEvents] = useState<PartnerEventApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcoming, setUpcoming] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPartnerEvents({
      type: "FESTIVAL",
      upcoming,
    })
      .then(setEvents)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [upcoming]);

  return (
    <div className="min-h-screen pt-64 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Link
            href="/partenaires"
            className="text-white/40 hover:text-white text-sm uppercase tracking-widest font-bold mb-6 inline-block transition-colors"
          >
            ← Nos partenaires
          </Link>
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-3">Promotions</p>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
            Promotions <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">festivals</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Festivals de nos structures partenaires — à venir et en cours.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center items-center gap-6 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md max-w-xl mx-auto mb-12">
          <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
            <input
              type="checkbox"
              checked={upcoming}
              onChange={(e) => setUpcoming(e.target.checked)}
              className="rounded border-white/30 bg-white/10 text-amber-500 focus:ring-amber-500"
            />
            À venir uniquement
          </label>
        </div>

        {error && <p className="mt-4 text-red-400" role="alert">{error}</p>}

        {loading ? (
          <p className="mt-8 text-white/60">Chargement…</p>
        ) : events.length === 0 ? (
          <p className="mt-8 text-white/60">Aucun festival partenaire en promotion pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500 delay-200">
            {events.map((ev) => (
              <Link
                key={ev.id}
                href={`/partenaires/evenements/${ev.slug}`}
                className="flex flex-col h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/50 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)] transition-all duration-300 hover:-translate-y-1 block"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Festival
                  </span>
                  <span className="text-xs font-semibold text-white/50 bg-black/30 px-2 py-1 rounded-md text-right">
                    {formatDate(ev.start_date)}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors w-11/12">{ev.name}</h2>

                {(ev.location_name || ev.node_name) && (
                  <p className="mt-auto pt-4 flex items-center gap-2 text-sm text-white/50 border-t border-white/5">
                    <span>📍</span> {[ev.location_name, ev.node_name].filter(Boolean).join(" · ")}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
