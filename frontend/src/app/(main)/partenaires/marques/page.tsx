"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getAdminPartners } from "@/lib/api";
import type { PartnerMinimalApi } from "@/types/partner";
import { useAuth } from "@/contexts/AuthContext";
import { isStaffOrSuperuser } from "@/lib/staffAccess";

export default function PartenairesMarquesPage() {
  const t = useTranslations("pages.partnerBrands");
  const { user } = useAuth();
  const [brands, setBrands] = useState<PartnerMinimalApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isStaff = isStaffOrSuperuser(user);

  const load = useCallback(() => {
    if (!isStaff) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getAdminPartners()
      .then(setBrands)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [isStaff]);

  useEffect(() => {
    load();
  }, [load]);

  if (!user) {
    return (
      <div className="min-h-screen pt-64 pb-20 px-4 text-white/80">
        <p>Connexion requise.</p>
        <Link href="/login" className="text-amber-400 hover:underline">
          Se connecter
        </Link>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="min-h-screen pt-64 pb-20 px-4 text-white/80">
        <p>Droits insuffisants.</p>
        <Link href="/partenaires" className="text-amber-400 hover:underline">
          ← Nos partenaires
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-64 pb-20 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/partenaires" className="text-white/40 hover:text-white text-sm uppercase tracking-widest font-bold mb-6 inline-block">
          {t("backToPartners")}
        </Link>
        <h1 className="text-3xl font-black text-white mb-2">{t("title")}</h1>
        <p className="text-white/60 text-sm mb-10">{t("subtitle")}</p>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {loading ? (
          <p className="text-white/60">{t("loading")}</p>
        ) : brands.length === 0 ? (
          <p className="text-white/60">{t("empty")}</p>
        ) : (
          <ul className="space-y-2 border border-white/10 rounded-xl overflow-hidden divide-y divide-white/10">
            {brands.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-4 px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06]">
                <span className="text-white font-medium">{b.name}</span>
                <span className="text-white/40 text-xs font-mono hidden sm:inline">{b.slug}</span>
                <Link
                  href={`/partenaires/marques/${encodeURIComponent(b.slug)}/edit`}
                  className="shrink-0 text-xs font-bold text-amber-300 hover:text-amber-200 px-3 py-1.5 rounded-lg border border-amber-500/40"
                >
                  {t("edit")}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
