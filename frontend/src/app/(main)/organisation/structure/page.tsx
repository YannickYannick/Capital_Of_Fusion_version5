/**
 * Page Organisation — Structure (organigramme à partir des OrganizationNode).
 * Données : GET /api/organization/nodes/?for_structure=1
 */
import { getOrganizationNodesForStructure } from "@/lib/api";
import { OrganigrammeClient } from "./OrganigrammeClient";

export const metadata = {
  title: "Structure | Organisation",
  description: "Organigramme de Capital of Fusion.",
};

export default async function StructurePage() {
  let nodes: Awaited<ReturnType<typeof getOrganizationNodesForStructure>> = [];
  try {
    nodes = await getOrganizationNodesForStructure();
  } catch {
    nodes = [];
  }

  return <OrganigrammeClient nodes={nodes} />;
}
