import Link from "next/link";
import { getTranslations } from "next-intl/server";

/**
 * Page Nos partenaires — hub vers Structures, Événements et Cours partenaires.
 */
export default async function PartenairesPage() {
  const t = await getTranslations("pages");
  return (
    <div className="min-h-screen pt-64 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            {t("partnerHub.titleBefore")}{" "}
            <span className="text-amber-500">{t("partnerHub.titleHighlight")}</span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto mb-12">
            {t("partnerHub.subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            href="/partenaires/structures"
            className="group p-8 rounded-2xl bg-gradient-to-br from-amber-600/20 to-orange-700/10 border border-amber-500/30 hover:border-amber-500/50 hover:-translate-y-0.5 transition-all"
          >
            <h2 className="text-xl font-bold text-white group-hover:text-amber-300 mb-2">
              {t("partnerHub.cards.structures.title")}
            </h2>
            <p className="text-white/60 text-sm">{t("partnerHub.cards.structures.desc")}</p>
          </Link>
          <Link
            href="/partenaires/evenements"
            className="group p-8 rounded-2xl bg-gradient-to-br from-amber-600/20 to-orange-700/10 border border-amber-500/30 hover:border-amber-500/50 hover:-translate-y-0.5 transition-all"
          >
            <h2 className="text-xl font-bold text-white group-hover:text-amber-300 mb-2">
              {t("partnerHub.cards.events.title")}
            </h2>
            <p className="text-white/60 text-sm">{t("partnerHub.cards.events.desc")}</p>
          </Link>
          <Link
            href="/partenaires/cours"
            className="group p-8 rounded-2xl bg-gradient-to-br from-amber-600/20 to-orange-700/10 border border-amber-500/30 hover:border-amber-500/50 hover:-translate-y-0.5 transition-all"
          >
            <h2 className="text-xl font-bold text-white group-hover:text-amber-300 mb-2">
              {t("partnerHub.cards.courses.title")}
            </h2>
            <p className="text-white/60 text-sm">{t("partnerHub.cards.courses.desc")}</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
