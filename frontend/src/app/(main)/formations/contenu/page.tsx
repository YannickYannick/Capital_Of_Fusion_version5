/**
 * Page Formations/Contenu — liste de ressources pédagogiques téléchargeables.
 */

const RESOURCES = [
  {
    id: "r001",
    title: "Guide du débutant en Bachata",
    description: "Tout ce qu'il faut savoir pour se lancer : vocabulaire, structure des cours, conseils pratiques.",
    type: "PDF",
    pages: 12,
    level: "Débutant",
    icon: "📄",
    color: "from-emerald-600/20 to-emerald-700/10 border-emerald-500/30",
  },
  {
    id: "r002",
    title: "Fiches rythmes — Le Clave et les 8 temps",
    description: "Fiches mémo illustrées sur le comptage, le clave et la structure musicale de la bachata.",
    type: "PDF",
    pages: 4,
    level: "Débutant",
    icon: "🎵",
    color: "from-cyan-600/20 to-cyan-700/10 border-cyan-500/30",
  },
  {
    id: "r003",
    title: "Lexique de la danse sociale",
    description: "Glossaire illustré des termes techniques : lead, follow, frame, travelling, dip, etc.",
    type: "PDF",
    pages: 8,
    level: "Tous niveaux",
    icon: "📖",
    color: "from-purple-600/20 to-purple-700/10 border-purple-500/30",
  },
  {
    id: "r004",
    title: "Programme de progression — 6 mois",
    description: "Feuille de route structurée sur 6 mois pour progresser de débutant à intermédiaire.",
    type: "PDF",
    pages: 6,
    level: "Débutant → Intermédiaire",
    icon: "📈",
    color: "from-amber-600/20 to-amber-700/10 border-amber-500/30",
  },
  {
    id: "r005",
    title: "Playlist Bachata Sensual — Top 50",
    description: "Sélection des 50 tracks incontournables pour s'immerger dans la Bachata Sensual.",
    type: "Spotify",
    pages: 0,
    level: "Tous niveaux",
    icon: "🎧",
    color: "from-green-600/20 to-green-700/10 border-green-500/30",
  },
];

const LEVEL_COLORS: Record<string, string> = {
  "Débutant": "bg-emerald-500/20 text-emerald-400",
  "Débutant → Intermédiaire": "bg-amber-500/20 text-amber-400",
  "Tous niveaux": "bg-white/10 text-white/60",
};

export default function FormationsContenuPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-3">Ressources pédagogiques</p>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Contenu{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Pédagogique
            </span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Guides, fiches mémo et playlists pour compléter votre apprentissage entre les cours.
          </p>
        </div>

        {/* Liste de ressources */}
        <div className="flex flex-col gap-4">
          {RESOURCES.map((res) => (
            <div
              key={res.id}
              className={`group bg-gradient-to-br ${res.color} border rounded-2xl px-6 py-5 backdrop-blur-md hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 transition-all duration-200`}
            >
              <div className="flex items-start gap-5">
                <div className="text-4xl shrink-0 group-hover:scale-110 transition-transform">{res.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
                    <h3 className="text-white font-bold text-base">{res.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono ${LEVEL_COLORS[res.level] ?? "bg-white/10 text-white/60"}`}>
                        {res.level}
                      </span>
                      <span className="text-white/30 text-xs">
                        {res.type}{res.pages > 0 ? ` · ${res.pages} pages` : ""}
                      </span>
                    </div>
                  </div>
                  <p className="text-white/55 text-sm leading-relaxed">{res.description}</p>
                </div>
                {/* Bouton téléchargement */}
                <button
                  className="shrink-0 px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white/60 text-sm hover:bg-white/20 hover:text-white transition-all duration-200 group-hover:border-white/30"
                  title="Bientôt disponible"
                >
                  ↓ Télécharger
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <p className="text-center text-white/25 text-sm mt-10">
          Les ressources seront disponibles au téléchargement lors du lancement officiel de la plateforme.
        </p>
      </div>
    </div>
  );
}
