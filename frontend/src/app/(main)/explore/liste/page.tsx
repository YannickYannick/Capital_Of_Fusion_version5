import Link from "next/link";
import { getOrganizationNodes } from "@/lib/api";
import type { OrganizationNodeApi } from "@/types/organization";

export const revalidate = 60;

export default async function ExploreListePage() {
  const nodes = await getOrganizationNodes().catch(() => [] as OrganizationNodeApi[]);

  // Grouper par type
  const nodesByType = nodes.reduce((acc, node) => {
    const type = node.type || "Autre";
    if (!acc[type]) acc[type] = [];
    acc[type].push(node);
    return acc;
  }, {} as Record<string, OrganizationNodeApi[]>);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Capital of Fusion
          </p>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Explorer en{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Liste
            </span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Vue d'ensemble de tous les nœuds de l'organisation Capital of Fusion.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 font-medium hover:bg-purple-500/30 transition"
          >
            <span>🪐</span> Voir en 3D
          </Link>
        </div>

        {/* Liste par type */}
        {nodes.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-4xl mb-4">🪐</p>
            <p className="text-white/60">Aucun nœud disponible pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(nodesByType).map(([type, typeNodes], typeIndex) => (
              <section key={type} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${typeIndex * 100}ms` }}>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                  {type}
                  <span className="text-white/40 text-sm font-normal">({typeNodes.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {typeNodes.map((node, i) => (
                    <Link
                      key={node.id}
                      href={`/${node.slug}`}
                      className="group p-5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 hover:bg-white/10 transition-all duration-300"
                      style={{ animationDelay: `${(typeIndex * 100) + (i * 50)}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar/Image */}
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                          {node.cover_image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={node.cover_image}
                              alt={node.name}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <span className="text-xl">🪐</span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold group-hover:text-purple-400 transition-colors truncate">
                            {node.name}
                          </h3>
                          {node.short_description && (
                            <p className="text-white/50 text-sm mt-1 line-clamp-2">
                              {node.short_description}
                            </p>
                          )}
                          {node.node_events && node.node_events.length > 0 && (
                            <p className="text-purple-400/70 text-xs mt-2">
                              📅 {node.node_events.length} événement{node.node_events.length > 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
