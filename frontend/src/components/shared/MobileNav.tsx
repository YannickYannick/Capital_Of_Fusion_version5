"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * Type d'une entrée de menu pour la nav (racine ou fallback).
 * children = sous-items (affichés en dépliant ou dropdown).
 */
export interface NavLinkItem {
  href: string;
  label: string;
  children: { id: string; name: string; url: string }[];
}

/**
 * MobileNav — menu hamburger pour mobile.
 * Affiche les entrées de menu (API ou fallback) ; sous-menus dépliables.
 */
export function MobileNav({
  items,
  hasToken,
  onLogout,
}: {
  items: NavLinkItem[];
  hasToken?: boolean;
  onLogout?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2 text-white/90 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {open ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>
      {open && (
        <div id="mobile-menu" role="navigation" aria-label="Menu mobile" className="absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-md border-b border-white/10 py-4 flex flex-col gap-1 max-h-[80vh] overflow-y-auto">
          {items.map(({ href, label, children }) => (
            <div key={href + label}>
              {children.length > 0 ? (
                <>
                  <div className="flex items-center w-full px-6 text-white/90 hover:bg-white/5">
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className="flex-1 py-3 text-left hover:text-white focus:outline-none focus-visible:underline"
                    >
                      {label}
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setExpandedSlug((s) => (s === label ? null : label));
                      }}
                      className="p-3 -mr-3 text-white/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded"
                      aria-expanded={expandedSlug === label}
                      aria-controls={`mobile-submenu-${label.replace(/\s+/g, "-")}`}
                      aria-label={`Déplier le sous-menu ${label}`}
                    >
                      <span className={`text-xs transition inline-block ${expandedSlug === label ? "rotate-180" : ""}`}>
                        ▾
                      </span>
                    </button>
                  </div>
                  {expandedSlug === label && (
                    <div id={`mobile-submenu-${label.replace(/\s+/g, "-")}`} className="pl-6 pb-2 flex flex-col gap-1" role="group" aria-label={`Sous-menu ${label}`}>
                      {children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.url || "#"}
                          onClick={() => setOpen(false)}
                          className="py-1.5 text-sm text-white/80 hover:text-white focus:outline-none focus-visible:text-white focus-visible:underline"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block px-6 py-2 text-white/90 hover:text-white hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-inset"
                >
                  {label}
                </Link>
              )}
            </div>
          ))}
          {hasToken && onLogout ? (
            <button
              type="button"
              onClick={() => {
                onLogout();
                setOpen(false);
              }}
              className="w-full text-left px-6 py-2 text-white/90 hover:text-white hover:bg-white/5 border-t border-white/10 mt-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-inset"
              aria-label="Déconnexion"
            >
              Déconnexion
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block px-6 py-2 text-white/90 hover:text-white hover:bg-white/5 border-t border-white/10 mt-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-inset"
              aria-label="Connexion"
            >
              Connexion
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
