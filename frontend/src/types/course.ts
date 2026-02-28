/**
 * Types pour les cours (API GET /api/courses/ et /api/courses/<slug>/).
 */
export interface CourseApi {
  id: string;
  name: string;
  slug: string;
  description: string;
  style: string;
  style_name: string;
  level: string;
  level_name: string;
  node: string;
  node_name: string;
  is_active: boolean;
  image: string | null;
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
