import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Festival",
  description: "Accès rapide aux pages du festival.",
};

export default function FestivalIndexPage() {
  return (
    <div className="text-white">
      <p className="text-xs uppercase tracking-widest text-purple-300/90">
        Festival
      </p>
      <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">
        Festival
      </h1>
      <p className="mt-4 text-white/60">
        Accès rapide aux pages clés.
      </p>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/festival/planning-navettes"
          className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
        >
          <div className="text-sm font-semibold">Planning &amp; Navettes</div>
          <div className="mt-1 text-xs text-white/55">Horaires, navettes, infos pratiques.</div>
        </Link>
        <Link
          href="/festival/acces-venue"
          className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
        >
          <div className="text-sm font-semibold">Accès &amp; Venue</div>
          <div className="mt-1 text-xs text-white/55">Adresse, transports, venue.</div>
        </Link>
      </div>
    </div>
  );
}

