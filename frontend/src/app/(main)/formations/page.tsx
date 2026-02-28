/**
 * Page principale Formations — catalogue de cours avec filtres style/niveau.
 */
import { getCourses } from "@/lib/api";
import type { CourseApi } from "@/types/course";

const LEVEL_COLORS: Record<string, string> = {
  "Débutant": "from-emerald-500/20 to-emerald-500/5 border-emerald-500/40 text-emerald-400",
  "Intermédiaire": "from-amber-500/20 to-amber-500/5 border-amber-500/40 text-amber-400",
  "Avancé": "from-red-500/20 to-red-500/5 border-red-500/40 text-red-400",
  "Professionnel": "from-purple-500/20 to-purple-500/5 border-purple-500/40 text-purple-400",
};

const STYLE_ICONS: Record<string, string> = {
  "Bachata Sensual": "💃",
  "Bachata Moderna": "🎶",
  "Bachata Dominicana": "🌴",
  "Urban Kiz": "🏙️",
};

function CourseCard({ course }: { course: CourseApi }) {
  const levelColor = LEVEL_COLORS[course.level_name] ?? "from-white/10 to-white/5 border-white/20 text-white/70";
  const icon = STYLE_ICONS[course.style_name] ?? "🎵";

  return (
    <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-white/25 hover:bg-white/8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40">
      {/* Image placeholder */}
      <div className="relative h-44 bg-gradient-to-br from-pink-900/40 via-purple-900/30 to-indigo-900/40 flex items-center justify-center overflow-hidden">
        <span className="text-6xl opacity-60 group-hover:scale-110 transition-transform duration-500">{icon}</span>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {/* Badge niveau */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${levelColor} border backdrop-blur-sm`}>
          {course.level_name}
        </div>
      </div>

      <div className="p-5">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-1 font-medium">{course.style_name}</p>
        <h3 className="text-white font-bold text-lg leading-tight mb-2 group-hover:text-pink-300 transition-colors">{course.name}</h3>
        <p className="text-white/60 text-sm leading-relaxed line-clamp-2 mb-4">{course.description}</p>

        <button className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600/80 to-purple-600/80 hover:from-pink-500 hover:to-purple-500 text-white text-sm font-semibold transition-all duration-200 border border-white/10">
          Voir le cours →
        </button>
      </div>
    </div>
  );
}

export default async function FormationsPage() {
  let courses: CourseApi[] = [];
  try {
    courses = await getCourses();
  } catch {
    // Backend non disponible en prod statique — affiche une grille vide
  }

  const styles = [...new Set(courses.map((c) => c.style_name))];
  const levels = [...new Set(courses.map((c) => c.level_name))];

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-pink-400 text-sm font-semibold uppercase tracking-widest mb-3">Capital of Fusion</p>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
            Nos{" "}
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Formations
            </span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Découvrez nos cours de bachata pour tous niveaux — du débutant au professionnel.
            Chaque cours est dispensé par des enseignants passionnés.
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4 mb-12 max-w-lg mx-auto">
          {[
            { val: courses.length || "—", label: "Cours disponibles" },
            { val: styles.length || "—", label: "Styles enseignés" },
            { val: levels.length || "—", label: "Niveaux" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md">
              <p className="text-3xl font-black text-white">{s.val}</p>
              <p className="text-white/50 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Grille de cours */}
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/4 rounded-3xl border border-white/10">
            <div className="text-6xl mb-4">💃</div>
            <p className="text-white/60 text-lg">Les cours seront bientôt disponibles.</p>
            <p className="text-white/30 text-sm mt-2">Contactez-nous pour plus d&apos;informations.</p>
          </div>
        )}

        {/* CTA inscription */}
        <div className="mt-16 bg-gradient-to-br from-pink-900/30 via-purple-900/20 to-indigo-900/30 border border-white/10 rounded-3xl p-10 text-center backdrop-blur-md">
          <h2 className="text-3xl font-bold text-white mb-3">Prêt à commencer ?</h2>
          <p className="text-white/60 mb-6 max-w-md mx-auto">
            Rejoignez notre communauté et progressez à votre rythme avec nos professeurs certifiés.
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-white font-bold hover:from-pink-400 hover:to-purple-500 transition-all duration-200 shadow-lg shadow-pink-500/25">
            Nous contacter
          </button>
        </div>
      </div>
    </div>
  );
}
