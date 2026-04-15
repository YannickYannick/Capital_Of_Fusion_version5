"use client";

/**
 * Template de page standard — layout unifié pour les pages publiques (cours, care, artistes, etc.).
 * Utilise les mêmes marges (pt-64 pb-20 px-4 md:px-8), largeur max (max-w-6xl) et hero (eyebrow + titre gradient).
 * À combiner avec la vidéo YouTube de fond (GlobalVideoBackground) pour une UX homogène.
 */
import type { ReactNode } from "react";

interface StandardPageShellProps {
  children: ReactNode;
}

/** Conteneur principal : min-h-screen, pt-64, pb-20, px-4 md:px-8, max-w-6xl mx-auto. */
export function StandardPageShell({ children }: StandardPageShellProps) {
  return (
    <div className="min-h-screen pt-64 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">{children}</div>
    </div>
  );
}

interface StandardPageHeroProps {
  /** Petit libellé d’accent (jaune CoF) en uppercase (ex. "Apprentissage", "Nos partenaires"). */
  eyebrow: string;
  /** Partie gauche du titre (ex. "Nos", "Capital"). */
  title: string;
  /** Partie en gradient chaud (ex. "Cours", "Care"). */
  highlight?: string;
  /** Paragraphe sous le titre (text-white/60). */
  description?: string;
  /** Marge basse du bloc hero (défaut mb-16). */
  bottomSpacingClassName?: string;
}

/** Hero centré : eyebrow, h1 5xl/6xl avec partie optionnelle en gradient, description. */
export function StandardPageHero({
  eyebrow,
  title,
  highlight,
  description,
  bottomSpacingClassName = "mb-16",
}: StandardPageHeroProps) {
  return (
    <div
      className={`text-center animate-in fade-in slide-in-from-bottom-4 duration-700 ${bottomSpacingClassName}`}
    >
      <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">
        {eyebrow}
      </p>
      <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
        {title}{" "}
        {highlight ? (
          <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            {highlight}
          </span>
        ) : null}
      </h1>
      {description ? (
        <p className="text-white/60 text-lg max-w-2xl mx-auto">{description}</p>
      ) : null}
    </div>
  );
}

interface StandardCardsGridProps {
  children: ReactNode;
}

/** Grille responsive 1 / 2 / 3 colonnes (sm/lg), gap-8 — pour listes type cartes. */
export function StandardCardsGrid({ children }: StandardCardsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {children}
    </div>
  );
}
