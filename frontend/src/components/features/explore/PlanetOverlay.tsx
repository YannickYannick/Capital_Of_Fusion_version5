"use client";

import { useEffect, useRef } from "react";
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
 * Accessibilité : dialog modal, fermeture Escape, focus sur le bouton fermer à l'ouverture.
 */
export function PlanetOverlay({ node, onClose }: PlanetOverlayProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!node) return;
    closeButtonRef.current?.focus();
  }, [node]);

  useEffect(() => {
    if (!node) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [node, onClose]);

  if (!node) return null;

  return (
    <div
      className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-[#0a0e27]/80 backdrop-blur-xl border-l border-white/10 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
      role="dialog"
      aria-modal="true"
      aria-label={`Détail : ${node.name}`}
    >
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">{node.name}</h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded"
            aria-label="Fermer le détail"
          >
            <span className="text-2xl leading-none" aria-hidden="true">×</span>
          </button>
        </div>
        {node.short_description && (
          <p className="text-purple-300/90 font-medium text-sm mb-4">{node.short_description}</p>
        )}
        {node.description && (
          <p className="mt-2 text-white/70 text-sm whitespace-pre-wrap">
            {node.description}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          {node.cta_url && (
            <a
              href={node.cta_url}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition shadow-lg shadow-purple-500/20"
            >
              {node.cta_text || "En savoir plus"}
            </a>
          )}
          <a
            href={`/cours?organization=${node.id}`}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition backdrop-blur-sm border border-white/5"
          >
            Voir les cours
          </a>
        </div>

        {node.node_events.length > 0 && (
          <div className="mt-10">
            <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">
              Prochains Événements
            </h3>
            <ul className="space-y-3">
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
                      className="text-xs text-purple-300 hover:underline mt-1 inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1 rounded"
                      aria-label={`Lien vers l’événement : ${ev.title}`}
                    >
                      Voir l’événement
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
