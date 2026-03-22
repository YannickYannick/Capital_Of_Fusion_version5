import type { MenuItemApi } from "@/types/menu";

/** Normalise un chemin pour comparaison (minuscule, sans slash final sauf racine). */
export function normalizeNavPath(url: string): string {
  const u = (url || "").trim() || "/";
  const lower = u.split("?")[0].split("#")[0].toLowerCase();
  if (lower.length > 1 && lower.endsWith("/")) return lower.slice(0, -1);
  return lower || "/";
}

/**
 * Retourne la clé next-intl `menu.*` (namespace navbar) pour une URL de sous-menu,
 * ou `null` si aucune règle connue (on garde alors le nom API).
 */
export function menuTranslationKeyForChildUrl(url: string | undefined): string | null {
  const p = normalizeNavPath(url || "#");

  if (p === "/theorie" || p.startsWith("/theorie/")) return "menu.theory";
  if (p === "/care" || p.startsWith("/care/")) return "menu.care";
  if (p === "/projets" || p.startsWith("/projets/")) return "menu.projects";
  if (p === "/fichiers" || p.startsWith("/fichiers/")) return "menu.files";
  if (p === "/organisation/structure" || p.startsWith("/organisation/structure/")) return "menu.structure";
  if (p === "/organisation/poles" || p.startsWith("/organisation/poles/")) return "menu.poles";
  if (p === "/organisation/staff" || p.startsWith("/organisation/staff/")) return "menu.ourStaff";
  if (p === "/artistes" || p.startsWith("/artistes/")) return "menu.ourArtists";

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
