"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { MobileNav } from "./MobileNav";
import { getMenuItems } from "@/lib/api";
import { localizeMenuChildren } from "@/lib/navMenuLabels";
import type { MenuItemApi } from "@/types/menu";
import { ArtistProfileNavbarDock } from "@/components/shared/ArtistProfileNavbarDock";

function normPath(u: string): string {
  return (u || "").replace(/\/$/, "") || "/";
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href || "");
}

function filterActiveMenuTree(items: MenuItemApi[]): MenuItemApi[] {
  return (items ?? [])
    .filter((i) => i.is_active !== false)
    .map((i) => ({
      ...i,
      children: filterActiveMenuTree(i.children ?? []),
    }));
}

/** Slugs racine masqués (remplacés par les entrées injectées Identité / En cours / etc.). */
const EXCLUDED_ROOT_SLUGS = new Set([
  "identite-cof",
  "formations",
  "cours",
  "evenements",
  "shop",
  "trainings",
  "promotions-festivals",
  "login",
]);

const EXCLUDED_ROOT_PATHS = new Set([
  "/identite-cof",
  "/identite-cof/notre-vision",
  "/identite-cof/notre-histoire",
  "/identite-cof/bulletins",
  "/formations",
  "/promotions-festivals",
  "/cours",
  "/evenements",
  "/shop",
  "/trainings",
]);

type NavLink = {
  href: string;
  label: string;
  slug?: string;
  children: MenuItemApi[];
};

/**
 * Navbar — bandeau noir fixe, hauteur stable (pas de changement au scroll).
 * Menu piloté par l'API GET /api/menu/items/ (admin Django).
 * Fallback liens statiques si l'API est indisponible.
 * Libellés injectés via next-intl (`navbar.menu.*`).
 */
export function Navbar() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("navbar");
  const [menuItems, setMenuItems] = useState<MenuItemApi[] | null>(null);
  const [menuStatus, setMenuStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const headerRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const apply = () => {
      document.documentElement.style.setProperty(
        "--app-header-height",
        `${el.offsetHeight}px`,
      );
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    getMenuItems()
      .then((items) => {
        setMenuItems(items);
        setMenuStatus("ready");
      })
      .catch(() => {
        setMenuStatus("error");
      });
  }, []);

  const {
    identiteCofEntry,
    enCoursEntry,
    partenairesEntry,
    promotionsFestivalsEntry,
    organisationEntry,
    autreEntry,
  } = useMemo(() => {
    const identiteCofEntry: NavLink = {
      href: "/identite-cof",
      label: t("menu.identiteCof"),
      children: [
        {
          id: "id-vision",
          name: t("menu.ourVision"),
          url: "/identite-cof/notre-vision",
          slug: "identite-vision",
          icon: "",
          order: 1,
          is_active: true,
          children: [],
        },
        {
          id: "id-histoire",
          name: t("menu.ourHistory"),
          url: "/identite-cof/notre-histoire",
          slug: "identite-histoire",
          icon: "",
          order: 2,
          is_active: true,
          children: [],
        },
        {
          id: "id-bulletins",
          name: t("menu.ourBulletins"),
          url: "/identite-cof/bulletins",
          slug: "identite-bulletins",
          icon: "",
          order: 3,
          is_active: true,
          children: [],
        },
      ],
    };

    const enCoursEntry: NavLink = {
      href: "/contact",
      label: t("menu.ongoing"),
      children: [
        {
          id: "en-cours-cours",
          name: t("menu.courses"),
          url: "/cours",
          slug: "",
          icon: "",
          order: 0,
          is_active: true,
          children: [],
        },
        {
          id: "en-cours-evenements",
          name: t("menu.events"),
          url: "/evenements",
          slug: "",
          icon: "",
          order: 0,
          is_active: true,
          children: [],
        },
        {
          id: "en-cours-shop",
          name: t("menu.shop"),
          url: "/shop",
          slug: "",
          icon: "",
          order: 0,
          is_active: true,
          children: [],
        },
        {
          id: "en-cours-trainings",
          name: t("menu.trainings"),
          url: "/trainings",
          slug: "",
          icon: "",
          order: 0,
          is_active: true,
          children: [],
        },
      ],
    };

    const partenairesEntry: NavLink = {
      href: "/partenaires",
      label: t("menu.ourPartners"),
      children: [
        {
          id: "pstr",
          name: t("menu.partnerStructures"),
          url: "/partenaires/structures",
          slug: "",
          icon: "",
          order: 0,
          is_active: true,
          children: [],
        },
        {
          id: "pev",
          name: t("menu.partnerEvents"),
          url: "/partenaires/evenements",
          slug: "",
          icon: "",
          order: 0,
          is_active: true,
          children: [],
        },
        {
          id: "pcours",
          name: t("menu.partnerCourses"),
          url: "/partenaires/cours",
          slug: "",
          icon: "",
          order: 0,
          is_active: true,
          children: [],
        },
        {
          id: "partists",
          name: t("menu.partnerArtistsDirectory"),
          url: "/artistes",
          slug: "",
          icon: "",
          order: 0,
          is_active: true,
          children: [],
        },
      ],
    };

    const promotionsFestivalsEntry: NavLink = {
      href: "/promotions-festivals",
      label: t("menu.promotionsFestivals"),
      children: [],
    };

    const organisationEntry: NavLink = {
      href: "/organisation",
      label: t("menu.organisation"),
      children: [
        {
          id: "o-artistes",
          name: t("menu.ourArtists"),
          url: "/artistes/annuaire",
          slug: "",
          icon: "",
          order: 0,
          is_active: true,
          children: [],
        },
        {
          id: "o1",
          name: t("menu.structure"),
          url: "/organisation/structure/",
          slug: "",
          icon: "",
          order: 1,
          is_active: true,
          children: [],
        },
        {
          id: "o2",
          name: t("menu.poles"),
          url: "/organisation/poles/",
          slug: "",
          icon: "",
          order: 2,
          is_active: true,
          children: [],
        },
        {
          id: "o-staff",
          name: t("menu.ourStaff"),
          url: "/organisation/staff/",
          slug: "",
          icon: "",
          order: 3,
          is_active: true,
          children: [],
        },
      ],
    };

    const autreEntry: NavLink = {
      href: "#",
      label: t("menu.other"),
      children: [
        {
          id: "th1",
          name: t("menu.theory"),
          url: "/theorie/",
          slug: "",
          icon: "",
          order: 0,
          is_active: true,
          children: [],
        },
        {
          id: "ca1",
          name: t("menu.care"),
          url: "/care/",
          slug: "",
          icon: "",
          order: 0,
          is_active: true,
          children: [],
        },
        {
          id: "p1",
          name: t("menu.projects"),
          url: "/projets/",
          slug: "",
          icon: "",
          order: 0,
          is_active: true,
          children: [],
        },
        {
          id: "f1",
          name: t("menu.files"),
          url: "/fichiers/",
          slug: "",
          icon: "",
          order: 0,
          is_active: true,
          children: [],
        },
      ],
    };

    return {
      identiteCofEntry,
      enCoursEntry,
      partenairesEntry,
      promotionsFestivalsEntry,
      organisationEntry,
      autreEntry,
    };
  }, [t]);

  const fallbackLinks = useMemo(
    () => [
      identiteCofEntry,
      organisationEntry,
      partenairesEntry,
      promotionsFestivalsEntry,
      autreEntry,
      enCoursEntry,
    ],
    [
      identiteCofEntry,
      organisationEntry,
      partenairesEntry,
      promotionsFestivalsEntry,
      autreEntry,
      enCoursEntry,
    ],
  );

  /**
   * Menu depuis l'API :
   * - Filtre `is_active` (récursif)
   * - Applique la blacklist root (EXCLUDED_ROOT_*)
   * - Si l'API répond mais tout est inactif → menu vide (pas de fallback)
   * - Fallback uniquement si l'API est indisponible (erreur)
   */
  const apiLinks = useMemo((): NavLink[] => {
    if (!menuItems?.length) return [];
    const activeTree = filterActiveMenuTree(menuItems);
    return activeTree
      .map((item) => ({
        href: item.url || "/",
        label: item.name,
        slug: item.slug,
        children: item.children ?? [],
      }))
      .filter((item) => {
        if (item.slug && EXCLUDED_ROOT_SLUGS.has(item.slug)) return false;
        const h = normPath(item.href);
        if (EXCLUDED_ROOT_PATHS.has(h)) return false;
        return true;
      });
  }, [menuItems]);

  const links: NavLink[] = useMemo(() => {
    /**
     * Évite le "flash" : au premier rendu, on ne montre pas le fallback tant que
     * l'API n'a pas échoué. Avant ça, on garde le menu vide (layout stable).
     */
    if (menuStatus === "loading") return [];
    if (menuStatus === "error") return fallbackLinks;
    // menuStatus === "ready"
    return apiLinks;
  }, [apiLinks, fallbackLinks, menuStatus]);

  const filteredLinks = links.filter((link) => normPath(link.href).toLowerCase() !== "/login");

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/[0.08]"
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 xl:h-20 flex items-center justify-between"
        aria-label={t("ariaMainNav")}
      >
        <Link
          href="/"
          className="hover:scale-105 transition-transform origin-left whitespace-nowrap flex-shrink-0"
        >
          <Image
            src="/logo.png"
            alt={t("logoAlt")}
            width={600}
            height={200}
            className="h-10 xl:h-14 w-auto object-contain"
            priority
          />
        </Link>

        <div className="hidden xl:flex items-center gap-2 lg:gap-4 flex-1 justify-end pl-2 flex-wrap lg:flex-nowrap">
          {filteredLinks.map(({ href, label, children }) =>
            children.length > 0 ? (
              <div key={href + label} className="relative group" role="group" aria-haspopup="true" aria-label={label}>
                {isExternalHref(href) ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/90 hover:text-white text-sm font-medium transition py-2 block focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded px-1"
                  >
                    {label}
                  </a>
                ) : (
                  <Link
                    href={href}
                    className="text-white/90 hover:text-white text-sm font-medium transition py-2 block focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded px-1"
                  >
                    {label}
                  </Link>
                )}
                <div className="absolute top-full left-0 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-black/95 backdrop-blur-md border border-white/10 rounded-lg py-2 min-w-[180px] shadow-xl">
                    {children.map((child) => {
                      const url = child.url || "#";
                      const isProjets = url.startsWith("/projets");
                      const external = isExternalHref(url);
                      return (
                        external ? (
                          <a
                            key={child.id}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-2 text-sm text-white/90 hover:text-white hover:bg-white/5 focus:outline-none focus-visible:bg-white/10 focus-visible:text-white rounded"
                          >
                            {child.name}
                          </a>
                        ) : (
                          <Link
                            key={child.id}
                            href={url}
                            prefetch={!isProjets}
                            className="block px-4 py-2 text-sm text-white/90 hover:text-white hover:bg-white/5 focus:outline-none focus-visible:bg-white/10 focus-visible:text-white rounded"
                          >
                            {child.name}
                          </Link>
                        )
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              isExternalHref(href) ? (
                <a
                  key={href + label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/90 hover:text-white text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded px-1"
                >
                  {label}
                </a>
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
            ),
          )}
          <div className="flex items-center gap-1 ml-2" aria-label={t("language")}>
            {(["fr", "en", "es"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  document.cookie = `locale=${l}; path=/; max-age=31536000`;
                  router.refresh();
                }}
                className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition ${
                  locale === l
                    ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-purple-500/30 hover:text-purple-200"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="xl:hidden">
          <MobileNav items={filteredLinks} />
        </div>
      </nav>
      <ArtistProfileNavbarDock />
    </header>
  );
}
