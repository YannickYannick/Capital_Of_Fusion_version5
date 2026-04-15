import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support",
  description: "FAQ et contact.",
};

export default function SupportIndexPage() {
  return (
    <div className="text-white">
      <p className="text-xs uppercase tracking-widest text-purple-300/90">
        Support
      </p>
      <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">
        Support
      </h1>
      <p className="mt-4 text-white/60">
        Trouve une réponse ou contacte-nous.
      </p>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/support/faq"
          className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
        >
          <div className="text-sm font-semibold">FAQ</div>
          <div className="mt-1 text-xs text-white/55">Questions fréquentes.</div>
        </Link>
        <Link
          href="/support/nous-contacter"
          className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
        >
          <div className="text-sm font-semibold">Nous contacter</div>
          <div className="mt-1 text-xs text-white/55">Écris-nous.</div>
        </Link>
      </div>
    </div>
  );
}

