import type { MenuItemApi } from "@/types/menu";

/** Normalise un chemin pour comparaison (minuscule, sans slash final sauf racine). */
export function normalizeNavPath(url: string): string {
  const u = (url || "").trim() || "/";
  const lower = u.split("?")[0].split("#")[0].toLowerCase();
  if (lower.length > 1 && lower.endsWith("/")) return lower.slice(0, -1);
  return lower || "/";
}

/**
 * Retourne la clé next-intl `menu.*` (namespace navbar) pour une URL racine,
 * ou `null` si aucune règle connue (on garde alors le nom API).
 */
export function menuTranslationKeyForRootUrl(url: string | undefined): string | null {
  const p = normalizeNavPath(url || "#");

  // Plus spécifique d'abord
  if (p === "/festival/book-your-hotel") return "menu.bookYourHotel";
  // Puis les patterns génériques
  if (p === "/festival") return "menu.festival";
  if (p === "/support" || p.startsWith("/support/")) return "menu.support";
  if (p === "/identite-cof") return "menu.identiteCof";

  return null;
}

/**
 * Retourne la clé next-intl `menu.*` (namespace navbar) pour une URL de sous-menu,
 * ou `null` si aucune règle connue (on garde alors le nom API).
 */
export function menuTranslationKeyForChildUrl(url: string | undefined): string | null {
  const p = normalizeNavPath(url || "#");

  // Festival sub-pages
  if (p === "/festival/book-your-hotel") return "menu.bookYourHotel";
  if (p === "/festival/planning-navettes") return "menu.planningNavettes";
  if (p === "/festival/acces-venue") return "menu.accesVenue";
  if (p === "/festival/notre-programme") return "menu.notreProgramme";
  if (p === "/festival/jack-n-jill") return "menu.jackNJill";
  if (p === "/festival/all-star-street-battle") return "menu.allStarStreetBattle";
  
  // Book your pass (external link - goandance)
  if (p.includes("goandance.com")) return "menu.bookYourPass";

  // Other pages
  if (p === "/theorie" || p.startsWith("/theorie/")) return "menu.theory";
  if (p === "/care" || p.startsWith("/care/")) return "menu.care";
  if (p === "/projets" || p.startsWith("/projets/")) return "menu.projects";
  if (p === "/fichiers" || p.startsWith("/fichiers/")) return "menu.files";
  if (p === "/organisation/structure" || p.startsWith("/organisation/structure/")) return "menu.structure";
  if (p === "/organisation/poles" || p.startsWith("/organisation/poles/")) return "menu.poles";
  if (p === "/organisation/staff" || p.startsWith("/organisation/staff/")) return "menu.ourStaff";
  if (p === "/artistes" || p.startsWith("/artistes/")) return "menu.nosArtistes";

  // Identité COF (URLs alignées MenuItem / admin)
  if (p === "/identite-cof/notre-vision") return "menu.ourVision";
  if (p === "/identite-cof/notre-histoire") return "menu.ourHistory";
  if (p === "/identite-cof/adn-du-festival") return "menu.identiteAdnFestival";
  if (p === "/identite-cof/bulletins" || p.startsWith("/identite-cof/bulletins/")) {
    return "menu.ourBulletins";
  }

  return null;
}

/**
 * Clés `pages.identiteHub.*` (titre + description) pour une URL d’enfant Identité COF.
 * Retourne null si URL inconnue (on utilisera le nom API + description vide sur le hub).
 */
export function identiteHubCardTranslationKeys(
  url: string | undefined,
): { titleKey: string; descKey: string } | null {
  const p = normalizeNavPath(url || "#");
  if (p === "/identite-cof/notre-vision") {
    return { titleKey: "cardVisionTitle", descKey: "cardVisionDesc" };
  }
  if (p === "/identite-cof/notre-histoire") {
    return { titleKey: "cardHistoryTitle", descKey: "cardHistoryDesc" };
  }
  if (p === "/identite-cof/adn-du-festival") {
    return { titleKey: "cardAdnTitle", descKey: "cardAdnDesc" };
  }
  if (p === "/identite-cof/bulletins" || p.startsWith("/identite-cof/bulletins/")) {
    return { titleKey: "cardBulletinsTitle", descKey: "cardBulletinsDesc" };
  }
  return null;
}

/** Applique les libellés traduits aux enfants du menu (API). */
export function localizeMenuChildren(
  children: MenuItemApi[],
  t: (key: string) => string
): MenuItemApi[] {
  return children.map((child) => {
    const key = menuTranslationKeyForChildUrl(child.url);
    if (!key) return child;
    return { ...child, name: t(key) };
  });
}

/** Applique les libellés traduits aux items racine du menu (API). */
export function localizeMenuRootItem(
  item: MenuItemApi,
  t: (key: string) => string
): MenuItemApi {
  const key = menuTranslationKeyForRootUrl(item.url);
  if (!key) return item;
  return { ...item, name: t(key) };
}
