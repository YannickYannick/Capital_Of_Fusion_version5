import Link from "next/link";
import { getCourses } from "@/lib/api";
import type { CourseListApi } from "@/types/course";

export const revalidate = 60;

export default async function ProgrammesPage() {
  const courses = await getCourses().catch(() => [] as CourseListApi[]);

  // Grouper par niveau
  const coursesByLevel = courses.reduce((acc, course) => {
    const level = course.level_name;
    if (!acc[level]) {
      acc[level] = {
        name: level,
        slug: course.level_slug,
        color: course.level_color,
        courses: [],
      };
    }
    acc[level].courses.push(course);
    return acc;
  }, {} as Record<string, { name: string; slug: string; color: string; courses: CourseListApi[] }>);

  const levels = Object.values(coursesByLevel);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-white/50 mb-8 animate-in fade-in duration-500">
          <Link href="/cours" className="hover:text-white transition">Cours</Link>
          <span>/</span>
          <span className="text-white">Programmes</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Cours Capital of Fusion
          </p>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Programmes{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              par niveau
            </span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Progressez étape par étape avec nos programmes adaptés à chaque niveau.
          </p>
        </div>

        {/* Programmes par niveau */}
        {courses.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-4xl mb-4">🎓</p>
            <p className="text-white/60">Aucun programme disponible pour le moment.</p>
            <Link
              href="/cours"
              className="inline-block mt-4 px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-medium transition"
            >
              Voir tous les cours
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {levels.map((level, levelIndex) => (
              <section
                key={level.slug}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${levelIndex * 100}ms` }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: level.color || "#f3ac41" }}
                  />
                  <h2 className="text-2xl font-bold text-white">
                    {level.name}
                  </h2>
                  <span className="text-white/40 text-sm">
                    {level.courses.length} cours
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {level.courses.map((course, i) => (
                    <Link
                      key={course.id}
                      href={`/cours/${course.slug}`}
                      className="group p-5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all duration-300"
                      style={{
                        borderLeftColor: level.color || "#f3ac41",
                        borderLeftWidth: "3px",
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-white/40 text-xs uppercase tracking-wider">
                          {course.style_name}
                        </span>
                        {course.teachers_count > 0 && (
                          <span className="text-white/40 text-xs">
                            👤 {course.teachers_count} prof{course.teachers_count > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors mb-2">
                        {course.name}
                      </h3>

                      {course.description && (
                        <p className="text-white/50 text-sm line-clamp-2 mb-3">
                          {course.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <span className="text-white/40 text-xs">
                          {course.node_name}
                        </span>
                        {course.next_schedule ? (
                          <span className="text-purple-400 text-xs">
                            Prochain: {course.next_schedule.day} {course.next_schedule.time}
                          </span>
                        ) : (
                          <span className="text-white/30 text-xs">
                            {course.schedules_count} créneaux
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* CTA vers inscription */}
        <div className="mt-16 text-center p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <h3 className="text-2xl font-bold text-white mb-4">
            Prêt à commencer ?
          </h3>
          <p className="text-white/60 mb-6 max-w-md mx-auto">
            Inscrivez-vous à nos cours et commencez votre parcours dans l'univers de la bachata.
          </p>
          <Link
            href="/cours/inscription"
            className="inline-block px-8 py-4 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold transition"
          >
            S'inscrire aux cours
          </Link>
        </div>
      </div>
    </div>
  );
}
