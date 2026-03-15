"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const BAR_DURATION_MS = 500;

/**
 * Bande de chargement horizontale en haut de la page.
 * S'affiche dès le clic sur un lien interne (pas d'attente du pathname) puis à chaque changement de route (ex. retour arrière).
 */
export function TopLoadingBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const isFirst = useRef(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showBar = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setVisible(true);
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      hideTimerRef.current = null;
    }, BAR_DURATION_MS);
  }, []);

  // Dès le clic sur un lien interne (menu, etc.) → afficher la barre tout de suite
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest("a[href]");
      if (!a) return;
      const href = (a as HTMLAnchorElement).getAttribute("href") ?? "";
      if (href.startsWith("/") && !href.startsWith("//")) {
        showBar();
      }
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [showBar]);

  // Changement de route sans clic (ex. bouton retour) → afficher la barre
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    showBar();
  }, [pathname, showBar]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[100] h-0.5 bg-violet-500 shadow-lg shadow-violet-500/40 animate-[progress-full_0.5s_ease-out_forwards]"
      role="progressbar"
      aria-hidden
    />
  );
}
