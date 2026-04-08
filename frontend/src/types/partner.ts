/**
 * Types pour les partenaires — API GET /api/partners/nodes/, /api/partners/events/, /api/partners/courses/.
 * Alignés sur les serializers backend (partners).
 */

import type { ProfileExternalLinks } from "./profileLinks";

/** Artiste annuaire lié à une structure partenaire (profil User). */
export interface PartnerLinkedArtistApi {
  id: number | string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
}

export interface PartnerNodeApi {
  id: string;
  name: string;
  slug: string;
  type: string;
  parent_slug?: string | null;
  description: string;
  short_description: string;
  profile_image?: string | null;
  cover_image: string | null;
  external_links?: ProfileExternalLinks;
  content: string;
  cta_text: string;
  cta_url: string;
  partner: string | null;
  /** URL absolue ou chemin — fichier audio (MP3, OGG…). */
  background_music: string | null;
  /** Si renseigné en plus du fichier, la piste YouTube est jouée en priorité. */
  background_music_youtube_url?: string;
  /** Artistes de l’annuaire associés (M2M). */
  linked_artists?: PartnerLinkedArtistApi[];
}

export interface PartnerEventApi {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string;
  external_links?: ProfileExternalLinks;
  start_date: string;
  end_date: string;
  location_name: string;
  node: string | null;
  node_name: string | null;
  node_slug?: string | null;
  partner: string | null;
  partner_name: string | null;
  profile_image?: string | null;
  cover_image?: string | null;
  image: string | null;
}

export interface PartnerScheduleApi {
  id: string;
  day_of_week: number;
  day_display: string;
  start_time: string;
  end_time: string;
  location_name: string;
  level?: string | null;
  level_name?: string | null;
}

/** Liste admin — GET /api/admin/partners/ */
export interface PartnerMinimalApi {
  id: string;
  name: string;
  slug: string;
}

/** GET/PATCH /api/admin/partners/brands/<slug>/ */
export interface PartnerBrandAdminApi {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
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
  location_name?: string;
  style: string;
  style_name: string;
  level: string;
  level_name: string;
  node: string | null;
  node_name: string | null;
  node_slug?: string | null;
  partner: string | null;
  partner_name: string | null;
  is_active: boolean;
  image: string | null;
  schedules: PartnerScheduleApi[];
  external_links?: ProfileExternalLinks;
}
