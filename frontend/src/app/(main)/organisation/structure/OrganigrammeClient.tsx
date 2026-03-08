"use client";

import Link from "next/link";
import type { OrganizationNodeApi } from "@/types/organization";

/**
 * Arbre hiérarchique des nœuds (parent_slug). Liens vers /organisation/noeuds/[slug].
 */
interface TreeNode {
  node: OrganizationNodeApi;
  children: TreeNode[];
}

function buildTree(nodes: OrganizationNodeApi[]): TreeNode[] {
  const bySlug = new Map<string, TreeNode>();
  nodes.forEach((node) => {
    bySlug.set(node.slug, { node, children: [] });
  });
  const roots: TreeNode[] = [];
  bySlug.forEach((treeNode, slug) => {
    const parentSlug = treeNode.node.parent_slug ?? null;
    if (!parentSlug) {
      roots.push(treeNode);
    } else {
      const parent = bySlug.get(parentSlug);
      if (parent) parent.children.push(treeNode);
      else roots.push(treeNode);
    }
  });
  roots.sort((a, b) => a.node.name.localeCompare(b.node.name));
  bySlug.forEach((t) => {
    t.children.sort((a, b) => a.node.name.localeCompare(b.node.name));
  });
  return roots;
}

const NODE_COLORS: Record<number, string> = {
  0: "from-violet-600/25 to-purple-700/15 border-violet-500/40",
  1: "from-fuchsia-600/20 to-pink-700/10 border-fuchsia-500/30",
  2: "from-cyan-600/20 to-blue-700/10 border-cyan-500/30",
  3: "from-amber-600/20 to-orange-700/10 border-amber-500/30",
};

function getColor(depth: number): string {
  return NODE_COLORS[depth % 4] ?? NODE_COLORS[0];
}

function NodeCard({ treeNode, depth }: { treeNode: TreeNode; depth: number }) {
  const { node, children } = treeNode;
  const color = getColor(depth);
  const hasChildren = children.length > 0;

  return (
    <div className="relative flex flex-col">
      <div className="flex gap-4">
        {depth > 0 && (
          <div className="flex shrink-0 flex-col items-center">
            <div className="w-px flex-1 min-h-[0.75rem] bg-white/20" />
            <div className="w-3 h-px bg-white/20" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Link
            href={`/organisation/noeuds/${encodeURIComponent(node.slug)}`}
            className={`group block bg-gradient-to-br ${color} border rounded-2xl px-5 py-4 backdrop-blur-md hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 transition-all duration-200`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl opacity-90 group-hover:scale-110 transition-transform">
                {node.type === "ROOT" ? "🏛️" : node.type === "BRANCH" ? "🌿" : "📅"}
              </span>
              <div className="min-w-0">
                <h3 className="text-white font-bold text-base truncate">{node.name}</h3>
                {node.short_description && (
                  <p className="text-white/60 text-sm mt-0.5 line-clamp-2">
                    {node.short_description}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-white/40 text-xs ml-auto">→ Fiche</span>
            </div>
          </Link>
          {hasChildren && (
            <div className="mt-2 pl-4 border-l-2 border-white/10 flex flex-col gap-2">
              {children.map((child) => (
                <NodeCard key={child.node.id} treeNode={child} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface OrganigrammeClientProps {
  nodes: OrganizationNodeApi[];
}

export function OrganigrammeClient({ nodes }: OrganigrammeClientProps) {
  const tree = buildTree(nodes);

  return (
    <div className="min-h-screen pt-64 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header — même style que formations/contenu */}
        <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Organisation
          </p>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Structure{" "}
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              CoF
            </span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Découvrez l’organigramme de Capital of Fusion. Cliquez sur un nœud pour voir sa fiche, ses cours et événements.
          </p>
        </div>

        {/* Organigramme */}
        {tree.length === 0 ? (
          <p className="text-white/50 italic text-center animate-in fade-in duration-500">
            Aucun nœud pour le moment. Les nœuds sont définis dans l’admin (Organization → Noeuds d’organisation).
          </p>
        ) : (
          <div className="flex flex-col gap-4 animate-in fade-in duration-500">
            {tree.map((root) => (
              <NodeCard key={root.node.id} treeNode={root} depth={0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
