import Link from "next/link";
import { getSubscriptionPasses, getTrainingSessions } from "@/lib/api";
import type { SubscriptionPassApi, TrainingSessionApi } from "@/types/trainings";

export const revalidate = 60;

export default async function TrainingsPage() {
  const [passes, sessions] = await Promise.all([
    getSubscriptionPasses().catch(() => [] as SubscriptionPassApi[]),
    getTrainingSessions({ upcoming: true }).catch(() => [] as TrainingSessionApi[]),
  ]);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Capital of Fusion
          </p>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Trainings{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Libres
            </span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Sessions d'entraînement libres pour pratiquer et progresser. Choisissez votre formule d'adhésion.
          </p>
        </div>

        {/* Navigation rapide */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Link
            href="/trainings/sessions"
            className="px-6 py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 font-medium hover:bg-purple-500/30 transition"
          >
            📅 Voir les sessions
          </Link>
          <Link
            href="/trainings/adherents"
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 font-medium hover:bg-white/10 transition"
          >
            👥 Espace adhérents
          </Link>
        </div>

        {/* Pass d'abonnement */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Formules d'adhésion
          </h2>
          
          {passes.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-4xl mb-4">🎫</p>
              <p className="text-white/60">Les formules d'adhésion seront bientôt disponibles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {passes.map((pass, i) => (
                <div
                  key={pass.id}
                  className={`relative rounded-2xl overflow-hidden border transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
                    i === 1
                      ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/40 scale-105"
                      : "bg-white/5 border-white/10 hover:border-purple-500/30"
                  }`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {i === 1 && (
                    <div className="absolute top-0 left-0 right-0 py-2 bg-purple-500 text-center text-sm font-bold text-white">
                      Populaire
                    </div>
                  )}
                  
                  <div className={`p-8 ${i === 1 ? "pt-12" : ""}`}>
                    <h3 className="text-2xl font-bold text-white mb-2">{pass.name}</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-4xl font-black text-white">{pass.price}€</span>
                      <span className="text-white/50">/ {pass.duration_days} jours</span>
                    </div>
                    <p className="text-white/60 text-sm mb-6">{pass.description}</p>
                    
                    {pass.benefits.length > 0 && (
                      <ul className="space-y-2 mb-6">
                        {pass.benefits.map((benefit, j) => (
                          <li key={j} className="flex items-center gap-2 text-white/70 text-sm">
                            <span className="text-green-400">✓</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {pass.sessions_included && (
                      <p className="text-white/40 text-sm mb-6">
                        {pass.sessions_included} sessions incluses
                      </p>
                    )}
                    
                    <button className={`w-full py-3 rounded-xl font-medium transition ${
                      i === 1
                        ? "bg-purple-500 hover:bg-purple-400 text-white"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}>
                      Choisir cette formule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Prochaines sessions */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">
              Prochaines sessions
            </h2>
            <Link
              href="/trainings/sessions"
              className="text-purple-400 hover:text-purple-300 text-sm font-medium transition"
            >
              Voir tout →
            </Link>
          </div>
          
          {sessions.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-4xl mb-4">📅</p>
              <p className="text-white/60">Aucune session programmée pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.slice(0, 6).map((session, i) => (
                <SessionCard key={session.id} session={session} index={i} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SessionCard({ session, index }: { session: TrainingSessionApi; index: number }) {
  const date = new Date(session.date);
  const dateStr = date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const timeStr = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-purple-400 text-sm font-medium">{dateStr}</p>
          <p className="text-white text-lg font-bold">{timeStr}</p>
        </div>
        {session.level_name && (
          <span className="px-2 py-1 rounded-full text-xs bg-white/10 text-white/70">
            {session.level_name}
          </span>
        )}
      </div>
      
      <h3 className="text-white font-semibold mb-2">{session.title}</h3>
      
      <div className="flex items-center gap-4 text-white/50 text-sm">
        <span>👤 {session.instructor_display}</span>
        {session.location && <span>📍 {session.location}</span>}
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
        <span className="text-white/40 text-sm">
          {session.spots_left} place{session.spots_left > 1 ? "s" : ""} restante{session.spots_left > 1 ? "s" : ""}
        </span>
        <span className="text-sm">⏱ {session.duration_minutes} min</span>
      </div>
    </div>
  );
}
