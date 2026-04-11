"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import type { OrganizationNodeApi, NodeEventApi } from "@/types/organization";
import { patchOrganizationNode } from "@/lib/api";

interface PlanetOverlayProps {
  node: OrganizationNodeApi | null;
  onClose: () => void;
  /** Si true, le membre du staff peut modifier les descriptions depuis cet overlay */
  canEditDescriptions?: boolean;
  /** Appelé après sauvegarde des descriptions (met à jour le noeud côté parent) */
  onNodeUpdated?: (node: OrganizationNodeApi) => void;
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
    <div
      className="flex-shrink-0 w-52 rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-purple-500/40 transition animate-slideInX"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {ev.external_url ? (
        <a href={ev.external_url} target="_blank" rel="noopener noreferrer">
          <CardContent ev={ev} />
        </a>
      ) : (
        <CardContent ev={ev} />
      )}
    </div>
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
export function PlanetOverlay({ node, onClose, canEditDescriptions, onNodeUpdated }: PlanetOverlayProps) {
  const [videoError, setVideoError] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [editShortDescription, setEditShortDescription] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const openEditForm = useCallback(() => {
    if (!node) return;
    setEditDescription(node.description || "");
    setEditShortDescription(node.short_description || "");
    setEditContent(node.content || "");
    setSaveError(null);
    setShowEditForm(true);
  }, [node]);

  const saveDescriptions = useCallback(async () => {
    if (!node || !onNodeUpdated) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await patchOrganizationNode(node.slug, {
        description: editDescription,
        short_description: editShortDescription,
        content: editContent,
      });
      onNodeUpdated(updated);
      setShowEditForm(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }, [node, editDescription, editShortDescription, editContent, onNodeUpdated]);

  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (node) setIsClosing(false);
  }, [node]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  const handleBackdropClickWithAnimation = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) handleClose();
    },
    [handleClose]
  );

  if (!node) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 ${isClosing ? "animate-fadeOut" : "animate-fadeIn"}`}
        onClick={handleBackdropClickWithAnimation}
      >
        {/* Modal */}
        <div
          className={`relative w-full max-w-5xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[#0a0e27]/95 border border-white/10 shadow-2xl ${isClosing ? "animate-fadeOutScale" : "animate-fadeInScale"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bouton fermer */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            {canEditDescriptions && (
              <button
                type="button"
                onClick={showEditForm ? () => setShowEditForm(false) : openEditForm}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition"
              >
                {showEditForm ? "Annuler" : "✏️ Modifier la description"}
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/45 text-3xl font-light leading-none text-white shadow-md transition hover:bg-black/65 active:scale-95 md:h-11 md:w-11 md:text-2xl"
              aria-label="Fermer"
            >
              ×
            </button>
          </div>

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
                  <div className="flex flex-wrap flex-col sm:flex-row gap-3 mt-4 w-full">
                    {/* Primary Action: Routage principal vers la timeline/page */}
                    {node.cta_url ? (
                      <a
                        href={node.cta_url}
                        target={node.cta_url.startsWith("http") ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center text-center px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold transition-all hover:scale-[1.02] shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)] border border-cyan-400/30"
                      >
                        {node.cta_text || "Visiter le lien"} ↗
                      </a>
                    ) : (
                      <Link
                        href={`/organisation/noeuds/${encodeURIComponent(node.slug)}`}
                        className="flex-1 flex items-center justify-center gap-2 text-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold transition-all hover:scale-[1.02] shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)] border border-purple-400/30"
                        onClick={onClose}
                      >
                        <span className="text-xl">🪐</span>
                        <span>Explorer {node.name}</span>
                      </Link>
                    )}

                    {/* Secondary Action: Vue filtrée des cours (si pertinent) */}
                    <Link
                      href={`/cours?organization=${node.id}`}
                      className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition border border-white/10 text-center flex items-center justify-center"
                      onClick={onClose}
                    >
                      Voir les cours liés
                    </Link>
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

              {/* Section Description du nœud (ou formulaire d'édition staff) */}
              {(node.description || showEditForm) && (
                <div className="border-t border-white/10 px-8 py-6">
                  <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">
                    Description
                  </h2>
                  {showEditForm ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Accroche courte (max 300 car.)</label>
                        <textarea
                          value={editShortDescription}
                          onChange={(e) => setEditShortDescription(e.target.value.slice(0, 300))}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                          placeholder="Courte phrase sous le titre"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Description</label>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                          placeholder="Description du nœud"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Contenu détaillé (À propos)</label>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={6}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                          placeholder="Contenu riche (markdown possible)"
                        />
                      </div>
                      {saveError && (
                        <p className="text-red-400 text-sm">{saveError}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={saveDescriptions}
                          disabled={saving}
                          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium disabled:opacity-50"
                        >
                          {saving ? "Enregistrement…" : "Enregistrer"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowEditForm(false)}
                          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                      {node.description}
                    </p>
                  )}
                </div>
              )}

              {/* Bouton "Modifier" visible pour staff même sans description (ouvre le formulaire) */}
              {canEditDescriptions && !node.description && !showEditForm && (
                <div className="border-t border-white/10 px-8 py-6">
                  <button
                    type="button"
                    onClick={openEditForm}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-sm font-medium transition"
                  >
                    ✏️ Ajouter / modifier la description
                  </button>
                </div>
              )}

          {/* Section À propos (contenu détaillé) */}
          {node.content && (
            <div className="border-t border-white/10 px-8 py-6">
              <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">
                À propos
              </h2>
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                {node.content}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
