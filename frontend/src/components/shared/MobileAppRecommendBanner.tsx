"use client";

/**
 * Bannière soft (recommandation) : sur téléphone, propose l’app PWA festival.
 * Pas de redirection forcée — dismissible, persisté en localStorage.
 */
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getPwaUrl } from "@/lib/pwaUrl";

const STORAGE_KEY = "cof-dismiss-mobile-app-prompt";
const MOBILE_MQ = "(max-width: 768px)";

/**
 * Affiche une invitation vers app.capitaloffusion.com sur mobile uniquement.
 */
export function MobileAppRecommendBanner() {
  const t = useTranslations("mobileAppPrompt");
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      // private mode
    }
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setShow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setShow(false);
  }, []);

  if (!show) return null;

  const href = getPwaUrl();

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
      role="region"
      aria-label={t("aria")}
    >
      <div className="mx-auto flex max-w-lg items-start gap-3 rounded-xl border border-[rgba(243,172,65,0.35)] bg-[rgba(10,14,39,0.94)] px-3 py-3 shadow-[0_-8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-white">{t("title")}</p>
          <p className="mt-1 text-xs leading-snug text-white/70">{t("body")}</p>
          <a
            href={href}
            className="mt-2.5 inline-flex items-center justify-center rounded-lg bg-[var(--brand)] px-3 py-2 text-sm font-semibold text-[#0a0e27] transition hover:brightness-110"
          >
            {t("cta")}
          </a>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-md px-2 py-1 text-xs text-white/60 hover:bg-white/10 hover:text-white"
          aria-label={t("dismissA11y")}
        >
          {t("dismiss")}
        </button>
      </div>
    </div>
  );
}
