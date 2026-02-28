/**
 * Page Théorie/Cours — liste des leçons connectée à l'API.
 */
import { getTheoryLessons } from "@/lib/api";
import type { TheoryLessonApi } from "@/types/course";

const CATEGORY_META: Record<string, { icon: string; color: string; bg: string }> = {
  rythme: { icon: "🎵", color: "text-cyan-400", bg: "bg-cyan-500/15 border-cyan-500/30" },
  technique: { icon: "⚡", color: "text-pink-400", bg: "bg-pink-500/15 border-pink-500/30" },
  histoire: { icon: "📜", color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30" },
  culture: { icon: "🌍", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30" },
};

const LEVEL_COLORS: Record<string, string> = {
  "Débutant": "bg-emerald-500/20 text-emerald-400",
  "Intermédiaire": "bg-amber-500/20 text-amber-400",
  "Avancé": "bg-red-500/20 text-red-400",
  "Professionnel": "bg-purple-500/20 text-purple-400",
};

function LessonCard({ lesson }: { lesson: TheoryLessonApi }) {
  const meta = CATEGORY_META[lesson.category] ?? { icon: "📝", color: "text-white/60", bg: "bg-white/10 border-white/20" };
  const levelColor = LEVEL_COLORS[lesson.level_name ?? ""] ?? "bg-white/10 text-white/50";

  return (
    <div className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:bg-white/8 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 transition-all duration-200">
      <div className="flex items-start gap-4">
        {/* Icône catégorie */}
        <div className={`shrink-0 w-12 h-12 rounded-xl ${meta.bg} border flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`${meta.color} text-xs font-semibold uppercase tracking-wider`}>
              {lesson.category_display}
            </span>
            {lesson.level_name && (
              <span className={`px-2 py-0.5 rounded text-xs ${levelColor}`}>
                {lesson.level_name}
              </span>
            )}
            <span className="text-white/25 text-xs ml-auto">{lesson.duration_minutes} min</span>
          </div>
          <h3 className="text-white font-bold leading-tight mb-2 group-hover:text-white/90">{lesson.title}</h3>
          <p className="text-white/45 text-sm leading-relaxed line-clamp-2">
            {lesson.content
              .replace(/#{1,3} /g, "")
              .replace(/\*\*/g, "")
              .replace(/\n/g, " ")
              .substring(0, 120)}...
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function TheorieCoursPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const category = params?.category;

  let lessons: TheoryLessonApi[] = [];

  try {
    lessons = await getTheoryLessons(category ? { category } : undefined);
  } catch {
    // Backend non disponible
  }

  const CATEGORIES = [
    { key: "", label: "Tous" },
    { key: "rythme", label: "🎵 Rythme" },
    { key: "technique", label: "⚡ Technique" },
    { key: "histoire", label: "📜 Histoire" },
    { key: "culture", label: "🌍 Culture" },
  ];

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-3">Savoir théorique</p>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Leçons de{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Théorie
            </span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            {lessons.length > 0
              ? `${lessons.length} leçon${lessons.length > 1 ? "s" : ""} disponible${lessons.length > 1 ? "s" : ""}`
              : "Catalogue de leçons de théorie de la danse"}
          </p>
        </div>

        {/* Filtres catégorie */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.key || (!category && cat.key === "");
            return (
              <a
                key={cat.key}
                href={cat.key ? `/theorie/cours?category=${cat.key}` : "/theorie/cours"}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                  ${isActive
                    ? "bg-white/15 border-white/30 text-white"
                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80"
                  }`}
              >
                {cat.label}
              </a>
            );
          })}
        </div>

        {/* Grille de leçons */}
        {lessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/4 rounded-3xl border border-white/10">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-white/60 text-lg">Aucune leçon disponible pour l&apos;instant.</p>
            <p className="text-white/30 text-sm mt-2">Le contenu sera ajouté progressivement.</p>
          </div>
        )}
      </div>
    </div>
  );
}
