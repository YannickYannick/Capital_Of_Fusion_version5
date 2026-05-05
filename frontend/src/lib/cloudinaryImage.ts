/**
 * Réduit le poids des images Cloudinary en injectant des transformations standard
 * après le segment .../image/upload/ (sans doublon si des params sont déjà présents).
 */
export function cloudinaryCardImageUrl(url: string, width: number): string {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }
  const marker = "/image/upload/";
  const idx = url.indexOf(marker);
  const base = url.slice(0, idx + marker.length);
  const rest = url.slice(idx + marker.length);
  const firstSlash = rest.indexOf("/");
  const firstSeg = firstSlash === -1 ? rest : rest.slice(0, firstSlash);
  // Livraison signée Cloudinary : ne pas modifier le path.
  if (firstSeg.startsWith("s--") && firstSeg.endsWith("--")) {
    return url;
  }
  // Segment déjà typé « transformations » (virgules) ou préfixe connu Cloudinary
  if (firstSeg.includes(",") || /^[acfwh]_/i.test(firstSeg)) {
    return url;
  }
  return `${base}c_fill,w_${width},f_auto,q_auto/${rest}`;
}
