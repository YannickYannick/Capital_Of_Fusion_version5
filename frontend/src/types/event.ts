/**
 * Types pour les événements (API GET /api/events/ et /api/events/<slug>/).
 */
export interface EventApi {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string;
  short_description?: string | null;
  start_date: string;
  end_date: string;
  location_name: string;
  node: string | null;
  node_name: string | null;
  image: string | null;
  /** Alias possible de l’API */
  cover_image?: string | null;
}
