/**
 * Page Théorie — Hub de navigation avec 4 catégories.
 */
import Link from "next/link";
import { getTheoryLessons } from "@/lib/api";

const CATEGORIES = [
  {
    key: "rythme",
    label: "Rythme & Musique",
    icon: "🎵",
    description: "Comprendre le clave, compter les temps, entendre la structure musicale de la bachata.",
    gradient: "from-cyan-600/30 to-blue-700/20",
    border: "border-cyan-500/30",
    glow: "hover:shadow-cyan-500/20",
    badge: "bg-cyan-500/20 text-cyan-300",
  },
  {
    key: "technique",
    label: "Technique",
    icon: "⚡",
    description: "Connexion, ondulations, posture, lead & follow — les fondamentaux du mouvement.",
    gradient: "from-pink-600/30 to-rose-700/20",
    border: "border-pink-500/30",
    glow: "hover:shadow-pink-500/20",
    badge: "bg-pink-500/20 text-pink-300",
  },
  {
    key: "histoire",
    label: "Histoire",
    icon: "📜",
    description: "Les origines dominicaines, les pionniers et l'évolution mondiale de la bachata.",
    gradient: "from-amber-600/30 to-orange-700/20",
    border: "border-amber-500/30",
    glow: "hover:shadow-amber-500/20",
    badge: "bg-amber-500/20 text-amber-300",
  },
  {
    key: "culture",
    label: "Culture",
    icon: "🌍",
    description: "Étiquette des soirées, communauté internationale et valeurs de la danse sociale.",
    gradient: "from-emerald-600/30 to-green-700/20",
    border: "border-emerald-500/30",
    glow: "hover:shadow-emerald-500/20",
    badge: "bg-emerald-500/20 text-emerald-300",
  },
];

export default async function TheoriePage() {
  let lessons: Awaited<ReturnType<typeof getTheoryLessons>> = [];
  let counts: Record<string, number> = {};

  try {
    lessons = await getTheoryLessons();
    counts = lessons.reduce((acc, l) => {
      acc[l.category] = (acc[l.category] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  } catch {
    // Backend non disponible
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Apprendre & Comprendre</p>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
            Théorie de la{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Danse
            </span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Rythme, technique, histoire et culture — tout ce qu&apos;il faut savoir pour danser avec intelligence et sensibilité.
          </p>
        </div>

        {/* Stats globales */}
        <div className="flex justify-center gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-4 text-center backdrop-blur-md">
            <p className="text-3xl font-black text-white">{lessons.length || "—"}</p>
            <p className="text-white/50 text-xs mt-1">Leçons disponibles</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-4 text-center backdrop-blur-md">
            <p className="text-3xl font-black text-white">{Object.keys(counts).length || 4}</p>
            <p className="text-white/50 text-xs mt-1">Catégories</p>
          </div>
        </div>

        {/* Grille des 4 catégories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              href={`/theorie/cours?category=${cat.key}`}
              className={`group relative bg-gradient-to-br ${cat.gradient} border ${cat.border} rounded-3xl p-8 backdrop-blur-md hover:-translate-y-1 hover:shadow-2xl ${cat.glow} transition-all duration-300`}
            >
              <div className="flex items-start gap-5">
                <div className="text-5xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {cat.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{cat.label}</h2>
                    {counts[cat.key] && (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cat.badge}`}>
                        {counts[cat.key]} leçon{counts[cat.key] > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">{cat.description}</p>
                  <div className="mt-4 flex items-center text-white/50 text-sm group-hover:text-white/80 transition-colors">
                    Explorer →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Navigation rapide vers sous-sections */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: "/theorie/cours", icon: "📖", label: "Toutes les leçons", desc: "Parcourir le catalogue complet" },
            { href: "/theorie/progression", icon: "📈", label: "Ma progression", desc: "Visualiser mon parcours" },
            { href: "/theorie/quiz", icon: "🧠", label: "Quiz interactif", desc: "Tester mes connaissances" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/10 hover:border-white/20 transition-all duration-200 group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{item.icon}</span>
              <div>
                <p className="text-white font-semibold text-sm">{item.label}</p>
                <p className="text-white/40 text-xs mt-0.5">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
