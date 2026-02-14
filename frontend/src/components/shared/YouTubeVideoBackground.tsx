"use client";

/**
 * YouTubeVideoBackground
 * Fond vidéo via YouTube embed (autoplay, muet, en boucle).
 * À utiliser pour la landing et éventuellement d'autres pages.
 *
 * @param videoId — ID YouTube (ex. "dQw4w9WgXcQ" pour https://youtube.com/watch?v=dQw4w9WgXcQ)
 */
export function YouTubeVideoBackground({ videoId }: { videoId: string }) {
  if (!videoId || videoId === "VIDEO_ID") return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <iframe
        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 scale-[2.5]"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0`}
        title="Vidéo de fond"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      <div className="absolute inset-0 bg-background/60" />
    </div>
  );
}
