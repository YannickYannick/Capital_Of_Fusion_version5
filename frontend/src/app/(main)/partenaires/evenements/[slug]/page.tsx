import type { Metadata } from "next";
import Link from "next/link";
import { getPartnerEventBySlug, getApiBaseUrl } from "@/lib/api";
import { notFound } from "next/navigation";
import { PartnerDetailEditWrapper } from "@/components/features/partners/PartnerDetailEditWrapper";
import { ProfileLinksDisplay } from "@/components/shared/ProfileLinksDisplay";
import { profileLinksFromApi } from "@/types/profileLinks";

function partnerMediaUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${raw.startsWith("/") ? "" : "/"}${raw}`;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const event = await getPartnerEventBySlug(slug);
    const description =
      event.description?.slice(0, 160) ||
      `${event.name} — ${event.type}, ${event.location_name || ""}. Partenaires Capital of Fusion.`;
    return {
      title: event.name,
      description,
      openGraph: {
        title: event.name,
        description,
      },
    };
  } catch {
    return { title: "Événement partenaire" };
  }
}

export default async function PartenaireEvenementDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let event;
  try {
    event = await getPartnerEventBySlug(slug);
  } catch {
    notFound();
  }

  const coverUrl = partnerMediaUrl(event.cover_image) || partnerMediaUrl(event.image);
  const profileUrl = partnerMediaUrl(event.profile_image);

  return (
    <div className="min-h-screen bg-black text-white relative -mt-16">
      <PartnerDetailEditWrapper editUrl={`/partenaires/evenements/${encodeURIComponent(slug)}/edit`}>
        <div className="absolute top-20 md:top-24 left-0 right-0 z-[90] px-4 md:px-8 pointer-events-none">
          <div className="max-w-7xl mx-auto pointer-events-auto">
            <Link
              href="/partenaires/evenements"
              className="text-xs md:text-sm text-amber-300 hover:text-white transition"
            >
              ← Retour aux événements partenaires
            </Link>
          </div>
        </div>

        <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          {coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          {profileUrl && (
            <div className="absolute bottom-24 left-8 md:left-16 z-10">
              <div className="relative h-24 w-24 md:h-28 md:w-28 rounded-full border-4 border-amber-500/60 shadow-xl overflow-hidden bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profileUrl} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 max-w-7xl mx-auto">
            <span className="inline-block px-3 py-1 bg-amber-600/80 backdrop-blur-md text-[10px] uppercase tracking-widest font-black rounded-full border border-amber-500/30 text-white mb-4">
              Partenaire · {event.type}
            </span>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-2">
              <span className="text-amber-500">{event.name}</span>
            </h1>
            <p className="text-white/70">
              {formatDate(event.start_date)}
              {event.start_date !== event.end_date && <> → {formatDate(event.end_date)}</>}
              {event.location_name && (
                <>
                  {" · "}
                  <span className="text-white/60">{event.location_name}</span>
                </>
              )}
              {event.node_name && (
                <>
                  {" · "}
                  {event.node_slug ? (
                    <Link
                      href={`/partenaires/structures/${encodeURIComponent(event.node_slug)}`}
                      className="text-amber-300/90 hover:text-amber-200 underline underline-offset-4 decoration-amber-500/40"
                    >
                      {event.node_name}
                    </Link>
                  ) : (
                    <span className="text-white/60">{event.node_name}</span>
                  )}
                </>
              )}
              {event.partner_name && (
                <>
                  {" · "}
                  <span className="text-white/60">{event.partner_name}</span>
                </>
              )}
            </p>

            {event.node_slug && (
              <div className="mt-4">
                <Link
                  href={`/partenaires/structures/${encodeURIComponent(event.node_slug)}`}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-bold text-amber-200 hover:bg-amber-500/15 hover:border-amber-500/60 transition"
                >
                  Organisé par <span className="underline underline-offset-4">{event.node_name ?? "la structure"}</span> →
                </Link>
              </div>
            )}
          </div>
        </section>

        {event.description && (
          <section className="max-w-7xl mx-auto px-8 md:px-16 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2">
              <div className="prose prose-invert max-w-none text-lg text-white/70 leading-relaxed font-light">
                <p className="whitespace-pre-wrap">{event.description}</p>
              </div>
            </div>
            <div className="space-y-8">
              <ProfileLinksDisplay links={profileLinksFromApi(event.external_links)} accent="amber" />
            </div>
          </section>
        )}
      </PartnerDetailEditWrapper>
    </div>
  );
}
