import { ExplorePresetApi } from "./explore";

/** Bulletin d'information (Identité COF → Bulletins) */
export interface BulletinApi {
    id: string;
    title: string;
    slug: string;
    content_markdown: string;
    published_at: string | null;
    created_at: string;
}

/** Bulletin avec champs admin (is_published) pour édition staff */
export interface BulletinAdminApi extends BulletinApi {
    is_published: boolean;
}

export interface SiteConfigurationApi {
    site_name: string;
    hero_title: string;
    hero_subtitle: string;
    /** Contenu markdown de la page Identité COF → Notre vision */
    vision_markdown?: string;
    main_video_type: 'youtube' | 'mp4';
    main_video_youtube_id: string;
    main_video_file: string | null;
    cycle_video_type: 'youtube' | 'mp4';
    cycle_video_youtube_id: string;
    cycle_video_file: string | null;
    explore_config?: ExplorePresetApi | null;
}
