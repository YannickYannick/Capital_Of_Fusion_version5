/**
 * Types pour les partenaires — API GET /api/partners/nodes/, /api/partners/events/, /api/partners/courses/.
 * Alignés sur les serializers backend (partners).
 */

export interface PartnerNodeApi {
  id: string;
  name: string;
  slug: string;
  type: string;
  parent_slug?: string | null;
  description: string;
  short_description: string;
  cover_image: string | null;
  content: string;
  cta_text: string;
  cta_url: string;
  partner: string | null;
}

export interface PartnerEventApi {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string;
  start_date: string;
  end_date: string;
  location_name: string;
  node: string | null;
  node_name: string | null;
  partner: string | null;
  partner_name: string | null;
  image: string | null;
}

export interface PartnerScheduleApi {
  id: string;
  day_of_week: number;
  day_display: string;
  start_time: string;
  end_time: string;
  location_name: string;
}

/** Liste admin — GET /api/admin/partners/ */
export interface PartnerMinimalApi {
  id: string;
  name: string;
  slug: string;
}

/** GET /api/admin/partners/course-meta/ */
export interface PartnerCourseMetaApi {
  styles: { id: string; name: string; slug: string }[];
  levels: { id: string; name: string; slug: string }[];
}

export interface PartnerCourseApi {
  id: string;
  name: string;
  slug: string;
  description: string;
  style: string;
  style_name: string;
  level: string;
  level_name: string;
  node: string | null;
  node_name: string | null;
  partner: string | null;
  partner_name: string | null;
  is_active: boolean;
  image: string | null;
  schedules: PartnerScheduleApi[];
}
