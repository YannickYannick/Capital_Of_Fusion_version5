"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { OrganizationNodeApi, NodeEventApi } from "@/types/organization";
import { getFaqItems, patchOrganizationNode, type FaqItemApi } from "@/lib/api";
import { GoAndDanceTicketsEmbed } from "@/components/features/festival/GoAndDanceTicketsEmbed";
import { FestivalPlanningSchedule } from "@/components/features/festival/FestivalPlanningSchedule";
import { OverlayArtistsGrid } from "./OverlayArtistsGrid";
import { OverlayIdentityAdnSection } from "./OverlayIdentityAdnSection";
import {
  ALL_STAR_STREET_BATTLE_NODE_HREF,
  ALL_STAR_STREET_BATTLE_OVERLAY_FALLBACK,
  ALL_STAR_STREET_BATTLE_PAGE_HERO_VIDEO_SRC,
  type OverlayLocale,
} from "@/data/allStarStreetBattlePlanetOverlayFallback";

interface PlanetOverlayProps {
  node: OrganizationNodeApi | null;
  onClose: () => void;
  /** Si true, le membre du staff peut modifier les descriptions depuis cet overlay */
  canEditDescriptions?: boolean;
  /** Appelé après sauvegarde des descriptions (met à jour le noeud côté parent) */
  onNodeUpdated?: (node: OrganizationNodeApi) => void;
}

function formatDate(s: string, locale: string): string {
  const map: Record<string, string> = { fr: "fr-FR", en: "en-US", es: "es-ES" };
  const resolved = map[locale] || locale || "fr-FR";
  return new Date(s).toLocaleString(resolved, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EventCard({
  ev,
  index,
  locale,
  featuredLabel,
}: {
  ev: NodeEventApi;
  index: number;
  locale: string;
  featuredLabel: string;
}) {
  return (
    <div
      className="flex-shrink-0 w-52 rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-purple-500/40 transition animate-slideInX"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {ev.external_url ? (
        <a href={ev.external_url} target="_blank" rel="noopener noreferrer">
          <CardContent ev={ev} locale={locale} featuredLabel={featuredLabel} />
        </a>
      ) : (
        <CardContent ev={ev} locale={locale} featuredLabel={featuredLabel} />
      )}
    </div>
  );
}

function CardContent({
  ev,
  locale,
  featuredLabel,
}: {
  ev: NodeEventApi;
  locale: string;
  featuredLabel: string;
}) {
  return (
    <div className="p-3">
      {ev.is_featured && (
        <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-purple-600/50 border border-purple-500/40 text-purple-200 mb-2">
          {featuredLabel}
        </span>
      )}
      <p className="text-white text-sm font-semibold leading-snug line-clamp-2">{ev.title}</p>
      <p className="text-white/50 text-xs mt-1">{formatDate(ev.start_datetime, locale)}</p>
      {ev.location && <p className="text-white/40 text-xs mt-0.5">📍 {ev.location}</p>}
    </div>
  );
}

/**
 * PlanetOverlay V5 — modal en portail (`document.body`, z-[100] au-dessus de la navbar).
 * Grille 2 colonnes : média (vidéo/image/lettrine) + titre/CTA.
 * Section événements en scroll horizontal. Section à propos.
 */
export function PlanetOverlay({ node, onClose, canEditDescriptions, onNodeUpdated }: PlanetOverlayProps) {
  const t = useTranslations("explore");
  const locale = useLocale();
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

  // FAQ hooks — DOIVENT être appelés avant tout return conditionnel (Rules of Hooks)
  const isFaqNode = useMemo(() => {
    if (!node) return false;
    const slug = (node.slug || "").toLowerCase();
    const name = (node.name || "").toLowerCase();
    return slug === "faq" || slug.includes("faq") || name === "faq" || name.includes("faq");
  }, [node]);

  const isNotreProgrammePlanet = useMemo(() => {
    if (!node) return false;
    const cta = (node.cta_url || "").trim().replace(/\/$/, "");
    if (cta === "/festival/notre-programme") return true;
    const slug = (node.slug || "").toLowerCase();
    return slug.includes("notre-programme") || slug.includes("notre_programme");
  }, [node]);

  /** Planète « Nos artistes » : annuaire API + CTA vers /artistes (plus de « à venir » / placeholder description). */
  const isOurArtistsNode = useMemo(() => {
    if (!node) return false;
    const slug = (node.slug || "").toLowerCase();
    const name = (node.name || "").toLowerCase();
    const cta = (node.cta_url || "").trim().replace(/\/$/, "");
    if (cta === "/artistes" || cta === "/artistes/annuaire") return true;
    const slugHits = [
      "nos-artistes",
      "nos_artistes",
      "our-artists",
      "our_artists",
      "artistes-cof",
    ];
    if (slugHits.some((h) => slug === h || slug.endsWith(`-${h}`) || slug.startsWith(`${h}-`)))
      return true;
    if (
      name.includes("nos artistes") ||
      name.includes("our artists") ||
      name.includes("nuestros artistas") ||
      name.includes("nos artistas")
    )
      return true;
    return false;
  }, [node]);

  /** Planète « Our Identity » / ADN — même markdown que `/identite-cof/adn-du-festival`. */
  const isIdentityAdnNode = useMemo(() => {
    if (!node) return false;
    const slug = (node.slug || "").toLowerCase();
    const name = (node.name || "").toLowerCase();
    const cta = (node.cta_url || "").trim().replace(/\/$/, "");
    if (cta === "/identite-cof/adn-du-festival") return true;
    const slugHints = [
      "our-identity",
      "our_identity",
      "identite-cof",
      "identite_cof",
      "adn-du-festival",
      "adn_du_festival",
      "identite-adn",
      "identity-cof",
      "identite-adn-festival",
    ];
    if (slugHints.some((h) => slug === h || slug.endsWith(`-${h}`) || slug.startsWith(`${h}-`)))
      return true;
    if (
      name.includes("our identity") ||
      name.includes("notre identité") ||
      name.includes("notre identite") ||
      (name.includes("identity") && name.includes("our")) ||
      name.includes("adn du festival") ||
      name.includes("identité cof") ||
      name.includes("identite cof") ||
      name.includes("nuestra identidad")
    )
      return true;
    return false;
  }, [node]);

  /** Street Bachata Battle — slug admin parfois différent ; repli contenu + CTA si API vide. */
  const isAllStarStreetBattleNode = useMemo(() => {
    if (!node) return false;
    const slug = (node.slug || "").toLowerCase();
    const name = (node.name || "").toLowerCase();
    if (slug === "all-star-street-bachata-battle") return true;
    if (slug.includes("all-star") && slug.includes("battle")) return true;
    if (slug.includes("all_star") && slug.includes("battle")) return true;
    if (name.includes("all star") && name.includes("battle")) return true;
    if (name.includes("street bachata battle")) return true;
    const cta = (node.cta_url || "").trim().replace(/\/$/, "");
    if (
      cta === ALL_STAR_STREET_BATTLE_NODE_HREF ||
      cta === "/festival/all-star-street-battle"
    )
      return true;
    return false;
  }, [node]);

  const [faqItems, setFaqItems] = useState<FaqItemApi[] | null>(null);
  const [faqLoading, setFaqLoading] = useState(false);
  const [overlayMounted, setOverlayMounted] = useState(false);
  /** Après ouverture overlay All Star : logo/cover 3 s puis vidéo hero à la place. */
  const [showAllStarOverlayHeroVideo, setShowAllStarOverlayHeroVideo] = useState(false);

  useEffect(() => {
    setOverlayMounted(true);
  }, []);

  useEffect(() => {
    if (!node || !isAllStarStreetBattleNode) {
      setShowAllStarOverlayHeroVideo(false);
      return;
    }
    setShowAllStarOverlayHeroVideo(false);
    const timer = window.setTimeout(() => setShowAllStarOverlayHeroVideo(true), 3000);
    return () => window.clearTimeout(timer);
  }, [node, isAllStarStreetBattleNode]);

  useEffect(() => {
    if (!isFaqNode) {
      setFaqItems(null);
      return;
    }
    let cancelled = false;
    setFaqLoading(true);
    getFaqItems()
      .then((items) => {
        if (!cancelled) setFaqItems(items);
      })
      .catch(() => {
        if (!cancelled) setFaqItems([]);
      })
      .finally(() => {
        if (!cancelled) setFaqLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isFaqNode, locale]);

  // Early return APRÈS tous les hooks
  if (!node) return null;
  if (!overlayMounted) return null;

  const centerTeaserSrc = "/teaser-pool-party.mp4";
  const showCenterTeaser =
    String(node.type || "").toLowerCase() === "root" ||
    node.parent_slug === null ||
    node.parent_slug === undefined;

  const nodeSlug = (node.slug || "").toLowerCase();
  const nodeName = (node.name || "").toLowerCase();
  const isBookYourHotelNode = nodeName.includes("book your hotel") || nodeSlug.includes("book-your-hotel") || nodeSlug === "amapiano-vibe";
  const isBookYourPassNode =
    nodeName.includes("book your pass") ||
    nodeSlug.includes("book-your-pass") ||
    nodeSlug.includes("book_your_pass");

  const overlayLocale: OverlayLocale =
    locale === "fr" || locale === "en" || locale === "es" ? locale : "fr";
  const allStarOverlayFallback = ALL_STAR_STREET_BATTLE_OVERLAY_FALLBACK[overlayLocale];
  const displayShortForOverlay =
    node.short_description || (isAllStarStreetBattleNode ? allStarOverlayFallback.hook : "");
  const displayBodyDescription =
    node.description ||
    (isAllStarStreetBattleNode && !showEditForm ? allStarOverlayFallback.description : "");
  const displayAboutContent =
    node.content ||
    (isAllStarStreetBattleNode && !showEditForm ? allStarOverlayFallback.rules : "");
  const allStarPrimaryCtaHref = isAllStarStreetBattleNode
    ? (node.cta_url || "").trim() || ALL_STAR_STREET_BATTLE_NODE_HREF
    : "";

  return createPortal(
    <>
      {/* Portail `document.body` + z > navbar (z-50) : la croix et le fond restent cliquables au-dessus du header. */}
      <div
        className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 ${isClosing ? "animate-fadeOut" : "animate-fadeIn"}`}
        onClick={handleBackdropClickWithAnimation}
      >
        {/* Modal */}
        <div
          className={`relative w-full max-w-5xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[#0a0e27]/95 border border-white/10 shadow-2xl ${isClosing ? "animate-fadeOutScale" : "animate-fadeInScale"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bouton fermer — z élevé vs contenu scrollable du modal */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            {canEditDescriptions && (
              <button
                type="button"
                onClick={showEditForm ? () => setShowEditForm(false) : openEditForm}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition"
              >
                {showEditForm ? t("overlay.cancel") : t("overlay.editDescription")}
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
                  {isAllStarStreetBattleNode && showAllStarOverlayHeroVideo ? (
                    <div className="relative h-full min-h-[260px] w-full bg-black md:min-h-[300px]">
                      <video
                        src={ALL_STAR_STREET_BATTLE_PAGE_HERO_VIDEO_SRC}
                        className="absolute inset-0 h-full w-full object-contain bg-black"
                        autoPlay
                        muted
                        loop
                        playsInline
                        controls
                        preload="auto"
                        aria-label={node.name}
                      />
                    </div>
                  ) : showCenterTeaser ? (
                    <div className="relative w-full h-full min-h-[220px]">
                      <video
                        src={centerTeaserSrc}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  ) : node.video_url && node.type !== "EVENT" && !videoError ? (
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
                  {displayShortForOverlay && node.type !== "ROOT" && !isBookYourPassNode && (
                    <p className="text-white/70 leading-[1.8em] text-sm">
                      {displayShortForOverlay}
                    </p>
                  )}
                  <div className="flex flex-wrap flex-col sm:flex-row gap-3 mt-4 w-full">
                    {node.type === "ROOT" ? (
                      <a
                        href="https://www.goandance.com/en/event/8924/paris-bachata-vibe-festival-2026?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnprgCFDBKaBIcXNxli3o4eSeZW2PkudBsk3Noz0zPCH1myeSa1TemsZFcRKo_aem_IPghO3-MUFniUMOa5ucZUg"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 text-center px-6 py-3 rounded-xl bg-[#f3ac41] border border-[#f3ac41] hover:brightness-110 text-black font-bold transition"
                      >
                        <span className="text-xl">🎟️</span>
                        <span>{t("overlay.bookGoAndDance")}</span>
                      </a>
                    ) : isBookYourHotelNode ? (
                      <Link
                        href="/festival/book-your-hotel"
                        className="flex-1 flex items-center justify-center gap-2 text-center px-6 py-3 rounded-xl bg-[#f3ac41] border border-[#f3ac41] hover:brightness-110 text-black font-bold transition"
                      >
                        <span className="text-xl">🏨</span>
                        <span>{t("overlay.bookHotel")}</span>
                      </Link>
                    ) : isFaqNode ? (
                      <Link
                        href="/support/faq"
                        className="flex-1 flex items-center justify-center gap-2 text-center px-6 py-3 rounded-xl bg-[#f3ac41] border border-[#f3ac41] hover:brightness-110 text-black font-bold transition"
                      >
                        <span className="text-xl">❓</span>
                        <span>{t("overlay.openFaqFullPage")}</span>
                      </Link>
                    ) : isIdentityAdnNode ? (
                      <Link
                        href="/identite-cof/adn-du-festival"
                        className="flex-1 flex items-center justify-center gap-2 text-center px-6 py-3 rounded-xl bg-[#f3ac41] border border-[#f3ac41] hover:brightness-110 text-black font-bold transition"
                      >
                        <span className="text-xl">✨</span>
                        <span>{t("overlay.openIdentityFullPage")}</span>
                      </Link>
                    ) : isOurArtistsNode ? (
                      <Link
                        href="/artistes"
                        className="flex-1 flex items-center justify-center gap-2 text-center px-6 py-3 rounded-xl bg-[#f3ac41] border border-[#f3ac41] hover:brightness-110 text-black font-bold transition"
                      >
                        <span className="text-xl">🎤</span>
                        <span>{t("overlay.browseArtists")}</span>
                      </Link>
                    ) : isAllStarStreetBattleNode ? (
                      <Link
                        href={allStarPrimaryCtaHref}
                        className="flex-1 flex items-center justify-center gap-2 text-center px-6 py-3 rounded-xl bg-[#f3ac41] border border-[#f3ac41] hover:brightness-110 text-black font-bold transition"
                      >
                        <span className="text-xl">✨</span>
                        <span>
                          {(node.cta_text || "").trim() || allStarOverlayFallback.cta}
                        </span>
                      </Link>
                    ) : node.cta_url ? (
                      node.cta_url.startsWith("/") ? (
                        <Link
                          href={node.cta_url}
                          className="flex-1 flex items-center justify-center gap-2 text-center px-6 py-3 rounded-xl bg-[#f3ac41] border border-[#f3ac41] hover:brightness-110 text-black font-bold transition"
                        >
                          <span className="text-xl">✨</span>
                          <span>{node.cta_text || t("overlay.learnMore")}</span>
                        </Link>
                      ) : (
                        <a
                          href={node.cta_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 text-center px-6 py-3 rounded-xl bg-[#f3ac41] border border-[#f3ac41] hover:brightness-110 text-black font-bold transition"
                        >
                          <span className="text-xl">✨</span>
                          <span>{node.cta_text || t("overlay.learnMore")}</span>
                        </a>
                      )
                      ) : (
                      <button
                        type="button"
                        disabled
                        className="flex-1 flex items-center justify-center gap-2 text-center px-6 py-3 rounded-xl bg-white/10 text-white/60 font-bold shadow-[0_0_20px_-5px_rgba(255,255,255,0.10)] border border-white/15 cursor-not-allowed"
                        aria-disabled="true"
                        title={t("overlay.comingSoon")}
                      >
                        <span className="text-xl">⏳</span>
                        <span>{t("overlay.comingSoon")}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Section Événements */}
              {node.node_events && node.node_events.length > 0 && (
                <div className="border-t border-white/10 px-8 py-6">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-white/50 uppercase tracking-widest mb-4">
                    <span>📅</span> {t("overlay.upcomingEvents")}
                  </h2>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {node.node_events.map((ev, i) => (
                      <EventCard
                        key={ev.id}
                        ev={ev}
                        index={i}
                        locale={locale}
                        featuredLabel={t("overlay.featured")}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Section billetterie Root ou description du nœud */}
              {(showCenterTeaser || displayBodyDescription || showEditForm) && (
                <div className="border-t border-white/10 px-8 py-6">
                  <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">
                    {showCenterTeaser ? t("overlay.bookTickets") : t("overlay.description")}
                  </h2>
                  {showCenterTeaser && !showEditForm ? (
                    <GoAndDanceTicketsEmbed compact />
                  ) : showEditForm ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-white/50 mb-1">{t("overlay.shortHookLabel")}</label>
                        <textarea
                          value={editShortDescription}
                          onChange={(e) => setEditShortDescription(e.target.value.slice(0, 300))}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                          placeholder={t("overlay.shortHookPlaceholder")}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">{t("overlay.description")}</label>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                          placeholder={t("overlay.descriptionPlaceholder")}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">{t("overlay.aboutContentLabel")}</label>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={6}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                          placeholder={t("overlay.aboutContentPlaceholder")}
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
                          {saving ? t("overlay.saving") : t("overlay.save")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowEditForm(false)}
                          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm"
                        >
                          {t("overlay.cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                      {displayBodyDescription}
                    </p>
                  )}
                </div>
              )}

              {/* FAQ — affichée directement dans la planète FAQ */}
              {isFaqNode && !showEditForm && (
                <div className="border-t border-white/10 px-8 py-6">
                  <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">
                    FAQ
                  </h2>

                  {faqLoading && (
                    <p className="text-white/50 text-sm">{t("overlay.loadingFaq")}</p>
                  )}

                  {!faqLoading && faqItems && faqItems.length === 0 && (
                    <p className="text-white/50 text-sm">{t("overlay.emptyFaq")}</p>
                  )}

                  {!faqLoading && faqItems && faqItems.length > 0 && (
                    <div className="space-y-3">
                      {faqItems.map((item) => (
                        <details
                          key={item.id}
                          className="group rounded-xl bg-white/5 border border-white/10 px-4 py-3 open:bg-white/7 open:border-purple-500/30"
                        >
                          <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                            <span className="text-white font-semibold text-sm">
                              {item.question}
                            </span>
                            <span className="text-white/40 group-open:rotate-180 transition">▾</span>
                          </summary>
                          <div className="mt-3 text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                            {item.answer}
                          </div>
                        </details>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex justify-center">
                    <Link
                      href="/support/faq"
                      className="text-sm font-semibold text-[#f3ac41] underline-offset-4 hover:underline"
                    >
                      {t("overlay.openFaqFullPage")}
                    </Link>
                  </div>
                </div>
              )}

              {isNotreProgrammePlanet && !showEditForm && (
                <div className="border-t border-white/10 px-5 md:px-8 py-6">
                  <FestivalPlanningSchedule variant="overlay" showFullPageLink />
                </div>
              )}

              {isIdentityAdnNode && !showEditForm && (
                <div className="border-t border-white/10 px-5 md:px-8 py-6">
                  <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/50">
                    {t("overlay.identityAdnSectionTitle")}
                  </h2>
                  <OverlayIdentityAdnSection />
                </div>
              )}

              {isOurArtistsNode && !showEditForm && (
                <div className="border-t border-white/10 px-5 md:px-8 py-6">
                  <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/50">
                    {t("overlay.artistsRoster")}
                  </h2>
                  <OverlayArtistsGrid />
                </div>
              )}

              {/* Bouton description : masqué quand le contenu vient d’une page dédiée (artistes, identité, FAQ…) */}
              {canEditDescriptions &&
                !node.description &&
                !showEditForm &&
                !isAllStarStreetBattleNode &&
                !isOurArtistsNode &&
                !isIdentityAdnNode &&
                !isFaqNode && (
                <div className="border-t border-white/10 px-8 py-6">
                  <button
                    type="button"
                    onClick={openEditForm}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-sm font-medium transition"
                  >
                    {t("overlay.addOrEditDescription")}
                  </button>
                </div>
              )}

          {/* Section À propos (contenu détaillé) */}
          {displayAboutContent && (
            <div className="border-t border-white/10 px-8 py-6">
              <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">
                {t("overlay.about")}
              </h2>
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                {displayAboutContent}
              </p>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
