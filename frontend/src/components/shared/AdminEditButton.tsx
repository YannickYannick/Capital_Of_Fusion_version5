"use client";

import { useAuth } from "@/contexts/AuthContext";
import { isStaffOrSuperuser } from "@/lib/staffAccess";
import Link from "next/link";

interface AdminEditButtonProps {
  /** URL de la page d'édition (ex: /dashboard/artistes/edit/slug) */
  editUrl?: string;
  /** URL Django Admin (ex: http://localhost:8000/admin/users/user/uuid/) */
  djangoAdminUrl?: string;
  /** Callback pour ouvrir un modal d'édition inline */
  onEdit?: () => void;
  /**
   * Position du bouton.
   * `fixed-below-nav` : fixed sous la navbar — à utiliser quand un hero plein écran suit
   * (sinon `top-right` en absolute peut être entièrement recouvert par la section suivante).
   */
  position?: "top-right" | "bottom-right" | "inline" | "fixed-below-nav";
  /** Label personnalisé */
  label?: string;
  /** Taille du bouton */
  size?: "sm" | "md";
}

/**
 * Bouton d'édition visible uniquement pour les admins et staff.
 * Permet de rediriger vers une page d'édition ou d'ouvrir un modal.
 */
export function AdminEditButton({
  editUrl,
  djangoAdminUrl,
  onEdit,
  position = "top-right",
  label = "Modifier",
  size = "sm",
}: AdminEditButtonProps) {
  const { user } = useAuth();

  if (!isStaffOrSuperuser(user)) {
    return null;
  }

  const positionClasses = {
    "top-right": "absolute top-3 right-3 z-[100]",
    "bottom-right": "absolute bottom-3 right-3 z-[100]",
    inline: "",
    "fixed-below-nav":
      "fixed top-24 right-4 z-[200] md:top-28 md:right-6",
  };

  const sizeClasses = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };

  const baseClasses = `
    ${sizeClasses[size]}
    rounded-lg font-medium
    bg-amber-500/20 text-amber-300 border border-amber-500/30
    hover:bg-amber-500/30 hover:text-amber-200
    transition-all duration-200
    flex items-center gap-1.5
    backdrop-blur-sm
  `;

  // Si on a une URL d'édition interne
  if (editUrl) {
    return (
      <Link href={editUrl} className={`${positionClasses[position]} ${baseClasses}`}>
        <span>✏️</span>
        <span>{label}</span>
      </Link>
    );
  }

  // Si on a une URL Django Admin
  if (djangoAdminUrl) {
    return (
      <a
        href={djangoAdminUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${positionClasses[position]} ${baseClasses}`}
      >
        <span>✏️</span>
        <span>{label}</span>
        <span className="text-[10px] opacity-60">↗</span>
      </a>
    );
  }

  // Si on a un callback d'édition
  if (onEdit) {
    return (
      <button
        type="button"
        onClick={onEdit}
        className={`${positionClasses[position]} ${baseClasses}`}
      >
        <span>✏️</span>
        <span>{label}</span>
      </button>
    );
  }

  return null;
}

/**
 * Barre d'outils admin flottante pour une page.
 * Affiche des actions rapides pour les admins.
 */
export function AdminToolbar({
  pageType,
  djangoAdminUrl,
  onRefresh,
}: {
  pageType: string;
  djangoAdminUrl?: string;
  onRefresh?: () => void;
}) {
  const { user } = useAuth();

  if (!isStaffOrSuperuser(user)) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 z-50 flex flex-col gap-2 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-md">
        <p className="text-amber-300 text-xs font-bold mb-2 uppercase tracking-wider">
          Mode Admin
        </p>
        <p className="text-white/50 text-[10px] mb-3">{pageType}</p>
        
        <div className="flex flex-col gap-2">
          {djangoAdminUrl && (
            <a
              href={djangoAdminUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-medium hover:bg-amber-500/30 transition flex items-center gap-2"
            >
              <span>⚙️</span>
              <span>Django Admin</span>
              <span className="text-[10px] opacity-60 ml-auto">↗</span>
            </a>
          )}
          
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-2 rounded-lg bg-white/5 text-white/70 text-xs font-medium hover:bg-white/10 transition flex items-center gap-2"
            >
              <span>🔄</span>
              <span>Rafraîchir</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
