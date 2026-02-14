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
