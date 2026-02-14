import { YouTubeVideoBackground } from "@/components/shared/YouTubeVideoBackground";
import Link from "next/link";

// Remplace par ton ID YouTube dans .env.local (NEXT_PUBLIC_YOUTUBE_VIDEO_ID)
// Ex: https://youtube.com/watch?v=abc123 → abc123
// Vidéo de démo par défaut. Remplace via .env.local (NEXT_PUBLIC_YOUTUBE_VIDEO_ID)
const YOUTUBE_VIDEO_ID =
  process.env.NEXT_PUBLIC_YOUTUBE_VIDEO_ID || "jfKfPfyJRdk";

/**
 * Landing — page d'accueil immersive.
 * Vidéo fond : YouTube (NEXT_PUBLIC_YOUTUBE_VIDEO_ID ou VIDEO_ID à remplacer).
 */
export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 py-16 relative">
      <YouTubeVideoBackground videoId={YOUTUBE_VIDEO_ID} />

      {/* Gradient overlay (from maquette) */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0a0e27] via-[#0a0e27]/60 to-transparent pointer-events-none"
        aria-hidden
      />

      <section className="relative z-10 max-w-3xl mx-auto text-center">
        <p className="text-sm uppercase tracking-widest text-purple-300/90 mb-4">
          Nouvelle Version Immersive
        </p>
        <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-white via-purple-100 to-purple-200 bg-clip-text text-transparent">
          Capital of Fusion
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-white/85 leading-relaxed">
          Découvrez l&apos;univers de la Bachata comme jamais.
          <br />
          Une expérience interactive en 3D au cœur de la danse.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/explore"
            className="px-8 py-4 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-semibold transition shadow-lg shadow-purple-500/25"
          >
            ▶ Commencer l&apos;Expérience
          </Link>
          <Link
            href="/cours"
            className="px-8 py-4 rounded-lg border-2 border-white/30 hover:bg-white/10 text-white font-semibold transition"
          >
            Voir les Cours →
          </Link>
        </div>

        <p className="mt-12 text-sm text-white/60">
          Paris, France • École Nationale de Danse
        </p>
      </section>
    </div>
  );
}
