"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getEvents } from "@/lib/api";
import type { EventApi } from "@/types/event";

const TYPE_OPTIONS = [
  { value: "", label: "Tous les types" },
  { value: "FESTIVAL", label: "Festival" },
  { value: "PARTY", label: "Soirée" },
  { value: "WORKSHOP", label: "Atelier" },
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Page Événements — liste avec filtres (type, à venir).
 * Données : GET /api/events/
 */
export default function EvenementsPage() {
  const [events, setEvents] = useState<EventApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState("");
  const [upcoming, setUpcoming] = useState(true);

  useEffect(() => {
    setLoading(true);
    getEvents({
      type: type || undefined,
      upcoming: upcoming,
    })
      .then(setEvents)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [type, upcoming]);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-3">Agenda</p>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
            Nos{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Événements
            </span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Festivals, soirées et stages intensifs. Ne manquez aucun rendez-vous de la communauté Bachata.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center items-center gap-6 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md max-w-2xl mx-auto mb-12">
          <label className="flex flex-col gap-2 text-sm text-white/80 font-medium flex-1 min-w-[200px]">
            Type
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
            <input
              type="checkbox"
              checked={upcoming}
              onChange={(e) => setUpcoming(e.target.checked)}
              className="rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-500"
            />
            À venir uniquement
          </label>
        </div>

        {error && (
          <p className="mt-4 text-red-400" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-8 text-white/60">Chargement…</p>
        ) : events.length === 0 ? (
          <p className="mt-8 text-white/60">
            Aucun événement pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500 delay-200">
            {events.map((ev) => (
              <div key={ev.id} className="group h-full">
                <Link
                  href={`/evenements/${ev.slug}`}
                  className="flex flex-col h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/50 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)] transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {ev.type}
                    </span>
                    <span className="text-xs font-semibold text-white/50 bg-black/30 px-2 py-1 rounded-md text-right">
                      {formatDate(ev.start_date)}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">{ev.name}</h2>

                  {ev.location_name && (
                    <p className="mt-auto pt-4 flex items-center gap-2 text-sm text-white/50 border-t border-white/5">
                      <span>📍</span> {ev.location_name}
                    </p>
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
