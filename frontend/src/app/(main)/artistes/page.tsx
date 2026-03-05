import Link from "next/link";
import { getArtists } from "@/lib/api";

const CATEGORIES = [
  {
    key: "annuaire",
    label: "Annuaire",
    icon: "🎭",
    description: "Découvrez tous nos professeurs, danseurs et DJs partenaires.",
    href: "/artistes/annuaire",
    gradient: "from-purple-600/30 to-fuchsia-700/20",
    border: "border-purple-500/30",
    glow: "hover:shadow-purple-500/20",
    badge: "bg-purple-500/20 text-purple-300",
  },
  {
    key: "profils",
    label: "Profils & Bios",
    icon: "👤",
    description: "Parcourez les expériences, palmarès et styles de nos artistes.",
    href: "/artistes/profils",
    gradient: "from-blue-600/30 to-indigo-700/20",
    border: "border-blue-500/30",
    glow: "hover:shadow-blue-500/20",
    badge: "bg-blue-500/20 text-blue-300",
  },
  {
    key: "booking",
    label: "Demandes de Booking",
    icon: "📅",
    description: "Invitez nos artistes pour vos propres événements et festivals.",
    href: "/artistes/booking",
    gradient: "from-emerald-600/30 to-green-700/20",
    border: "border-emerald-500/30",
    glow: "hover:shadow-emerald-500/20",
    badge: "bg-emerald-500/20 text-emerald-300",
  },
  {
    key: "avis",
    label: "Avis & Notes",
    icon: "⭐",
    description: "Lisez les retours d'expérience de nos élèves et organisateurs.",
    href: "/artistes/avis",
    gradient: "from-amber-600/30 to-orange-700/20",
    border: "border-amber-500/30",
    glow: "hover:shadow-amber-500/20",
    badge: "bg-amber-500/20 text-amber-300",
  },
];

export default async function ArtistesPage() {
  let artistsCount = 0;
  try {
    const list = await getArtists();
    artistsCount = list.length;
  } catch { }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Notre Écosystème</p>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
            Nos <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Artistes</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Retrouvez les professeurs, danseurs talentueux et ambassadeurs qui font vibrer Capital of Fusion au quotidien.
          </p>
        </div>
        <div className="flex justify-center gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-4 text-center backdrop-blur-md">
            <p className="text-3xl font-black text-white">{artistsCount || "—"}</p>
            <p className="text-white/50 text-xs mt-1">Artistes Référencés</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {CATEGORIES.map((cat) => (
            <Link key={cat.key} href={cat.href} className={`group relative bg-gradient-to-br ${cat.gradient} border ${cat.border} rounded-3xl p-8 backdrop-blur-md hover:-translate-y-1 hover:shadow-2xl ${cat.glow} transition-all duration-300`}>
              <div className="flex items-start gap-5">
                <div className="text-5xl shrink-0 group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2"><h2 className="text-2xl font-bold text-white">{cat.label}</h2></div>
                  <p className="text-white/60 text-sm leading-relaxed">{cat.description}</p>
                  <div className="mt-4 flex items-center text-white/50 text-sm group-hover:text-white/80 transition-colors">Découvrir →</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
