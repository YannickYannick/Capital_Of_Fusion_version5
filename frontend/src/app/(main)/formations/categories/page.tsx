/**
 * Page Formations/Catégories — Grille des styles de danse.
 */
import Link from "next/link";

const STYLES = [
  {
    name: "Bachata Sensual",
    slug: "bachata-sensual",
    icon: "💃",
    description: "Style moderne et fluide, influencé par la danse contemporaine. Développé en Espagne, il met l'accent sur la connexion et les ondulations du corps.",
    origin: "Espagne",
    gradient: "from-pink-600/25 to-purple-700/15",
    border: "border-pink-500/30",
    tags: ["Fluide", "Connexion", "Ondulations"],
  },
  {
    name: "Bachata Moderna",
    slug: "bachata-moderna",
    icon: "🎶",
    description: "Fusion entre le style traditionnel et le sensuel. Répertoire de figures varié, polyvalent et accessible pour les danseurs intermédiaires.",
    origin: "International",
    gradient: "from-violet-600/25 to-indigo-700/15",
    border: "border-violet-500/30",
    tags: ["Polyvalent", "Figures", "Fusion"],
  },
  {
    name: "Bachata Dominicana",
    slug: "bachata-dominicana",
    icon: "🌴",
    description: "Le style original des Caraïbes — rythmique, festif et authentique. Footwork complexe, syncopations et improvisation libérée.",
    origin: "République Dominicaine",
    gradient: "from-amber-600/25 to-orange-700/15",
    border: "border-amber-500/30",
    tags: ["Authentique", "Footwork", "Improvisation"],
  },
  {
    name: "Urban Kiz",
    slug: "urban-kiz",
    icon: "🏙️",
    description: "Dérivé du Kizomba angolais, adapté aux clubs urbains parisiens. Posture, fluidité et connexion au service d'un style street moderne.",
    origin: "Paris, France",
    gradient: "from-cyan-600/25 to-blue-700/15",
    border: "border-cyan-500/30",
    tags: ["Urbain", "Kizomba", "Fluidité"],
  },
];

export default function FormationsCategoriesPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-pink-400 text-sm font-semibold uppercase tracking-widest mb-3">Nos styles</p>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Catégories de{" "}
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Danse
            </span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Découvrez les différents styles enseignés à Capital of Fusion. Chaque style possède ses propres caractéristiques, origines et sensations.
          </p>
        </div>

        {/* Grille de styles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STYLES.map((style) => (
            <Link
              key={style.slug}
              href={`/formations?style=${style.slug}`}
              className={`group relative bg-gradient-to-br ${style.gradient} border ${style.border} rounded-3xl p-7 backdrop-blur-md hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 transition-all duration-300`}
            >
              <div className="flex gap-5 items-start">
                <div className="text-5xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {style.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-xl font-bold text-white">{style.name}</h2>
                    <span className="text-white/30 text-xs">{style.origin}</span>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed mb-4">{style.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {style.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/60 text-xs border border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 text-white/40 text-sm group-hover:text-white/70 transition-colors">
                    Voir les cours de {style.name} →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/formations"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/8 border border-white/15 rounded-full text-white/80 hover:bg-white/12 hover:text-white transition-all duration-200 text-sm font-medium"
          >
            ← Retour à tous les cours
          </Link>
        </div>
      </div>
    </div>
  );
}
