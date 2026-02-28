/**
 * Page Formations/Vidéothèque — galerie de vidéos YouTube embarquées.
 */

const VIDEOS = [
  {
    id: "v001",
    title: "Introduction à la Bachata Sensual",
    description: "Bases du pas de base, connexion et ondes corporelles pour les débutants.",
    level: "Débutant",
    style: "Bachata Sensual",
    youtube_id: "Dqg0oKlXpTE",
    duration: "12:34",
  },
  {
    id: "v002",
    title: "Ondulations avancées — Corps et Fluidité",
    description: "Technique d'ondulation complète : du bassin aux épaules. Exercices progressifs.",
    level: "Intermédiaire",
    style: "Bachata Sensual",
    youtube_id: "eZhq_RMYRKQ",
    duration: "18:22",
  },
  {
    id: "v003",
    title: "Footwork Dominicain",
    description: "Les pas de base du style dominicain — Syncopations et variations rythmiques.",
    level: "Avancé",
    style: "Bachata Dominicana",
    youtube_id: "Dqg0oKlXpTE",
    duration: "22:10",
  },
];

const LEVEL_COLORS: Record<string, string> = {
  "Débutant": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Intermédiaire": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "Avancé": "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function FormationsVideotheque() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Apprendre en vidéo</p>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            La{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Vidéothèque
            </span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Des tutoriels filmés pour apprendre et réviser à votre rythme. Retrouvez les cours filmés de nos professeurs.
          </p>
        </div>

        {/* Grille vidéos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {VIDEOS.map((video) => (
            <div
              key={video.id}
              className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 transition-all duration-300"
            >
              {/* Thumbnail YouTube */}
              <div className="relative aspect-video bg-black overflow-hidden">
                <img
                  src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
                {/* Overlay play */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                {/* Durée */}
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                  {video.duration}
                </span>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${LEVEL_COLORS[video.level] ?? ""}`}>
                    {video.level}
                  </span>
                  <span className="text-white/30 text-xs">{video.style}</span>
                </div>
                <h3 className="text-white font-bold leading-tight mb-2 group-hover:text-purple-300 transition-colors">
                  {video.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">{video.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message prochainement */}
        <div className="mt-12 text-center bg-white/4 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
          <span className="text-4xl mb-3 block">🎬</span>
          <p className="text-white/60">De nombreuses vidéos seront ajoutées prochainement.</p>
          <p className="text-white/30 text-sm mt-1">Nos professeurs filment régulièrement de nouveaux tutoriels.</p>
        </div>
      </div>
    </div>
  );
}
