import { ExplorePresetApi } from "./explore";

/** Paramètres d’ambiance vidéo / texte (admin Django → GET /api/config/) */
export interface SiteVideoAmbienceApi {
  grayscale_video: boolean;
  show_video_overlay: boolean;
  enable_text_shadow: boolean;
  use_black_background: boolean;
  disable_youtube_iframes: boolean;
  background_music_mode: "site" | "context";
  default_youtube_quality: "medium" | "large" | "hd720" | "hd1080";
}

/** Dernière information (Identité COF → Dernières informations) */
export interface BulletinApi {
    id: string;
    title: string;
    slug: string;
    content_markdown: string;
    published_at: string | null;
    created_at: string;
}

/** Information avec champs admin (is_published) pour édition staff */
export interface BulletinAdminApi extends BulletinApi {
    is_published: boolean;
    /** Aperçu traductions (GET admin, modeltranslation) */
    title_en?: string;
    title_es?: string;
    content_markdown_en?: string;
    content_markdown_es?: string;
}

export interface SiteConfigurationApi {
    site_name: string;
    hero_title: string;
    hero_subtitle: string;
    /** Contenu markdown de la page Identité COF → Notre vision */
    vision_markdown?: string;
    /** Contenu markdown de la page Identité COF → Notre histoire */
    history_markdown?: string;
    festival_planning_navettes_markdown?: string;
    festival_acces_venue_markdown?: string;
    festival_jack_n_jill_markdown?: string;
    festival_all_star_street_battle_markdown?: string;
    support_faq_markdown?: string;
    support_contact_markdown?: string;
    main_video_type: 'youtube' | 'mp4';
    main_video_youtube_id: string;
    main_video_file: string | null;
    cycle_video_type: 'youtube' | 'mp4';
    cycle_video_youtube_id: string;
    cycle_video_file: string | null;
    explore_config?: ExplorePresetApi | null;
    /** Singleton édité dans l’admin Django (core → Ambiance vidéo & texte) */
    video_ambience?: SiteVideoAmbienceApi;
}
