import Link from "next/link";
import { getEvents } from "@/lib/api";
import type { EventApi } from "@/types/event";

export const revalidate = 60;

export default async function FestivalsPage() {
  const events = await getEvents({ type: "FESTIVAL", upcoming: true }).catch(() => [] as EventApi[]);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-white/50 mb-8 animate-in fade-in duration-500">
          <Link href="/evenements" className="hover:text-white transition">Événements</Link>
          <span>/</span>
          <span className="text-white">Festivals</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Événements Capital of Fusion
          </p>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            <span className="bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
              Festivals
            </span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Les festivals de bachata à ne pas manquer.
          </p>
        </div>

        {/* Liste des festivals */}
        {events.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-4xl mb-4">🎉</p>
            <p className="text-white/60">Aucun festival programmé pour le moment.</p>
            <Link
              href="/evenements"
              className="inline-block mt-4 px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-medium transition"
            >
              Voir tous les événements
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, index }: { event: EventApi; index: number }) {
  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;
  
  const dateStr = startDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Link
      href={`/evenements/${event.slug}`}
      className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-pink-500/40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image */}
      <div className="aspect-video relative bg-black/20 overflow-hidden">
        {(event.cover_image ?? event.image) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={(event.cover_image ?? event.image) ?? ""}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500/20 to-red-500/20">
            <span className="text-6xl">🎉</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Date badge */}
        <div className="absolute top-4 left-4 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-sm">
          <p className="text-white text-xs font-medium">{dateStr}</p>
          {endDate && (
            <p className="text-white/60 text-xs">
              → {endDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </p>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-pink-500/20 text-pink-300 border border-pink-500/30 mb-3">
          Festival
        </span>
        <h3 className="text-xl font-bold text-white group-hover:text-pink-400 transition-colors">
          {event.name}
        </h3>
        {event.location_name && (
          <p className="text-white/50 text-sm mt-2 flex items-center gap-2">
            <span>📍</span> {event.location_name}
          </p>
        )}
        {(event.short_description ?? event.description) && (
          <p className="text-white/60 text-sm mt-2 line-clamp-2">{event.short_description ?? event.description}</p>
        )}
      </div>
    </Link>
  );
}
