/** ID YouTube — aftermovie Vibe (site web cycle video). */
export const VIBE_AFTERMOVIE_YOUTUBE_ID = 'eZhq_RMYRKQ';

/** MP4 fallback aftermovie (même fichier que le site). */
export const VIBE_AFTERMOVIE_MP4_SRC =
  'https://www.capitaloffusion.com/aftermovie-vibe-2025-fallback.mp4';

export function youtubeEmbedUrl(videoId: string): string {
  const params = [
    'autoplay=1',
    'mute=1',
    'loop=1',
    `playlist=${videoId}`,
    'controls=0',
    'playsinline=1',
    'rel=0',
    'modestbranding=1',
    'iv_load_policy=3',
    'disablekb=1',
    'fs=0',
  ].join('&');
  return `https://www.youtube.com/embed/${videoId}?${params}`;
}

/** Hauteur hero accueil (plus immersive que l’ancien 200px). */
export const HOME_HERO_HEIGHT = 300;
