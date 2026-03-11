/**
 * Types pour les cours (API GET /api/courses/ et /api/courses/<slug>/).
 */

/** Horaire d'un cours */
export interface ScheduleApi {
  id: string;
  day_of_week: number;
  day_display: string;
  start_time: string;
  end_time: string;
  start_time_str: string;
  end_time_str: string;
  location_name: string;
}

/** Enseignant simplifié */
export interface TeacherApi {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  display_name: string;
  profile_image: string | null;
}

/** Cours complet avec schedules et teachers */
export interface CourseApi {
  id: string;
  name: string;
  slug: string;
  description: string;
  style: string;
  style_name: string;
  style_slug: string;
  level: string;
  level_name: string;
  level_slug: string;
  level_color: string;
  node: string;
  node_name: string;
  node_slug: string;
  is_active: boolean;
  image: string | null;
  schedules: ScheduleApi[];
  teachers: TeacherApi[];
  created_at: string;
  updated_at: string;
}

/** Cours allégé pour les listes */
export interface CourseListApi {
  id: string;
  name: string;
  slug: string;
  description: string;
  style: string;
  style_name: string;
  style_slug: string;
  level: string;
  level_name: string;
  level_slug: string;
  level_color: string;
  node: string;
  node_name: string;
  is_active: boolean;
  image: string | null;
  teachers_count: number;
  schedules_count: number;
  next_schedule: {
    day: string;
    time: string;
    location: string;
  } | null;
}

/** Horaire de planning (avec infos cours) */
export interface SchedulePlanningApi {
  id: string;
  course_id: string;
  course_name: string;
  course_slug: string;
  style_name: string;
  style_slug: string;
  level_name: string;
  level_slug: string;
  level_color: string;
  node_name: string;
  day_of_week: number;
  day_display: string;
  start_time: string;
  end_time: string;
  location_name: string;
}

/**
 * Types pour les leçons de théorie (API GET /api/courses/theory/).
 */
export interface TheoryLessonApi {
  id: string;
  title: string;
  slug: string;
  category: "rythme" | "technique" | "histoire" | "culture";
  category_display: string;
  level: string | null;
  level_name: string | null;
  content: string;
  video_url: string;
  duration_minutes: number;
  is_active: boolean;
}
