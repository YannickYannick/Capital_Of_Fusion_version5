import { YouTubeVideoBackground } from "@/components/shared/YouTubeVideoBackground";
import Link from "next/link";

const YOUTUBE_VIDEO_ID =
  process.env.NEXT_PUBLIC_YOUTUBE_VIDEO_ID || "jfKfPfyJRdk";

export const metadata = {
  title: "Accueil",
  description:
    "Capital of Fusion — École nationale de danse. Bachata, salsa, kizomba. Découvrez nos cours, événements et l'expérience Explore 3D.",
};

/**
 * Landing — page d'accueil immersive.
 */
export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 py-16 relative">
      <YouTubeVideoBackground videoId={YOUTUBE_VIDEO_ID} />

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
            className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition"
          >
            Commencer l&apos;Expérience
          </Link>
          <Link
            href="/cours"
            className="px-6 py-3 rounded-lg border border-white/30 hover:bg-white/10 text-white font-medium transition"
          >
            Voir les Cours
          </Link>
        </div>

        <p className="mt-8 text-sm text-white/50">
          Paris, France • École Nationale de Danse
        </p>
      </section>
    </div>
  );
}
