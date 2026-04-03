/**
 * Types pour les noeuds d'organisation (Explore 3D).
 * API GET /api/organization/nodes/ et /api/organization/nodes/<slug>/
 */
export interface NodeEventApi {
  id: string;
  title: string;
  description: string;
  start_datetime: string;
  end_datetime: string | null;
  location: string;
  is_featured: boolean;
  external_url: string;
}

export interface OrganizationNodeApi {
  id: string;
  name: string;
  slug: string;
  type: string;
  /** Slug du noeud parent (null pour la racine). Utilisé pour l’organigramme. */
  parent_slug?: string | null;
  description?: string;
  short_description: string;
  cta_text?: string;
  cta_url?: string;
  video_url?: string;
  cover_image: string | null;
  content?: string;
  visual_source: string;
  planet_type: string;
  model_3d: string;
  planet_texture: string;
  planet_color: string;
  orbit_radius: number | null;
  orbit_speed: number | null;
  planet_scale: number | null;
  rotation_speed: number | null;
  orbit_phase: number | null;
  orbit_position_y: number;
  orbit_shape: string;
  orbit_roundness: number | null;
  entry_start_x: number | null;
  entry_start_y: number | null;
  entry_start_z: number | null;
  entry_speed: number | null;
  is_visible_3d: boolean;
  node_events: NodeEventApi[];
  /** Musique de fond (overlay) — configurable en admin uniquement */
  music_type?: "" | "youtube" | "file";
  music_youtube_url?: string;
  music_file?: string | null;
}

/**
 * Pôle d'appartenance (staff/admin). API GET /api/organization/poles/
 */
export interface PoleApi {
  id: string;
  name: string;
  slug: string;
  order: number;
  members_count: number;
}

/**
 * Membre du staff (Organisation). API GET /api/organization/staff/
 */
export interface StaffMemberApi {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
  staff_role: string;
  staff_role_display: string;
  pole: { id: string; name: string; slug: string } | null;
  bio: string;
}
