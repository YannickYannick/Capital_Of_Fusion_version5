"use client";

/**
 * Fiche dédiée d'un nœud — hero, à propos, cours et événements du nœud.
 * Style /artistes/profils/[username]. Lien "Explorer en 3D" vers /explore?node=slug.
 */
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AnimatedDiv } from "@/components/shared/AnimatedDiv";
import {
  getOrganizationNodeBySlug,
  getCourses,
  getEvents,
  getApiBaseUrl,
} from "@/lib/api";
import type { OrganizationNodeApi } from "@/types/organization";
import type { CourseListApi } from "@/types/course";
import type { EventApi } from "@/types/event";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function nodeCoverUrl(node: OrganizationNodeApi): string {
  const cover = node.cover_image;
  if (!cover) return "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop";
  if (cover.startsWith("http")) return cover;
  const base = getApiBaseUrl();
  return `${base}${cover.startsWith("/") ? "" : "/"}${cover}`;
}

export default function NoeudProfilPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const [node, setNode] = useState<OrganizationNodeApi | null>(null);
  const [courses, setCourses] = useState<CourseListApi[]>([]);
  const [events, setEvents] = useState<EventApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getOrganizationNodeBySlug(slug),
      getCourses({ node: slug }),
      getEvents({ node: slug }),
    ])
      .then(([n, c, e]) => {
        setNode(n);
        setCourses(c);
        setEvents(e);
      })
      .catch(() => setError("Nœud introuvable"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !node) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl font-bold mb-4 tracking-tighter">Oups !</h1>
        <p className="text-white/60 mb-8 font-light">{error || "Ce nœud n'existe pas."}</p>
        <Link
          href="/organisation/noeuds"
          className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full transition border border-white/10 uppercase tracking-widest text-[10px] font-bold"
        >
          Retour à l'annuaire
        </Link>
      </div>
    );
  }

  const coverUrl = nodeCoverUrl(node);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero — style artiste */}
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

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 max-w-7xl mx-auto">
          <AnimatedDiv animation="fadeInUp">
            <span className="inline-block px-3 py-1 bg-purple-600/80 backdrop-blur-md text-[10px] uppercase tracking-widest font-black rounded-full border border-purple-500/30 text-white mb-4">
              {node.type === "ROOT" ? "Racine" : node.type === "BRANCH" ? "Branche" : "Événement"}
            </span>
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter mb-2">
              <span className="text-purple-500">{node.name}</span>
            </h1>
            {node.short_description && (
              <p className="text-lg text-white/80 max-w-2xl mt-2">{node.short_description}</p>
            )}
          </AnimatedDiv>
        </div>
      </section>

      {/* Contenu + colonne Cours / Événements */}
      <section className="max-w-7xl mx-auto px-8 md:px-16 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2">
          {(node.description || node.content) && (
            <AnimatedDiv animation="fadeIn">
              <h2 className="text-xs uppercase tracking-[0.3em] font-black mb-8 text-white/30 italic underline decoration-purple-500/50 decoration-4 underline-offset-8">
                À propos
              </h2>
              <div className="prose prose-invert max-w-none text-lg text-white/70 leading-relaxed font-light">
                {node.content ? (
                  <p className="whitespace-pre-wrap">{node.content}</p>
                ) : (
                  <p>{node.description || "Aucune description pour ce nœud."}</p>
                )}
              </div>
            </AnimatedDiv>
          )}

          {!node.description && !node.content && (
            <p className="text-white/40 italic">Aucune description pour ce nœud.</p>
          )}
        </div>

        <div className="space-y-12">
          {/* Cours */}
          <AnimatedDiv
            animation="fadeIn"
            className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-3xl"
          >
            <h3 className="text-xs uppercase tracking-[0.3em] font-black mb-6 text-white/30 italic">
              Cours ({courses.length})
            </h3>
            {courses.length === 0 ? (
              <p className="text-white/40 text-sm">Aucun cours pour ce nœud.</p>
            ) : (
              <ul className="space-y-4">
                {courses.slice(0, 8).map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/cours/${c.slug}`}
                      className="block py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/40 transition-all group"
                    >
                      <span className="font-bold text-white group-hover:text-purple-300 transition-colors">
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
                href={`/cours?node=${encodeURIComponent(node.slug)}`}
                className="mt-4 inline-block text-sm text-purple-400 hover:text-purple-300 font-bold"
              >
                Voir tous les cours →
              </Link>
            )}
          </AnimatedDiv>

          {/* Événements */}
          <AnimatedDiv
            animation="fadeIn"
            delay={0.1}
            className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-3xl"
          >
            <h3 className="text-xs uppercase tracking-[0.3em] font-black mb-6 text-white/30 italic">
              Événements ({events.length})
            </h3>
            {events.length === 0 ? (
              <p className="text-white/40 text-sm">Aucun événement pour ce nœud.</p>
            ) : (
              <ul className="space-y-4">
                {events.slice(0, 8).map((ev) => (
                  <li key={ev.id}>
                    <Link
                      href={`/evenements/${ev.slug}`}
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
                href={`/evenements?node=${encodeURIComponent(node.slug)}`}
                className="mt-4 inline-block text-sm text-amber-400 hover:text-amber-300 font-bold"
              >
                Voir tous les événements →
              </Link>
            )}
          </AnimatedDiv>
        </div>
      </section>

      {/* CTA Explore 3D */}
      <section className="max-w-7xl mx-auto px-8 md:px-16 pb-16">
        <Link
          href={`/explore?node=${encodeURIComponent(node.slug)}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm uppercase tracking-widest transition-all border border-purple-500/30"
        >
          Explorer en 3D
        </Link>
      </section>

      <div className="max-w-7xl mx-auto px-8 md:px-16 pb-16">
        <Link
          href="/organisation/noeuds"
          className="text-white/20 hover:text-white transition-all flex items-center gap-3 group text-[10px] uppercase font-black tracking-widest"
        >
          <span className="group-hover:-translate-x-2 transition-transform">←</span>
          Annuaire des nœuds
        </Link>
      </div>
    </div>
  );
}
