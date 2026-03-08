import Link from "next/link";

/**
 * Page Organisation — liens vers Structure (organigramme) et Nœuds (annuaire).
 */
export default function OrganisationPage() {
  return (
    <div className="min-h-screen pt-64 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Organisation
          </h1>
          <p className="text-white/60 max-w-xl mx-auto mb-12">
            Découvrez la hiérarchie et les différents pôles de Capital of Fusion.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            href="/organisation/structure"
            className="group p-8 rounded-2xl bg-gradient-to-br from-violet-600/20 to-purple-700/10 border border-violet-500/30 hover:border-violet-500/50 hover:-translate-y-0.5 transition-all"
          >
            <h2 className="text-xl font-bold text-white group-hover:text-purple-300 mb-2">Structure</h2>
            <p className="text-white/60 text-sm">Organigramme des nœuds CoF.</p>
          </Link>
          <Link
            href="/organisation/noeuds"
            className="group p-8 rounded-2xl bg-gradient-to-br from-fuchsia-600/20 to-pink-700/10 border border-fuchsia-500/30 hover:border-fuchsia-500/50 hover:-translate-y-0.5 transition-all"
          >
            <h2 className="text-xl font-bold text-white group-hover:text-fuchsia-300 mb-2">Nœuds</h2>
            <p className="text-white/60 text-sm">Annuaire des pôles avec cours et événements.</p>
          </Link>
          <Link
            href="/organisation/staff"
            className="group p-8 rounded-2xl bg-gradient-to-br from-violet-600/20 to-purple-700/10 border border-violet-500/30 hover:border-violet-500/50 hover:-translate-y-0.5 transition-all"
          >
            <h2 className="text-xl font-bold text-white group-hover:text-purple-300 mb-2">Notre Staff</h2>
            <p className="text-white/60 text-sm">Les membres de l’équipe Capital of Fusion.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
