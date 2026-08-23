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
  getStreetBattleRegistrationLinks,
  type OverlayLocale,
} from "@/data/allStarStreetBattlePlanetOverlayFallback";
import {
  ACCES_VENUE_SITE_ENTRY_ASPECT,
  ACCES_VENUE_SITE_ENTRY_IMAGE_SRC,
  ACCES_VENUE_SITE_ENTRY_VIDEO_SRC,
  FESTIVAL_ACCES_VENUE_OVERLAY_HOOK,
  FESTIVAL_ACCES_VENUE_PAGE_HREF,
  FESTIVAL_ACCES_VENUE_TEASER_VIDEO_SRC,
  SITE_ENTRY_PLAN_MARKDOWN_TOKEN,
  getFestivalAccesVenueFallback,
} from "@/data/festivalAccesVenueFallback";
import { SiteEntryPlanMedia } from "@/components/features/festival/SiteEntryPlanMedia";
import { renderMarkdownWithEmbed } from "@/components/shared/MarkdownWithEmbed";
import {
  FESTIVAL_JACK_N_JILL_PAGE_HREF,
  getFestivalJackNJillOverlayDescription,
} from "@/data/festivalJackNJillFallback";
import {
  organizationNodePageHref,
  PARIS_BACHATA_GOANDANCE_EVENT_URL,
} from "@/data/exploreOverlayCtas";
/** Classes prose du corps Markdown de l'overlay (typo compacte sur fond sombre). */
const OVERLAY_BODY_PROSE_CLASS =
  "text-white/70 text-sm leading-relaxed space-y-3 " +
  "[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-white " +
  "[&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-white/90 " +
  "[&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_li]:marker:text-purple-300/90 " +
  "[&_hr]:my-6 [&_hr]:border-0 [&_hr]:h-px [&_hr]:bg-white/20 " +
  "[&_strong]:text-white [&_strong]:font-semibold " +
  "[&_img]:rounded-xl [&_img]:border [&_img]:border-white/15 [&_img]:max-h-[min(52vh,520px)] [&_img]:w-auto [&_img]:max-w-full [&_img]:mx-auto [&_img]:my-4 [&_img]:block [&_img]:object-contain [&_img]:shadow-lg " +
  "[&_p]:mb-3 [&_p:last-child]:mb-0";

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

const OVERLAY_CTA_CLASS =
  "flex-1 flex items-center justify-center gap-2 text-center px-6 py-3 rounded-xl bg-[#f3ac41] border border-[#f3ac41] hover:brightness-110 text-black font-bold transition";

function OverlayPrimaryCta({ href, label, icon }: { href: string; label: string; icon: string }) {
  const content = (
    <>
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </>
  );
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={OVERLAY_CTA_CLASS}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={OVERLAY_CTA_CLASS}>
      {content}
    </Link>
  );
}

/**
 * PlanetOverlay V5 — modal en portail (`document.body`, z-[100] au-dessus de la navbar).
 * Grille 2 colonnes : média (vidéo/image/lettrine) + titre/CTA.
 * Section événements en scroll horizontal. Section à propos.
 */
export function PlanetOverlay({ node, onClose, canEditDescriptions, onNodeUpdated }: PlanetOverlayProps) {
  const t = useTranslations("explore");
  const tPages = useTranslations("pages");
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

  /**
   * Access & Venue — nom affiché « Access & Venue » ; slug legacy parfois
   * `social-world-cup`. Repli = même Markdown que /festival/acces-venue.
   */
  const isAccesVenueNode = useMemo(() => {
    if (!node) return false;
    const slug = (node.slug || "").toLowerCase();
    const name = (node.name || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (slug === "acces-venue" || slug === "access-venue") return true;
    if (slug.includes("acces-venue") || slug.includes("access-venue")) return true;
    if (name.includes("access") && name.includes("venue")) return true;
    if (name.includes("acces") && name.includes("venue")) return true;
    if (name.includes("acceso") && name.includes("venue")) return true;
    const cta = (node.cta_url || "").trim().replace(/\/$/, "");
    if (cta === FESTIVAL_ACCES_VENUE_PAGE_HREF) return true;
    return false;
  }, [node]);

  /** Jack n' Jill Vibe — catégorie amateur ; repli description i18n si API vide ou legacy EN. */
  const isJackNJillNode = useMemo(() => {
    if (!node) return false;
    const slug = (node.slug || "").toLowerCase();
    const name = (node.name || "").toLowerCase();
    if (slug === "jack-n-jill-vibe") return true;
    if (slug.includes("jack") && slug.includes("jill")) return true;
    if (name.includes("jack") && name.includes("jill")) return true;
    const cta = (node.cta_url || "").trim().replace(/\/$/, "");
    if (cta === FESTIVAL_JACK_N_JILL_PAGE_HREF) return true;
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
  const accesVenueOverlayHook = FESTIVAL_ACCES_VENUE_OVERLAY_HOOK[overlayLocale];
  const accesVenueFallbackMarkdown = getFestivalAccesVenueFallback(overlayLocale);
  const jackNJillOverlayDescription = getFestivalJackNJillOverlayDescription(overlayLocale);

  const displayShortForOverlay =
    node.short_description ||
    (isAllStarStreetBattleNode ? allStarOverlayFallback.hook : "") ||
    (isAccesVenueNode ? accesVenueOverlayHook : "");
  const displayBodyDescription =
    isAllStarStreetBattleNode && !showEditForm
      ? allStarOverlayFallback.description
      : isAccesVenueNode && !showEditForm
        ? accesVenueFallbackMarkdown
        : isJackNJillNode && !showEditForm
          ? jackNJillOverlayDescription
          : node.description || "";
  const displayAboutContent =
    node.content ||
    (isAllStarStreetBattleNode && !showEditForm ? allStarOverlayFallback.rules : "");
  const [streetBattleRegisterHref, streetBattleFestivalHref] = isAllStarStreetBattleNode
    ? getStreetBattleRegistrationLinks()
    : ["", ""];

  const ctaUrl = (node.cta_url || "").trim();
  const ctaText = (node.cta_text || "").trim();

  let primaryCta: { href: string; label: string; icon: string };
  if (String(node.type || "").toLowerCase() === "root") {
    primaryCta = { href: PARIS_BACHATA_GOANDANCE_EVENT_URL, label: t("overlay.bookGoAndDance"), icon: "🎟️" };
  } else if (isBookYourHotelNode) {
    primaryCta = { href: "/festival/book-your-hotel", label: t("overlay.bookHotel"), icon: "🏨" };
  } else if (isBookYourPassNode) {
    primaryCta = {
      href: ctaUrl || PARIS_BACHATA_GOANDANCE_EVENT_URL,
      label: ctaText || t("overlay.bookYourPass"),
      icon: "🎟️",
    };
  } else if (isFaqNode) {
    primaryCta = { href: "/support/faq", label: t("overlay.openFaqFullPage"), icon: "❓" };
  } else if (isIdentityAdnNode) {
    primaryCta = {
      href: "/identite-cof/adn-du-festival",
      label: t("overlay.openIdentityFullPage"),
      icon: "✨",
    };
  } else if (isOurArtistsNode) {
    primaryCta = { href: "/artistes", label: t("overlay.browseArtists"), icon: "🎤" };
  } else if (isNotreProgrammePlanet) {
    primaryCta = {
      href: ctaUrl || "/festival/notre-programme",
      label: ctaText || t("overlay.learnMore"),
      icon: "📅",
    };
  } else if (isAccesVenueNode) {
    primaryCta = {
      href: ctaUrl || FESTIVAL_ACCES_VENUE_PAGE_HREF,
      label: ctaText || t("overlay.learnMore"),
      icon: "📍",
    };
  } else if (isJackNJillNode) {
    primaryCta = {
      href: ctaUrl || FESTIVAL_JACK_N_JILL_PAGE_HREF,
      label: ctaText || t("overlay.learnMore"),
      icon: "🏆",
    };
  } else if (ctaUrl) {
    primaryCta = { href: ctaUrl, label: ctaText || t("overlay.learnMore"), icon: "✨" };
  } else {
    primaryCta = {
      href: organizationNodePageHref(node.slug),
      label: t("overlay.learnMore"),
      icon: "✨",
    };
  }

  /**
   * Corps Markdown de l'overlay : rendu HTML dès qu'il contient une image ou le
   * token du plan d'accès (sinon on garde le texte brut pré-formaté).
   */
  const overlayBodyIsMarkdown =
    Boolean(displayBodyDescription.trim()) &&
    (/\!\[[^\]]*\]\([^)]+\)/.test(displayBodyDescription) ||
      displayBodyDescription.includes(SITE_ENTRY_PLAN_MARKDOWN_TOKEN));
  const overlayBodyNode = overlayBodyIsMarkdown
    ? renderMarkdownWithEmbed(displayBodyDescription, OVERLAY_BODY_PROSE_CLASS, {
        token: SITE_ENTRY_PLAN_MARKDOWN_TOKEN,
        node: (
          // Même cadre que les images de l'overlay (plafonnées à 52vh) pour éviter un carré géant.
          <div className="mx-auto w-full max-w-[min(52vh,520px)]">
            <SiteEntryPlanMedia
              imageSrc={ACCES_VENUE_SITE_ENTRY_IMAGE_SRC}
              videoSrc={ACCES_VENUE_SITE_ENTRY_VIDEO_SRC}
              imageAlt={tPages("festivalVenue.siteEntryPlanImageAlt")}
              videoAriaLabel={tPages("festivalVenue.siteEntryPlanVideoAria")}
              showVideoLabel={tPages("festivalVenue.siteEntryPlanShowVideo")}
              showPhotoLabel={tPages("festivalVenue.siteEntryPlanShowPhoto")}
              aspectWidth={ACCES_VENUE_SITE_ENTRY_ASPECT.width}
              aspectHeight={ACCES_VENUE_SITE_ENTRY_ASPECT.height}
            />
          </div>
        ),
      })
    : null;

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
                  {isAccesVenueNode ? (
                    <div className="relative h-full min-h-[260px] w-full bg-black md:min-h-[300px]">
                      <video
                        src={FESTIVAL_ACCES_VENUE_TEASER_VIDEO_SRC}
                        className="absolute inset-0 h-full w-full object-contain bg-black"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        aria-label={node.name}
                      />
                    </div>
                  ) : isAllStarStreetBattleNode && showAllStarOverlayHeroVideo ? (
                    <div className="relative h-full min-h-[260px] w-full bg-black md:min-h-[300px]">
                      <video
                        src={ALL_STAR_STREET_BATTLE_PAGE_HERO_VIDEO_SRC}
                        className="absolute inset-0 h-full w-full object-contain bg-black"
                        autoPlay
                        muted
                        loop
                        playsInline
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
                    {isAllStarStreetBattleNode ? (
                      <>
                        <a
                          href={streetBattleRegisterHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center text-center px-4 py-3 h-12 rounded-xl bg-[#f3ac41] border border-[#f3ac41] hover:brightness-110 text-black text-sm font-bold transition"
                        >
                          {tPages("festivalAllStarStreetBattle.registerCtaPrimary")}
                        </a>
                        <a
                          href={streetBattleFestivalHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center text-center px-4 py-3 h-12 rounded-xl border-2 border-white/30 bg-white/10 hover:bg-white/15 text-white text-sm font-bold transition"
                        >
                          {tPages("festivalAllStarStreetBattle.registerCtaSecondary")}
                        </a>
                      </>
                    ) : (
                      <OverlayPrimaryCta
                        href={primaryCta.href}
                        label={primaryCta.label}
                        icon={primaryCta.icon}
                      />
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
                  ) : overlayBodyNode ? (
                    <div className="space-y-3">{overlayBodyNode}</div>
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
                !isAccesVenueNode &&
                !isJackNJillNode &&
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
