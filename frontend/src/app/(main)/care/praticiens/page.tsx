import Link from "next/link";
import { getPractitioners } from "@/lib/api";
import type { PractitionerListApi } from "@/types/care";

export const revalidate = 60;

export default async function PraticiensPage() {
  const practitioners = await getPractitioners().catch(() => [] as PractitionerListApi[]);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-white/50 mb-8 animate-in fade-in duration-500">
          <Link href="/care" className="hover:text-white transition">Care</Link>
          <span>/</span>
          <span className="text-white">Praticiens</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Espace bien-être
          </p>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Nos{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Praticiens
            </span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Des experts dédiés à votre bien-être et à votre performance de danseur.
          </p>
        </div>

        {/* Liste des praticiens */}
        {practitioners.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-4xl mb-4">💆</p>
            <p className="text-white/60">Les praticiens seront bientôt disponibles.</p>
            <Link
              href="/care"
              className="inline-block mt-4 px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-medium transition"
            >
              Retour au Care
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practitioners.map((practitioner, i) => (
              <Link
                key={practitioner.id}
                href={`/care/praticiens/${practitioner.slug}`}
                className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Photo */}
                <div className="aspect-[4/3] relative bg-black/20 overflow-hidden">
                  {practitioner.profile_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={practitioner.profile_image}
                      alt={practitioner.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl text-white/20">
                      👤
                    </div>
                  )}
                </div>

                {/* Infos */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                    {practitioner.name}
                  </h3>
                  <p className="text-purple-400 text-sm font-medium mt-1">
                    {practitioner.specialty}
                  </p>
                  {practitioner.short_bio && (
                    <p className="text-white/60 text-sm mt-3 line-clamp-2">
                      {practitioner.short_bio}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <span className="text-white/40 text-sm">
                      {practitioner.services_count} soin{practitioner.services_count > 1 ? "s" : ""}
                    </span>
                    {practitioner.booking_url && (
                      <span className="text-purple-400 text-sm font-medium">
                        Réserver →
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
