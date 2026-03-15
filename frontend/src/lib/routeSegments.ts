/**
 * Classification des routes pour le layout conditionnel (vidéo, providers).
 * Utilisé par ClientLayoutWrapper pour décider quel type de page est affiché.
 */

export type PageType = "home" | "explore" | "menu" | "detail" | "user";

const USER_PREFIXES = ["/dashboard", "/login", "/register"];

/** Chemins qui sont des pages "détail" (contenu dynamique, pas de vidéo). */
const DETAIL_PATH_PATTERNS: { prefix: string; excludeSegments?: string[] }[] = [
  { prefix: "/organisation/noeuds/" },
  { prefix: "/artistes/profils/" },
  { prefix: "/partenaires/structures/" },
  { prefix: "/projets/", excludeSegments: ["incubation", "initiatives", ""] },
  { prefix: "/shop/" },
  { prefix: "/identite-cof/bulletins/", excludeSegments: ["nouveau", ""] },
  { prefix: "/evenements/", excludeSegments: ["festivals", ""] },
  { prefix: "/cours/", excludeSegments: ["planning", "filtres", "programmes", "inscription", ""] },
  { prefix: "/partenaires/evenements/" },
  { prefix: "/partenaires/cours/" },
];

function pathSegments(pathname: string): string[] {
  return pathname.replace(/\/$/, "").split("/").filter(Boolean);
}

export function isUserPage(pathname: string): boolean {
  return USER_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function isHome(pathname: string): boolean {
  return pathname === "/" || pathname === "";
}

export function isExplore(pathname: string): boolean {
  return pathname === "/explore" || pathname.startsWith("/explore/");
}

export function isDetailPage(pathname: string): boolean {
  const segments = pathSegments(pathname);
  for (const { prefix, excludeSegments } of DETAIL_PATH_PATTERNS) {
    if (!pathname.startsWith(prefix)) continue;
    const rest = pathname.slice(prefix.length).replace(/\/$/, "");
    const lastSegment = rest.split("/")[0];
    if (excludeSegments && lastSegment && excludeSegments.includes(lastSegment)) continue;
    if (rest.length > 0) return true;
  }
  return false;
}

export function isMenuPage(pathname: string): boolean {
  return !isHome(pathname) && !isExplore(pathname) && !isUserPage(pathname) && !isDetailPage(pathname);
}

export function getPageType(pathname: string): PageType {
  if (isHome(pathname)) return "home";
  if (isExplore(pathname)) return "explore";
  if (isUserPage(pathname)) return "user";
  if (isDetailPage(pathname)) return "detail";
  return "menu";
}
