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
      { id: "id-bulletins", name: "Bulletins", url: "/identite-cof/bulletins", slug: "identite-bulletins", icon: "", order: 2, is_active: true, children: [] },
    ] as MenuItemApi[],
  };

  const fallbackLinks = [
    identiteCofEntry,
    { href: "/cours", label: "Cours", children: [] as MenuItemApi[] },
    { href: "/formations", label: "Formations", children: [
      { id: "f1", name: "Contenu éducatif en ligne", url: "/formations/contenu/", slug: "", icon: "", order: 0, is_active: true, children: [] },
      { id: "f2", name: "Catégories", url: "/formations/categories/", slug: "", icon: "", order: 0, is_active: true, children: [] },
      { id: "f3", name: "Vidéothèque", url: "/formations/videotheque/", slug: "", icon: "", order: 0, is_active: true, children: [] },
    ] as MenuItemApi[] },
    { href: "/trainings", label: "Trainings", children: [] as MenuItemApi[] },
    { href: "/artistes", label: "Artistes", children: [
      { id: "a1", name: "Nos artistes", url: "/artistes/", slug: "", icon: "", order: 0, is_active: true, children: [] },
    ] as MenuItemApi[] },
    { href: "/shop", label: "Shop", children: [] as MenuItemApi[] },
    { href: "#", label: "Autre", children: [
      { id: "th1", name: "Théorie", url: "/theorie/", slug: "", icon: "", order: 0, is_active: true, children: [] },
      { id: "ca1", name: "Care", url: "/care/", slug: "", icon: "", order: 0, is_active: true, children: [] },
      { id: "p1", name: "Projets", url: "/projets/", slug: "", icon: "", order: 0, is_active: true, children: [] },
      { id: "f1", name: "Fichiers", url: "/fichiers/", slug: "", icon: "", order: 0, is_active: true, children: [] },
    ] as MenuItemApi[] },
    { href: "/organisation", label: "Organisation", children: [
      { id: "o1", name: "Structure", url: "/organisation/structure/", slug: "", icon: "", order: 0, is_active: true, children: [] },
      { id: "o2", name: "Pôles", url: "/organisation/poles/", slug: "", icon: "", order: 0, is_active: true, children: [] },
    ] as MenuItemApi[] },
  ];

  const apiLinks =
    menuItems?.length && !menuError
      ? menuItems
          .map((item) => ({
            href: item.url || "/",
            label: item.name,
            children: item.children ?? [],
          }))
          // Ne pas afficher en racine "Identité COF" ni les sous-pages (Notre vision, Bulletins) — elles sont dans notre dropdown
          .filter((item) => {
            const h = (item.href || "").replace(/\/$/, "") || "/";
            return (
              item.label !== "Identité COF" &&
              item.label !== "Notre vision" &&
              item.label !== "Bulletins" &&
              h !== "/identite-cof/notre-vision" &&
              h !== "/identite-cof/bulletins"
            );
          })
      : [];

  // Toujours afficher "Identité COF" en premier avec son dropdown (Notre vision, Bulletins)
  const links =
    apiLinks.length > 0
      ? [identiteCofEntry, ...apiLinks]
      : fallbackLinks;

  const filteredLinks = user
    ? links.filter(link => link.label.toLowerCase() !== "login" && link.href !== "/login")
    : links;

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
