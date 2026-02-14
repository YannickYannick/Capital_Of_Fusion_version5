"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * MobileNav — menu hamburger pour mobile.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Accueil" },
    { href: "/explore", label: "Explore" },
    { href: "/cours", label: "Cours" },
    { href: "/evenements", label: "Événements" },
    { href: "/boutique", label: "Boutique" },
    { href: "/login", label: "Connexion" },
  ];

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-white/90 hover:text-white"
        aria-label="Menu"
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
        <div className="absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-md border-b border-white/10 py-4 flex flex-col gap-2">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="px-6 py-2 text-white/90 hover:text-white hover:bg-white/5"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
