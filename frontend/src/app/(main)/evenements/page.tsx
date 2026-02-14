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
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white">Événements</h1>
        <p className="mt-2 text-white/70">
          Calendrier — filtrez par type ou affichez uniquement les à venir.
        </p>

        <div className="mt-6 flex flex-wrap gap-4 items-end">
          <label className="flex flex-col gap-1 text-sm text-white/80">
            Type
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500"
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
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {events.map((ev) => (
              <li key={ev.id}>
                <Link
                  href={`/evenements/${ev.slug}`}
                  className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition"
                >
                  <span className="text-xs font-medium text-purple-300 uppercase tracking-wide">
                    {ev.type}
                  </span>
                  <h2 className="mt-1 font-semibold text-white">{ev.name}</h2>
                  <p className="mt-1 text-sm text-white/70">
                    {formatDate(ev.start_date)}
                    {ev.start_date !== ev.end_date &&
                      ` → ${formatDate(ev.end_date)}`}
                  </p>
                  {ev.location_name && (
                    <p className="mt-0.5 text-xs text-white/50">
                      {ev.location_name}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
