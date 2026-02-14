"use client";

import type { OrganizationNodeApi } from "@/types/organization";

interface PlanetOverlayProps {
  node: OrganizationNodeApi | null;
  onClose: () => void;
}

function formatDateTime(s: string): string {
  const d = new Date(s);
  return d.toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Overlay détail d'un noeud (planète) : nom, description, NodeEvents.
 */
export function PlanetOverlay({ node, onClose }: PlanetOverlayProps) {
  if (!node) return null;

  return (
    <div
      className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-black/95 backdrop-blur-md border-l border-white/10 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
      role="dialog"
      aria-label={`Détail : ${node.name}`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold text-white">{node.name}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white"
            aria-label="Fermer"
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>
        {node.short_description && (
          <p className="mt-2 text-white/80 text-sm">{node.short_description}</p>
        )}
        {node.description && (
          <p className="mt-2 text-white/70 text-sm whitespace-pre-wrap">
            {node.description}
          </p>
        )}
        {node.cta_url && (
          <a
            href={node.cta_url}
            className="mt-4 inline-block px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition"
          >
            {node.cta_text || "En savoir plus"}
          </a>
        )}

        {node.node_events.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide">
              Événements
            </h3>
            <ul className="mt-2 space-y-3">
              {node.node_events.map((ev) => (
                <li
                  key={ev.id}
                  className="p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <p className="font-medium text-white">{ev.title}</p>
                  <p className="text-xs text-white/60 mt-0.5">
                    {formatDateTime(ev.start_datetime)}
                    {ev.location && ` · ${ev.location}`}
                  </p>
                  {ev.external_url && (
                    <a
                      href={ev.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-300 hover:underline mt-1 inline-block"
                    >
                      Lien
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
