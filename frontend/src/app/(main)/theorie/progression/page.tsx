/**
 * Page Théorie/Progression — Chemin de progression visuel par niveaux.
 */

const STEPS = [
  {
    level: "Débutant",
    color: "emerald",
    icon: "🌱",
    months: "0 – 3 mois",
    skills: [
      "Pas de base : timing et ancrage",
      "Compter les 8 temps",
      "Connexion poitrine et cadre",
      "Déplacements latéraux simples",
      "Écoute musicale — trouver le temps 1",
    ],
    milestone: "Danser confortablement sur une musique lente.",
  },
  {
    level: "Intermédiaire",
    color: "amber",
    icon: "🌿",
    months: "3 – 9 mois",
    skills: [
      "Ondulations de corps",
      "Tours simples (body rolls)",
      "Demi-tour de lady",
      "Changement de direction",
      "Improvisation musicale basique",
    ],
    milestone: "Improviser 10 minutes sans répéter la même figure.",
  },
  {
    level: "Avancé",
    color: "orange",
    icon: "🌳",
    months: "9 mois – 2 ans",
    skills: [
      "Dips et caminadas",
      "Footwork rythmique",
      "Musicalité — jouer avec les breaks",
      "Connexion dynamique et créative",
      "Chorégraphie en performance",
    ],
    milestone: "Adapter son style à n'importe quel partenaire.",
  },
  {
    level: "Professionnel",
    color: "purple",
    icon: "🏆",
    months: "2 ans +",
    skills: [
      "Enseigner et transmettre",
      "Créer des chorégraphies originales",
      "Maîtrise de plusieurs styles",
      "Performing : scène et compétition",
      "Développer un style personnel unique",
    ],
    milestone: "Représenter l'école sur scène ou en compétition.",
  },
];

const COLOR_CLASSES: Record<string, { ring: string; bg: string; text: string; badge: string; line: string }> = {
  emerald: { ring: "ring-emerald-500/40", bg: "bg-emerald-500/15", text: "text-emerald-400", badge: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300", line: "bg-emerald-500/30" },
  amber: { ring: "ring-amber-500/40", bg: "bg-amber-500/15", text: "text-amber-400", badge: "bg-amber-500/20 border-amber-500/30 text-amber-300", line: "bg-amber-500/30" },
  orange: { ring: "ring-orange-500/40", bg: "bg-orange-500/15", text: "text-orange-400", badge: "bg-orange-500/20 border-orange-500/30 text-orange-300", line: "bg-orange-500/30" },
  purple: { ring: "ring-purple-500/40", bg: "bg-purple-500/15", text: "text-purple-400", badge: "bg-purple-500/20 border-purple-500/30 text-purple-300", line: "bg-purple-500/30" },
};

export default function TheorieProgressionPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-3">Votre parcours</p>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Chemin de{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Progression
            </span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            De débutant à professionnel — voici les étapes clés de votre évolution en danse.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Ligne verticale */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-white/10" />

          <div className="flex flex-col gap-8">
            {STEPS.map((step, idx) => {
              const c = COLOR_CLASSES[step.color];
              return (
                <div key={step.level} className="relative flex gap-6">
                  {/* Nœud timeline */}
                  <div className={`relative z-10 shrink-0 w-16 h-16 rounded-2xl ${c.bg} ring-2 ${c.ring} flex items-center justify-center text-2xl shadow-lg`}>
                    {step.icon}
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black/80 border border-white/20 text-xs flex items-center justify-center text-white/70 font-bold">
                      {idx + 1}
                    </span>
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:bg-white/8 transition-all">
                    <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                      <h2 className={`text-xl font-bold ${c.text}`}>{step.level}</h2>
                      <span className={`text-xs px-3 py-1 rounded-full border ${c.badge}`}>{step.months}</span>
                    </div>

                    <ul className="mt-3 space-y-1.5 mb-4">
                      {step.skills.map((skill) => (
                        <li key={skill} className="flex items-start gap-2 text-sm text-white/60">
                          <span className={`mt-1 shrink-0 w-1.5 h-1.5 rounded-full ${c.line}`} />
                          {skill}
                        </li>
                      ))}
                    </ul>

                    <div className="border-t border-white/8 pt-3">
                      <p className="text-xs text-white/40 italic">
                        🎯 <span className="text-white/60">Objectif :</span> {step.milestone}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fin de timeline */}
          <div className="relative flex items-center gap-6 mt-8">
            <div className="shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 border-2 border-pink-500/40 flex items-center justify-center text-3xl">
              🌟
            </div>
            <div className="text-white/50 text-sm italic">
              Le voyage ne s&apos;arrête jamais — chaque danse est une nouvelle découverte.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
