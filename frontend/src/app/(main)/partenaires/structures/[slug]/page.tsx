"use client";

/**
 * Fiche détail d'une structure partenaire — hero, à propos, cours et événements du partenaire.
 * Style organisation/noeuds/[slug]. Liens vers /partenaires/cours et /partenaires/evenements.
 */
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AnimatedDiv } from "@/components/shared/AnimatedDiv";
import {
  getPartnerNodeBySlug,
  getPartnerCourses,
  getPartnerEvents,
  getApiBaseUrl,
} from "@/lib/api";
import { AdminEditButton } from "@/components/shared/AdminEditButton";
import { ProfileLinksDisplay } from "@/components/shared/ProfileLinksDisplay";
import { profileLinksFromApi } from "@/types/profileLinks";
import { usePlanetMusicOverride } from "@/contexts/PlanetMusicOverrideContext";
import { useAuth } from "@/contexts/AuthContext";
import { isStaffOrSuperuser } from "@/lib/staffAccess";
import { partnerNodeBackgroundMusicOverride } from "@/lib/partnerStructureMusic";
import type { PartnerNodeApi } from "@/types/partner";
import type { PartnerCourseApi } from "@/types/partner";
import type { PartnerEventApi } from "@/types/partner";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function nodeCoverUrl(node: PartnerNodeApi): string {
  const cover = node.cover_image;
  if (!cover) return "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop";
  if (cover.startsWith("http")) return cover;
  const base = getApiBaseUrl();
  return `${base}${cover.startsWith("/") ? "" : "/"}${cover}`;
}

function nodeProfileUrl(profile: string | null | undefined): string | null {
  if (!profile) return null;
  if (profile.startsWith("http")) return profile;
  const base = getApiBaseUrl();
  return `${base}${profile.startsWith("/") ? "" : "/"}${profile}`;
}

function artistThumbUrl(profilePicture: string | null | undefined): string | null {
  return nodeProfileUrl(profilePicture);
}

export default function PartenaireStructureDetailPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const { user } = useAuth();
  const canStaff = isStaffOrSuperuser(user);
  const { setOverride, setYoutubeAmbientSuspended } = usePlanetMusicOverride();
  const [node, setNode] = useState<PartnerNodeApi | null>(null);
  const [courses, setCourses] = useState<PartnerCourseApi[]>([]);
  const [events, setEvents] = useState<PartnerEventApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const documentTitleBeforeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setNode(null);
    Promise.all([
      getPartnerNodeBySlug(slug),
      getPartnerCourses({ node: slug }),
      getPartnerEvents({ node: slug }),
    ])
      .then(([n, c, e]) => {
        setNode(n);
        setCourses(c);
        setEvents(e);
      })
      .catch(() => setError("Structure partenaire introuvable"))
      .finally(() => setLoading(false));
  }, [slug]);

  /**
   * Musique dédiée : même override global que /explore. Elle continue sur les autres pages du site
   * tant que le fond vidéo est actif. Réinitialisation : accueil, Explore, ou ouverture d’une fiche
   * structure sans musique de fond.
   */
  useEffect(() => {
    if (!slug) return;
    if (!node || node.slug !== slug) return;
    const ov = partnerNodeBackgroundMusicOverride(node);
    if (ov) {
      setYoutubeAmbientSuspended(false);
      setOverride(ov);
      return;
    }
    setOverride(null);
    setYoutubeAmbientSuspended(false);
  }, [node, slug, setOverride, setYoutubeAmbientSuspended]);

  useEffect(() => {
    if (!node?.name) return;
    documentTitleBeforeRef.current = document.title;
    document.title = `${node.name} | Structures partenaires`;
    return () => {
      if (documentTitleBeforeRef.current !== null) {
        document.title = documentTitleBeforeRef.current;
        documentTitleBeforeRef.current = null;
      }
    };
  }, [node?.name]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !node) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl font-bold mb-4 tracking-tighter">Oups !</h1>
        <p className="text-white/60 mb-8 font-light">{error || "Cette structure partenaire n'existe pas."}</p>
        <Link
          href="/partenaires/structures"
          className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full transition border border-white/10 uppercase tracking-widest text-[10px] font-bold"
        >
          Retour aux structures partenaires
        </Link>
      </div>
    );
  }

  const coverUrl = nodeCoverUrl(node);
  const profileResolved = nodeProfileUrl(node.profile_image);

  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="absolute top-20 md:top-24 left-0 right-0 z-[90] px-4 md:px-8 pointer-events-none">
        <div className="max-w-7xl mx-auto pointer-events-auto">
          <nav
            aria-label="Fil d’Ariane"
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] md:text-xs text-white/50"
          >
            <Link href="/partenaires" className="hover:text-amber-300 transition-colors">
              Nos partenaires
            </Link>
            <span className="text-white/25" aria-hidden>
              /
            </span>
            <Link href="/partenaires/structures" className="hover:text-amber-300 transition-colors">
              Structures
            </Link>
            <span className="text-white/25" aria-hidden>
              /
            </span>
            <span className="text-white/90 font-semibold truncate max-w-[min(100%,36rem)]" title={node.name}>
              {node.name}
            </span>
          </nav>
          <p className="mt-1 text-[10px] text-white/35 font-mono truncate" title={`/partenaires/structures/${slug}`}>
            /partenaires/structures/{slug}
          </p>
        </div>
      </div>
      <AdminEditButton
        editUrl={`/partenaires/structures/${encodeURIComponent(slug)}/edit`}
        position="fixed-below-nav"
        label="Modifier"
      />
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <Image
          src={coverUrl}
          alt={node.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          unoptimized={coverUrl.startsWith("http") && !coverUrl.includes("localhost")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {profileResolved && (
          <div className="absolute bottom-24 left-8 md:left-16 z-10">
            <div className="relative h-24 w-24 md:h-28 md:w-28 rounded-full border-4 border-amber-500/60 shadow-xl overflow-hidden bg-black/40">
              <Image
                src={profileResolved}
                alt=""
                fill
                className="object-cover"
                sizes="112px"
                unoptimized={
                  profileResolved.startsWith("http") && !profileResolved.includes("localhost")
                }
              />
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 max-w-7xl mx-auto">
          <AnimatedDiv animation="fadeInUp">
            <span className="inline-block px-3 py-1 bg-amber-600/80 backdrop-blur-md text-[10px] uppercase tracking-widest font-black rounded-full border border-amber-500/30 text-white mb-4">
              Partenaire
            </span>
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter mb-2">
              <span className="text-amber-500">{node.name}</span>
            </h1>
            {node.short_description && (
              <p className="text-lg text-white/80 max-w-2xl mt-2">{node.short_description}</p>
            )}
          </AnimatedDiv>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 md:px-16 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2">
          {(node.description || node.content) && (
            <AnimatedDiv animation="fadeIn">
              <h2 className="text-xs uppercase tracking-[0.3em] font-black mb-8 text-white/30 italic underline decoration-amber-500/50 decoration-4 underline-offset-8">
                À propos
              </h2>
              <div className="prose prose-invert max-w-none text-lg text-white/70 leading-relaxed font-light">
                {node.content ? (
                  <p className="whitespace-pre-wrap">{node.content}</p>
                ) : (
                  <p>{node.description || "Aucune description."}</p>
                )}
              </div>
            </AnimatedDiv>
          )}

          {!node.description && !node.content && (
            <p className="text-white/40 italic">Aucune description pour cette structure.</p>
          )}
        </div>

        <div className="space-y-12">
          <AnimatedDiv animation="fadeIn" className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-3xl">
            <h3 className="text-xs uppercase tracking-[0.3em] font-black mb-2 text-white/30 italic">
              Artistes partenaires
            </h3>
            <p className="text-[11px] text-white/40 mb-6 leading-relaxed">
              Profils de l’annuaire associés à cette structure (lien réciproque sur chaque fiche artiste).
            </p>
            {(node.linked_artists?.length ?? 0) > 0 ? (
              <ul className="space-y-2">
                {node.linked_artists!.map((a) => {
                  const label =
                    `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim() || a.username;
                  const thumb = artistThumbUrl(a.profile_picture);
                  return (
                    <li key={a.username}>
                      <Link
                        href={`/artistes/profils/${encodeURIComponent(a.username)}`}
                        className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-white/10 transition-all group"
                      >
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/15 bg-black/40">
                          {thumb ? (
                            <Image
                              src={thumb}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="40px"
                              unoptimized={thumb.startsWith("http") && !thumb.includes("localhost")}
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-xs font-bold text-amber-400/80">
                              {(label.slice(0, 1) || a.username.slice(0, 1)).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-white group-hover:text-amber-300 transition-colors min-w-0 truncate">
                          {label}
                        </span>
                        <span className="text-[10px] text-white/40 font-mono ml-auto shrink-0">
                          @{a.username}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="rounded-xl border border-dashed border-white/15 bg-black/20 px-4 py-6 text-center">
                <p className="text-sm text-white/45">Aucun artiste associé pour l’instant.</p>
                {canStaff ? (
                  <Link
                    href={`/partenaires/structures/${encodeURIComponent(slug)}/edit`}
                    className="mt-3 inline-block text-sm font-semibold text-amber-400 hover:text-amber-300"
                  >
                    Associer des artistes (édition staff) →
                  </Link>
                ) : null}
              </div>
            )}
          </AnimatedDiv>

          <ProfileLinksDisplay links={profileLinksFromApi(node.external_links)} accent="amber" />

          <AnimatedDiv
            animation="fadeIn"
            className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-3xl"
          >
            <h3 className="text-xs uppercase tracking-[0.3em] font-black mb-6 text-white/30 italic">
              Cours ({courses.length})
            </h3>
            {courses.length === 0 ? (
              <p className="text-white/40 text-sm">Aucun cours pour cette structure.</p>
            ) : (
              <ul className="space-y-4">
                {courses.slice(0, 8).map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/partenaires/cours/${c.slug}`}
                      className="block py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/40 transition-all group"
                    >
                      <span className="font-bold text-white group-hover:text-amber-300 transition-colors">
                        {c.name}
                      </span>
                      <span className="block text-xs text-white/50 mt-0.5">
                        {c.style_name} · {c.level_name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {courses.length > 8 && (
              <Link
                href={`/partenaires/cours?node=${encodeURIComponent(node.slug)}`}
                className="mt-4 inline-block text-sm text-amber-400 hover:text-amber-300 font-bold"
              >
                Voir tous les cours →
              </Link>
            )}
          </AnimatedDiv>

          <AnimatedDiv
            animation="fadeIn"
            delay={0.1}
            className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-3xl"
          >
            <h3 className="text-xs uppercase tracking-[0.3em] font-black mb-6 text-white/30 italic">
              Événements ({events.length})
            </h3>
            {events.length === 0 ? (
              <p className="text-white/40 text-sm">Aucun événement pour cette structure.</p>
            ) : (
              <ul className="space-y-4">
                {events.slice(0, 8).map((ev) => (
                  <li key={ev.id}>
                    <Link
                      href={`/partenaires/evenements/${ev.slug}`}
                      className="block py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/40 transition-all group"
                    >
                      <span className="font-bold text-white group-hover:text-amber-300 transition-colors">
                        {ev.name}
                      </span>
                      <span className="block text-xs text-white/50 mt-0.5">
                        {formatDate(ev.start_date)}
                        {ev.location_name ? ` · ${ev.location_name}` : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {events.length > 8 && (
              <Link
                href={`/partenaires/evenements?node=${encodeURIComponent(node.slug)}`}
                className="mt-4 inline-block text-sm text-amber-400 hover:text-amber-300 font-bold"
              >
                Voir tous les événements →
              </Link>
            )}
          </AnimatedDiv>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8 md:px-16 pb-16">
        <Link
          href="/partenaires/structures"
          className="text-white/20 hover:text-white transition-all flex flex-wrap items-center gap-x-3 gap-y-1 group text-[10px] uppercase font-black tracking-widest"
        >
          <span className="group-hover:-translate-x-2 transition-transform">←</span>
          <span>Structures partenaires</span>
          <span
            className="text-white/45 normal-case font-semibold tracking-tight max-w-full truncate"
            title={node.name}
          >
            · {node.name}
          </span>
        </Link>
      </div>
    </div>
  );
}
