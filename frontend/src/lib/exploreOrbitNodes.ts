import type { OrganizationNodeApi } from "@/types/organization";

/**
 * Nœuds affichés sur les orbites dans ExploreScene (pas le soleil ROOT).
 * Même filtre que `orbitNodes` dans ExploreScene.
 */
export function getExploreOrbitNodes(nodes: OrganizationNodeApi[]): OrganizationNodeApi[] {
  return nodes.filter((n) => n.is_visible_3d && n.type !== "ROOT");
}
