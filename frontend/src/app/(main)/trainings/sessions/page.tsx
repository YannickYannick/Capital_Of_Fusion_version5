import Link from "next/link";
import { getTrainingSessions } from "@/lib/api";
import type { TrainingSessionApi } from "@/types/trainings";

export const revalidate = 60;

export default async function SessionsPage() {
  const sessions = await getTrainingSessions({ upcoming: true }).catch(() => [] as TrainingSessionApi[]);

  // Grouper par date
  const sessionsByDate = sessions.reduce((acc, session) => {
    const dateKey = new Date(session.date).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(session);
    return acc;
  }, {} as Record<string, TrainingSessionApi[]>);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-white/50 mb-8 animate-in fade-in duration-500">
          <Link href="/trainings" className="hover:text-white transition">Trainings</Link>
          <span>/</span>
          <span className="text-white">Sessions</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Trainings Libres
          </p>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Sessions{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              à venir
            </span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Inscrivez-vous aux prochaines sessions d'entraînement.
          </p>
        </div>

        {/* Liste des sessions par date */}
        {sessions.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-4xl mb-4">📅</p>
            <p className="text-white/60">Aucune session programmée pour le moment.</p>
            <Link
              href="/trainings"
              className="inline-block mt-4 px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-medium transition"
            >
              Retour aux trainings
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(sessionsByDate).map(([date, dateSessions], dateIndex) => (
              <div key={date} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${dateIndex * 100}ms` }}>
                <h2 className="text-lg font-bold text-white/80 mb-4 capitalize flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  {date}
                </h2>
                <div className="space-y-3">
                  {dateSessions.map((session) => {
                    const time = new Date(session.date).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const isFull = session.spots_left === 0;

                    return (
                      <div
                        key={session.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border transition ${
                          isFull
                            ? "bg-white/5 border-white/5 opacity-60"
                            : "bg-white/5 border-white/10 hover:border-purple-500/30"
                        }`}
                      >
                        <div className="flex items-center gap-4 mb-3 sm:mb-0">
                          <div className="text-center min-w-[60px]">
                            <p className="text-2xl font-bold text-white">{time}</p>
                            <p className="text-white/40 text-xs">{session.duration_minutes} min</p>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{session.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-white/50 text-sm mt-1">
                              <span>👤 {session.instructor_display}</span>
                              {session.location && <span>📍 {session.location}</span>}
                              {session.level_name && (
                                <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs">
                                  {session.level_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className={`text-sm ${isFull ? "text-red-400" : "text-white/50"}`}>
                            {isFull ? "Complet" : `${session.spots_left}/${session.capacity} places`}
                          </span>
                          <button
                            disabled={isFull}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                              isFull
                                ? "bg-white/5 text-white/30 cursor-not-allowed"
                                : "bg-purple-500 hover:bg-purple-400 text-white"
                            }`}
                          >
                            {isFull ? "Liste d'attente" : "S'inscrire"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
