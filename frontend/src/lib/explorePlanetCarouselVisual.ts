import type { OrganizationNodeApi } from "@/types/organization";

function pickUrl(...candidates: (string | null | undefined)[]): string | null {
  for (const c of candidates) {
    const s = c?.trim();
    if (s) return s;
  }
  return null;
}

/**
 * URL d’une image 2D pour le carrousel mobile Explore (hors WebGL).
 * - gif : texture plane (`planet_texture`), sinon repli profil / couverture.
 * - glb : pas d’aperçu GLB en DOM — profil puis couverture.
 * - preset : profil puis couverture ; sinon le parent affiche le disque couleur.
 */
export function getPlanetCarouselFlatImageUrl(node: OrganizationNodeApi): string | null {
  const vs = (node.visual_source || "preset").toLowerCase();

  if (vs === "gif") {
    return pickUrl(node.planet_texture, node.profile_image, node.cover_image);
  }
  if (vs === "glb") {
    return pickUrl(node.profile_image, node.cover_image);
  }
  return pickUrl(node.profile_image, node.cover_image);
}
