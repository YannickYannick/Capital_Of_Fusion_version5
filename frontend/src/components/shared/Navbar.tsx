"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MobileNav } from "./MobileNav";
import { getMenuItems, getStoredToken, logout } from "@/lib/api";
import type { MenuItemApi } from "@/types/menu";

/**
 * Navbar — transparente en haut, bg-black/80 backdrop-blur au scroll.
 * Menu piloté par l'API GET /api/menu/items/ (admin Django).
 * Fallback liens statiques si l'API est indisponible.
 */
export function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItemApi[] | null>(null);
  const [menuError, setMenuError] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(!!getStoredToken());
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    getMenuItems()
      .then(setMenuItems)
      .catch(() => setMenuError(true));
  }, []);

  const links = menuError || !menuItems?.length
    ? [
      { href: "/", label: "Accueil", children: [] as MenuItemApi[] },
      {
        href: "/cours", label: "Cours", children: [
          { id: "c1", name: "Liste & Planning", url: "/cours/planning/" },
          { id: "c2", name: "Filtres (Ville, Niveau)", url: "/cours/filtres/" },
          { id: "c3", name: "Détails des programmes", url: "/cours/programmes/" },
          { id: "c4", name: "Inscription", url: "/cours/inscription/" },
        ] as MenuItemApi[]
      },
      {
        href: "/formations", label: "Formations", children: [
          { id: "f1", name: "Contenu éducatif en ligne", url: "/formations/contenu/" },
          { id: "f2", name: "Catégories", url: "/formations/categories/" },
          { id: "f3", name: "Vidéothèque", url: "/formations/videotheque/" },
        ] as MenuItemApi[]
      },
      {
        href: "/trainings", label: "Trainings", children: [
          { id: "t1", name: "Sessions libres", url: "/trainings/sessions/" },
          { id: "t2", name: "Organisation adhérents", url: "/trainings/adherents/" },
        ] as MenuItemApi[]
      },
      {
        href: "/artistes", label: "Artistes", children: [
          { id: "a1", name: "Annuaire", url: "/artistes/annuaire/" },
          { id: "a2", name: "Profils & Bios", url: "/artistes/profils/" },
          { id: "a3", name: "Booking", url: "/artistes/booking/" },
          { id: "a4", name: "Avis & Notes", url: "/artistes/avis/" },
        ] as MenuItemApi[]
      },
      {
        href: "/theorie", label: "Théorie", children: [
          { id: "th1", name: "Cours théoriques", url: "/theorie/cours/" },
          { id: "th2", name: "Quiz de connaissances", url: "/theorie/quiz/" },
          { id: "th3", name: "Suivi de progression", url: "/theorie/progression/" },
        ] as MenuItemApi[]
      },
      {
        href: "/care", label: "Care", children: [
          { id: "ca1", name: "Soins & Récupération", url: "/care/soins/" },
          { id: "ca2", name: "Nos Praticiens", url: "/care/praticiens/" },
          { id: "ca3", name: "Réservation", url: "/care/reservation/" },
        ] as MenuItemApi[]
      },
      {
        href: "/shop", label: "Shop", children: [
          { id: "s1", name: "Pulls & Sweats", url: "/shop/pulls/" },
          { id: "s2", name: "T-shirts", url: "/shop/tshirts/" },
          { id: "s3", name: "Chaussures", url: "/shop/chaussures/" },
          { id: "s4", name: "Vins & Spiritueux", url: "/shop/vins/" },
        ] as MenuItemApi[]
      },
      {
        href: "/projets", label: "Projets", children: [
          { id: "p1", name: "Programme d'incubation", url: "/projets/incubation/" },
          { id: "p2", name: "Autres initiatives", url: "/projets/initiatives/" },
        ] as MenuItemApi[]
      },
      {
        href: "/organisation", label: "Organisation", children: [
          { id: "o1", name: "Structure", url: "/organisation/structure/" },
          { id: "o2", name: "Pôles", url: "/organisation/poles/" },
        ] as MenuItemApi[]
      },
      {
        href: "http://localhost:8000/admin/", label: "DB", children: [
          { id: "db1", name: "Accès au schéma de la base de données", url: "http://localhost:8000/admin/" },
        ] as MenuItemApi[]
      },
    ]
    : menuItems.map((item) => ({
      href: item.url || "/",
      label: item.name,
      children: item.children ?? [],
    }));

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-black/80 backdrop-blur-md border-b border-white/10"
        : "bg-transparent"
        }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between" aria-label="Navigation principale">
        <Link
          href="/"
          className="text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent hover:opacity-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded"
        >
          [CF] Capital of Fusion
        </Link>

        <div className="hidden xl:flex items-center gap-4 lg:gap-6 flex-1 justify-end overflow-x-auto no-scrollbar pl-4">
          {links.map(({ href, label, children }) =>
            children.length > 0 ? (
              <div key={href + label} className="relative group" role="group" aria-haspopup="true" aria-label={label}>
                <Link href={href} className="text-white/90 hover:text-white text-sm font-medium transition py-2 block focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded px-1">
                  {label}
                </Link>
                <div className="absolute top-full left-0 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-black/95 backdrop-blur-md border border-white/10 rounded-lg py-2 min-w-[180px] shadow-xl">
                    {children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.url || "#"}
                        className="block px-4 py-2 text-sm text-white/90 hover:text-white hover:bg-white/5 focus:outline-none focus-visible:bg-white/10 focus-visible:text-white rounded"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={href + label}
                href={href}
                className="text-white/90 hover:text-white text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded px-1"
              >
                {label}
              </Link>
            )
          )}
          {hasToken ? (
            <button
              type="button"
              onClick={async () => {
                await logout();
                setHasToken(false);
                router.refresh();
              }}
              className="p-2 text-white/90 hover:text-white transition text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded"
              aria-label="Déconnexion"
            >
              Déconnexion
            </button>
          ) : (
            <Link
              href="/login"
              className="p-2 text-white/90 hover:text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded inline-block"
              aria-label="Connexion"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </Link>
          )}
        </div>

        <div className="xl:hidden">
          <MobileNav
            items={links}
            hasToken={hasToken}
            onLogout={async () => {
              await logout();
              setHasToken(false);
              router.refresh();
            }}
          />
        </div>
      </nav>
    </header>
  );
}
