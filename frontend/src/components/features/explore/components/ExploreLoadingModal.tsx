"use client";

import { useTranslations } from "next-intl";

interface ExploreLoadingModalProps {
  onDismiss: () => void;
}

/**
 * Modale d'aide (touches) pendant Accueil → Explore.
 * Conteneur en pointer-events-none : les clics passent au-dessous (ex. navbar z-50).
 * Le panneau central a pointer-events-auto pour lecture / focus accessibilité.
 * La modale reste visible jusqu'à ce que l'utilisateur clique sur "Compris".
 */
export function ExploreLoadingModal({ onDismiss }: ExploreLoadingModalProps) {
  const t = useTranslations("exploreTransition");

  return (
    <div
      className="fixed inset-0 z-[25] flex items-center justify-center pt-20 px-4 pointer-events-none"
      role="dialog"
      aria-modal="false"
      aria-labelledby="explore-loading-modal-title"
      aria-describedby="explore-loading-modal-desc"
    >
      <div
        className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/15 bg-black/80 backdrop-blur-xl p-6 shadow-2xl text-left"
        id="explore-loading-modal-desc"
      >
        <h2
          id="explore-loading-modal-title"
          className="text-lg font-bold text-white mb-2 tracking-tight"
        >
          {t("title")}
        </h2>
        <p className="text-sm text-purple-300/90 mb-4 animate-pulse">{t("loadingHint")}</p>
        <ul className="text-sm text-white/80 space-y-1.5 leading-relaxed">
          <li>{t("lineRotate")}</li>
          <li>{t("linePan")}</li>
          <li>{t("lineZoom")}</li>
          <li>{t("lineClick")}</li>
          <li>{t("lineDoubleClick")}</li>
        </ul>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
        >
          {t("dismissButton")}
        </button>
        <p className="mt-3 text-xs text-white/45 text-center">{t("nonBlockingHint")}</p>
      </div>
    </div>
  );
}
