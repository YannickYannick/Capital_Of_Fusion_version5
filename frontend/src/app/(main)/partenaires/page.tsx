import Link from "next/link";

/**
 * Page Nos partenaires — hub vers Structures, Événements et Cours partenaires.
 */
export default function PartenairesPage() {
  return (
    <div className="min-h-screen pt-64 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Nos <span className="text-amber-500">partenaires</span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto mb-12">
            Structures, événements et cours proposés par nos partenaires.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            href="/partenaires/structures"
            className="group p-8 rounded-2xl bg-gradient-to-br from-amber-600/20 to-orange-700/10 border border-amber-500/30 hover:border-amber-500/50 hover:-translate-y-0.5 transition-all"
          >
            <h2 className="text-xl font-bold text-white group-hover:text-amber-300 mb-2">Structures partenaires</h2>
            <p className="text-white/60 text-sm">Annuaire des structures partenaires et leurs offres.</p>
          </Link>
          <Link
            href="/partenaires/evenements"
            className="group p-8 rounded-2xl bg-gradient-to-br from-amber-600/20 to-orange-700/10 border border-amber-500/30 hover:border-amber-500/50 hover:-translate-y-0.5 transition-all"
          >
            <h2 className="text-xl font-bold text-white group-hover:text-amber-300 mb-2">Événements des partenaires</h2>
            <p className="text-white/60 text-sm">Festivals, soirées et ateliers des partenaires.</p>
          </Link>
          <Link
            href="/partenaires/cours"
            className="group p-8 rounded-2xl bg-gradient-to-br from-amber-600/20 to-orange-700/10 border border-amber-500/30 hover:border-amber-500/50 hover:-translate-y-0.5 transition-all"
          >
            <h2 className="text-xl font-bold text-white group-hover:text-amber-300 mb-2">Cours des partenaires</h2>
            <p className="text-white/60 text-sm">Catalogue de cours proposés par les partenaires.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
