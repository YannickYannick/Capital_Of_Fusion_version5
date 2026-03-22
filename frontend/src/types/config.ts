import { ExplorePresetApi } from "./explore";

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
    main_video_type: 'youtube' | 'mp4';
    main_video_youtube_id: string;
    main_video_file: string | null;
    cycle_video_type: 'youtube' | 'mp4';
    cycle_video_youtube_id: string;
    cycle_video_file: string | null;
    explore_config?: ExplorePresetApi | null;
}
