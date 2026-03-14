"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MobileNav } from "./MobileNav";
import { getMenuItems } from "@/lib/api";
import type { MenuItemApi } from "@/types/menu";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Navbar — transparente en haut, bg-black/80 backdrop-blur au scroll.
 * Menu piloté par l'API GET /api/menu/items/ (admin Django).
 * Fallback liens statiques si l'API est indisponible.
 */
export function Navbar() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItemApi[] | null>(null);
  const [menuError, setMenuError] = useState(false);

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

  // Entrée "Identité COF" toujours en premier (affichée même si l'API ne la renvoie pas encore)
  const identiteCofEntry = {
    href: "/identite-cof",
    label: "Identité COF",
    children: [
      { id: "id-vision", name: "Notre vision", url: "/identite-cof/notre-vision", slug: "identite-vision", icon: "", order: 1, is_active: true, children: [] },
      { id: "id-histoire", name: "Notre histoire", url: "/identite-cof/notre-histoire", slug: "identite-histoire", icon: "", order: 2, is_active: true, children: [] },
      { id: "id-bulletins", name: "Dernières informations", url: "/identite-cof/bulletins", slug: "identite-bulletins", icon: "", order: 3, is_active: true, children: [] },
    ] as MenuItemApi[],
  };

  // "En cours" — sous-menu Cours, Événements, Shop, Trainings (plus en entrées racine)
  const enCoursEntry = {
    href: "/contact",
    label: "En cours",
    children: [
      { id: "en-cours-cours", name: "Cours", url: "/cours", slug: "", icon: "", order: 0, is_active: true, children: [] },
      { id: "en-cours-evenements", name: "Événements", url: "/evenements", slug: "", icon: "", order: 0, is_active: true, children: [] },
      { id: "en-cours-shop", name: "Shop", url: "/shop", slug: "", icon: "", order: 0, is_active: true, children: [] },
      { id: "en-cours-trainings", name: "Trainings", url: "/trainings", slug: "", icon: "", order: 0, is_active: true, children: [] },
    ] as MenuItemApi[],
  };

  // "Nos partenaires" — toujours affiché quand on utilise l'API (injection comme Identité COF / En cours)
  const partenairesEntry = {
    href: "/partenaires",
    label: "Nos partenaires",
    children: [
      { id: "pstr", name: "Structures partenaires", url: "/partenaires/structures", slug: "", icon: "", order: 0, is_active: true, children: [] },
      { id: "pev", name: "Événements des partenaires", url: "/partenaires/evenements", slug: "", icon: "", order: 0, is_active: true, children: [] },
      { id: "pcours", name: "Cours des partenaires", url: "/partenaires/cours", slug: "", icon: "", order: 0, is_active: true, children: [] },
    ] as MenuItemApi[],
  };

  // "Promotions festivals" — festivals des partenaires (lien direct)
  const promotionsFestivalsEntry = {
    href: "/promotions-festivals",
    label: "Promotions festivals",
    children: [] as MenuItemApi[],
  };

  // "Organisation" et "Autre" — utilisés dans l'ordre fixe du menu
  const organisationEntry = {
    href: "/organisation",
    label: "Organisation",
    children: [
      { id: "o1", name: "Structure", url: "/organisation/structure/", slug: "", icon: "", order: 0, is_active: true, children: [] },
      { id: "o2", name: "Pôles", url: "/organisation/poles/", slug: "", icon: "", order: 0, is_active: true, children: [] },
    ] as MenuItemApi[],
  };
  const autreEntry = {
    href: "#",
    label: "Autre",
    children: [
      { id: "th1", name: "Théorie", url: "/theorie/", slug: "", icon: "", order: 0, is_active: true, children: [] },
      { id: "ca1", name: "Care", url: "/care/", slug: "", icon: "", order: 0, is_active: true, children: [] },
      { id: "p1", name: "Projets", url: "/projets/", slug: "", icon: "", order: 0, is_active: true, children: [] },
      { id: "f1", name: "Fichiers", url: "/fichiers/", slug: "", icon: "", order: 0, is_active: true, children: [] },
    ] as MenuItemApi[],
  };

  const fallbackLinks = [
    identiteCofEntry,
    organisationEntry,
    partenairesEntry,
    promotionsFestivalsEntry,
    autreEntry,
    enCoursEntry,
  ];

  const apiLinks =
    menuItems?.length && !menuError
      ? menuItems
          .map((item) => ({
            href: item.url || "/",
            label: item.name,
            children: item.children ?? [],
          }))
          // Ne pas afficher en racine Identité COF, Notre vision, Bulletins, Formations ; Cours, Événements, Shop, Trainings passent dans "En cours"
          .filter((item) => {
            const h = (item.href || "").replace(/\/$/, "") || "/";
            return (
              item.label !== "Identité COF" &&
              item.label !== "Notre vision" &&
              item.label !== "Notre histoire" &&
              item.label !== "Dernières informations" &&
              item.label !== "Formations" &&
              item.label !== "Promotions festivals" &&
              item.label !== "Cours" &&
              item.label !== "Événements" &&
              item.label !== "Shop" &&
              item.label !== "Trainings" &&
              h !== "/identite-cof/notre-vision" &&
              h !== "/identite-cof/notre-histoire" &&
              h !== "/identite-cof/bulletins" &&
              h !== "/formations" &&
              h !== "/promotions-festivals" &&
              h !== "/cours" &&
              h !== "/evenements" &&
              h !== "/shop" &&
              h !== "/trainings"
            );
          })
      : [];

  // Ordre fixe du menu : Identité COF → Organisation → Nos partenaires → Promotions festivals → Autre → En cours
  const findFromApi = (label: string) => apiLinks.find((l) => l.label === label);
  const organisationFromApi = findFromApi("Organisation");
  const autreFromApi = findFromApi("Autre");

  const links =
    apiLinks.length > 0
      ? [
          identiteCofEntry,
          organisationFromApi ?? organisationEntry,
          partenairesEntry,
          promotionsFestivalsEntry,
          autreFromApi ?? autreEntry,
          enCoursEntry,
        ]
      : fallbackLinks;

  const filteredLinks = links.filter(
    link => link.label.toLowerCase() !== "login" && link.href !== "/login"
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-black/80 backdrop-blur-md border-b border-white/10"
        : "bg-transparent"
        }`}
    >
      <nav className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${scrolled ? "h-20" : "h-56"} flex items-center justify-between`} aria-label="Navigation principale">
        <Link
          href="/"
          className="hover:scale-105 transition transform origin-left whitespace-nowrap flex-shrink-0"
        >
          <Image
            src="/logo.png"
            alt="Capital of Fusion"
            width={600}
            height={200}
            className={`transition-all duration-300 ${scrolled ? "h-16" : "h-48"} w-auto object-contain`}
            priority
          />
        </Link>

        <div className="hidden xl:flex items-center gap-2 lg:gap-4 flex-1 justify-end pl-2 flex-wrap lg:flex-nowrap">
          {filteredLinks.map(({ href, label, children }) =>
            children.length > 0 ? (
              <div key={href + label} className="relative group" role="group" aria-haspopup="true" aria-label={label}>
                <Link href={href} className="text-white/90 hover:text-white text-sm font-medium transition py-2 block focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded px-1">
                  {label}
                </Link>
                <div className="absolute top-full left-0 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-black/95 backdrop-blur-md border border-white/10 rounded-lg py-2 min-w-[180px] shadow-xl">
                    {children.map((child) => {
                      const url = child.url || "#";
                      const isProjets = url.startsWith("/projets");
                      return (
                        <Link
                          key={child.id}
                          href={url}
                          prefetch={!isProjets}
                          className="block px-4 py-2 text-sm text-white/90 hover:text-white hover:bg-white/5 focus:outline-none focus-visible:bg-white/10 focus-visible:text-white rounded"
                        >
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={href + label}
                href={href}
                prefetch={!href.startsWith("/projets")}
                className="text-white/90 hover:text-white text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded px-1"
              >
                {label}
              </Link>
            )
          )}
          {!loading && user ? (
            <Link
              href="/dashboard"
              className="ml-2 w-9 h-9 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-sm font-bold text-purple-300 hover:scale-105 transition-transform"
              title="Mon Espace"
            >
              {(user.first_name?.[0] ?? user.username[0]).toUpperCase()}
            </Link>
          ) : !loading && !user ? (
            <Link
              href="/login"
              className="ml-2 w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all"
              aria-label="Connexion"
              title="Connexion"
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
          ) : null}
        </div>

        <div className="xl:hidden">
          <MobileNav
            items={filteredLinks}
            hasToken={!!user}
            onLogout={async () => {
              await logout();
              router.refresh();
            }}
          />
        </div>
      </nav>
    </header>
  );
}
