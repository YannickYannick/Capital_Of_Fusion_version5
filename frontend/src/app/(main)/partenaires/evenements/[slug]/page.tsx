import type { Metadata } from "next";
import Link from "next/link";
import { getPartnerEventBySlug, getApiBaseUrl } from "@/lib/api";
import { notFound } from "next/navigation";

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

  const baseUrl = getApiBaseUrl();
  const imageUrl = event.image
    ? `${baseUrl}${event.image.startsWith("/") ? "" : "/"}${event.image}`
    : null;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/partenaires/evenements"
          className="text-sm text-amber-300 hover:text-white transition"
        >
          ← Retour aux événements partenaires
        </Link>
        <article className="mt-6">
          {imageUrl && (
            <div className="rounded-xl overflow-hidden mb-6 aspect-video bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <span className="text-xs font-medium text-amber-300 uppercase tracking-wide">
            Partenaire · {event.type}
          </span>
          <h1 className="text-3xl font-bold text-white mt-1">{event.name}</h1>
          <p className="mt-2 text-white/70">
            {formatDate(event.start_date)}
            {event.start_date !== event.end_date && (
              <> → {formatDate(event.end_date)}</>
            )}
            {event.location_name && (
              <>
                {" · "}
                <span className="text-white/60">{event.location_name}</span>
              </>
            )}
            {event.node_name && (
              <>
                {" · "}
                <span className="text-white/60">{event.node_name}</span>
              </>
            )}
            {event.partner_name && (
              <>
                {" · "}
                <span className="text-white/60">{event.partner_name}</span>
              </>
            )}
          </p>
          {event.description && (
            <div className="mt-6 prose prose-invert prose-sm max-w-none">
              <p className="text-white/80 whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
