/**
 * Libellés lisibles pour les liens externes (Instagram, sites).
 */

/** Extrait @pseudo depuis une URL ou chaîne instagram.com/... */
export function instagramDisplayLabel(raw: string): string {
  const u = raw.trim();
  if (!u) return "";
  try {
    const url = u.startsWith("http") ? new URL(u) : new URL(`https://${u.replace(/^\/+/, "")}`);
    const host = url.hostname.replace(/^www\./, "");
    if (!host.includes("instagram")) {
      return u.replace(/^https?:\/\/(www\.)?/, "");
    }
    const segments = url.pathname.split("/").filter(Boolean);
    const first = segments[0];
    if (!first || ["p", "reel", "reels", "stories", "explore", "tv"].includes(first)) {
      return "Publication Instagram";
    }
    return `@${first}`;
  } catch {
    const s = u.replace(/^https?:\/\/(www\.)?instagram\.com\/?/i, "").split(/[/?#]/)[0];
    return s ? `@${s}` : u;
  }
}

/** Domaine + début de chemin pour les sites web (sans URL complète). */
export function websiteDisplayLabel(raw: string): string {
  const u = raw.trim();
  if (!u) return "";
  try {
    const url = u.startsWith("http") ? new URL(u) : new URL(`https://${u}`);
    const host = url.hostname.replace(/^www\./, "");
    const path = url.pathname.replace(/\/$/, "");
    if (path && path !== "/") {
      const short = path.length > 24 ? `${path.slice(0, 22)}…` : path;
      return `${host}${short}`;
    }
    return host;
  } catch {
    return u.replace(/^https?:\/\/(www\.)?/, "").split("/")[0] || u;
  }
}
