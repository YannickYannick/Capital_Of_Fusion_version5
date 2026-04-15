import Link from "next/link";
import { getCourseSchedules } from "@/lib/api";
import type { SchedulePlanningApi } from "@/types/course";

export const revalidate = 60;

const DAYS = [
  { value: 0, label: "Lundi" },
  { value: 1, label: "Mardi" },
  { value: 2, label: "Mercredi" },
  { value: 3, label: "Jeudi" },
  { value: 4, label: "Vendredi" },
  { value: 5, label: "Samedi" },
  { value: 6, label: "Dimanche" },
];

export default async function PlanningPage() {
  const schedules = await getCourseSchedules().catch(() => [] as SchedulePlanningApi[]);

  // Grouper par jour
  const schedulesByDay = DAYS.map((day) => ({
    ...day,
    schedules: schedules
      .filter((s) => s.day_of_week === day.value)
      .sort((a, b) => a.start_time.localeCompare(b.start_time)),
  }));

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-white/50 mb-8 animate-in fade-in duration-500">
          <Link href="/cours" className="hover:text-white transition">Cours</Link>
          <span>/</span>
          <span className="text-white">Planning</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Cours Capital of Fusion
          </p>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Planning{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Hebdomadaire
            </span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Tous les cours de la semaine organisés par jour.
          </p>
        </div>

        {/* Planning par jour */}
        {schedules.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-4xl mb-4">📅</p>
            <p className="text-white/60">Aucun horaire de cours programmé.</p>
            <Link
              href="/cours"
              className="inline-block mt-4 px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-medium transition"
            >
              Voir tous les cours
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {schedulesByDay.map((day, i) => (
              <div
                key={day.value}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={`p-4 rounded-xl border ${
                  day.schedules.length > 0
                    ? "bg-white/5 border-white/10"
                    : "bg-white/[0.02] border-white/5"
                }`}>
                  <h3 className="text-sm font-bold text-white/80 mb-3 text-center">
                    {day.label}
                  </h3>
                  
                  {day.schedules.length === 0 ? (
                    <p className="text-white/30 text-xs text-center py-4">
                      Aucun cours
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {day.schedules.map((schedule) => (
                        <Link
                          key={schedule.id}
                          href={`/cours/${schedule.course_slug}`}
                          className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 transition group"
                        >
                          <p className="text-purple-400 text-xs font-medium">
                            {schedule.start_time} - {schedule.end_time}
                          </p>
                          <p className="text-white text-sm font-semibold mt-1 group-hover:text-purple-400 transition line-clamp-2">
                            {schedule.course_name}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                              style={{
                                backgroundColor: `${schedule.level_color}20`,
                                color: schedule.level_color || "#f3ac41",
                              }}
                            >
                              {schedule.level_name}
                            </span>
                          </div>
                          {schedule.location_name && (
                            <p className="text-white/40 text-xs mt-2 truncate">
                              📍 {schedule.location_name}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
