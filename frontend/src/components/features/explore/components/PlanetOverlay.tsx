"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { OrganizationNodeApi, NodeEventApi } from "@/types/organization";

interface PlanetOverlayProps {
  node: OrganizationNodeApi | null;
  onClose: () => void;
}

function formatDate(s: string): string {
  return new Date(s).toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EventCard({ ev, index }: { ev: NodeEventApi; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="flex-shrink-0 w-52 rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-purple-500/40 transition"
    >
      {ev.external_url ? (
        <a href={ev.external_url} target="_blank" rel="noopener noreferrer">
          <CardContent ev={ev} />
        </a>
      ) : (
        <CardContent ev={ev} />
      )}
    </motion.div>
  );
}

function CardContent({ ev }: { ev: NodeEventApi }) {
  return (
    <div className="p-3">
      {ev.is_featured && (
        <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-purple-600/50 border border-purple-500/40 text-purple-200 mb-2">
          À la une
        </span>
      )}
      <p className="text-white text-sm font-semibold leading-snug line-clamp-2">{ev.title}</p>
      <p className="text-white/50 text-xs mt-1">{formatDate(ev.start_datetime)}</p>
      {ev.location && <p className="text-white/40 text-xs mt-0.5">📍 {ev.location}</p>}
    </div>
  );
}

/**
 * PlanetOverlay V5 — modal centré (z-50), AnimatePresence Framer Motion.
 * Grille 2 colonnes : média (vidéo/image/lettrine) + titre/CTA.
 * Section événements en scroll horizontal. Section à propos.
 */
export function PlanetOverlay({ node, onClose }: PlanetOverlayProps) {
  const [videoError, setVideoError] = useState(false);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {node && (
        <>
          {/* Backdrop */}
          <motion.div
            key="overlay-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={handleBackdropClick}
          >
            {/* Modal */}
            <motion.div
              key="overlay-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-5xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[#0a0e27]/95 border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Bouton fermer */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition text-lg"
                aria-label="Fermer"
              >
                ×
              </button>

              {/* Header — grille 2 colonnes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Gauche — Média */}
                <div className="relative min-h-[220px] bg-black/40 rounded-tl-2xl rounded-bl-2xl overflow-hidden flex items-center justify-center">
                  {node.video_url && !videoError ? (
                    <div className="relative w-full h-full min-h-[220px]">
                      {node.cover_image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={node.cover_image}
                          alt={node.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition cursor-pointer group">
                        <a
                          href={node.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-14 h-14 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 group-hover:scale-110 transition-transform"
                        >
                          <span className="text-white text-xl ml-1">▶</span>
                        </a>
                      </div>
                    </div>
                  ) : node.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={node.cover_image}
                      alt={node.name}
                      className="w-full h-full object-cover"
                      onError={() => setVideoError(true)}
                    />
                  ) : (
                    <span className="text-white/20 font-bold text-8xl select-none">
                      {node.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Droite — Titre + CTA */}
                <div className="p-8 flex flex-col justify-center gap-4">
                  {node.type && (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-600/20 border border-purple-500/40 text-purple-300 self-start">
                      {node.type}
                    </span>
                  )}
                  <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                    {node.name}
                  </h1>
                  {node.short_description && (
                    <p className="text-white/70 leading-[1.8em] text-sm">
                      {node.short_description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2">
                    {node.cta_url && (
                      <a
                        href={node.cta_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all hover:scale-105 shadow-lg shadow-purple-500/20"
                      >
                        {node.cta_text || "En savoir plus"} ↗
                      </a>
                    )}
                    <a
                      href={`/cours?organization=${node.id}`}
                      className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition border border-white/10"
                    >
                      Voir les cours
                    </a>
                  </div>
                </div>
              </div>

              {/* Section Événements */}
              {node.node_events && node.node_events.length > 0 && (
                <div className="border-t border-white/10 px-8 py-6">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-white/50 uppercase tracking-widest mb-4">
                    <span>📅</span> Prochains événements
                  </h2>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {node.node_events.map((ev, i) => (
                      <EventCard key={ev.id} ev={ev} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* Section À propos */}
              {(node.content || node.description) && (
                <div className="border-t border-white/10 px-8 py-6">
                  <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">
                    À propos
                  </h2>
                  <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                    {node.content || node.description}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
