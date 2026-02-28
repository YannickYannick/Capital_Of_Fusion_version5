export interface SiteConfigurationApi {
    site_name: string;
    hero_title: string;
    hero_subtitle: string;
    main_video_type: 'youtube' | 'mp4';
    main_video_youtube_id: string;
    main_video_file: string | null;
    cycle_video_type: 'youtube' | 'mp4';
    cycle_video_youtube_id: string;
    cycle_video_file: string | null;
}
