import type { SVGProps } from "react";

type FlagProps = SVGProps<SVGSVGElement>;

/** Drapeau France — tricolore (SVG, pas d’emoji : rendu identique sur Windows). */
export function LocaleFlagFr({ className, ...props }: FlagProps) {
  return (
    <svg viewBox="0 0 3 2" className={className} aria-hidden={true} {...props}>
      <rect width="1" height="2" fill="#0055A4" />
      <rect x="1" width="1" height="2" fill="#fff" />
      <rect x="2" width="1" height="2" fill="#EF4135" />
    </svg>
  );
}

/** Drapeau R.-U. — version compacte pour la langue anglaise. */
export function LocaleFlagGb({ className, ...props }: FlagProps) {
  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden={true} {...props}>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 60,30M60,0 0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 60,30M60,0 0,30" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0v30M0,15h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0v30M0,15h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

/** Drapeau Espagne — bandes simplifiées (sans blason). */
export function LocaleFlagEs({ className, ...props }: FlagProps) {
  return (
    <svg viewBox="0 0 3 2" className={className} aria-hidden={true} {...props}>
      <rect width="3" height="0.5" fill="#AA151B" />
      <rect y="0.5" width="3" height="1" fill="#F1BF00" />
      <rect y="1.5" width="3" height="0.5" fill="#AA151B" />
    </svg>
  );
}
