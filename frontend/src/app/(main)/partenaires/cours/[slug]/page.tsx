import type { Metadata } from "next";
import Link from "next/link";
import { getPartnerCourseBySlug, getApiBaseUrl } from "@/lib/api";
import { notFound } from "next/navigation";
import { PartnerDetailEditWrapper } from "@/components/features/partners/PartnerDetailEditWrapper";
import { ProfileLinksDisplay } from "@/components/shared/ProfileLinksDisplay";
import { profileLinksFromApi } from "@/types/profileLinks";
import type { PartnerCourseApi } from "@/types/partner";

function partnerMediaUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${raw.startsWith("/") ? "" : "/"}${raw}`;
}

function levelsMetaLabel(course: PartnerCourseApi): string {
  const fromSchedules = [
    ...new Set(
      (course.schedules ?? [])
        .map((s) => (s.level_name ?? "").trim())
        .filter(Boolean)
    ),
  ];
  if (fromSchedules.length > 1) return "Plusieurs niveaux";
  if (fromSchedules.length === 1) return fromSchedules[0]!;
  return course.level_name ?? "";
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const course = await getPartnerCourseBySlug(slug);
    const description =
      course.description?.slice(0, 160) ||
      `${course.name} — ${course.style_name}, ${course.level_name}. Partenaires Capital of Fusion.`;
    return {
      title: course.name,
      description,
      openGraph: {
        title: course.name,
        description,
      },
    };
  } catch {
    return { title: "Cours partenaire" };
  }
}

export default async function PartenaireCoursDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let course;
  try {
    course = await getPartnerCourseBySlug(slug);
  } catch {
    notFound();
  }

  const imageUrl = partnerMediaUrl(course.image);
  const linksMerged = profileLinksFromApi(course.external_links);
  const hasLinks =
    linksMerged.instagram.length > 0 ||
    linksMerged.websites.length > 0 ||
    !!linksMerged.facebook.trim() ||
    !!(linksMerged.contact.email || linksMerged.contact.phone || linksMerged.contact.whatsapp);
  const levelsLine = levelsMetaLabel(course);
  const globalLoc = (course.location_name ?? "").trim();
  const descTrim = (course.description ?? "").trim();
  const descLooksRedundant =
    descTrim.length > 0 &&
    descTrim.length < 80 &&
    descTrim.toLowerCase() === course.name.toLowerCase();

  return (
    <div className="min-h-screen bg-black text-white relative">
      <PartnerDetailEditWrapper editUrl={`/partenaires/cours/${encodeURIComponent(slug)}/edit`}>
        {/* Retour : fixed sous la navbar, à droite (évite le logo) et sous le bouton Modifier staff */}
        <div className="fixed top-36 md:top-40 right-4 md:right-8 z-[95] pointer-events-none">
          <Link
            href="/partenaires/cours"
            className="pointer-events-auto inline-block text-xs md:text-sm text-amber-300/95 hover:text-white transition drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]"
          >
            ← Retour aux cours
          </Link>
        </div>

        <section className="relative min-h-[34vh] md:min-h-[40vh] overflow-hidden pt-6">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-amber-950/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/25" />

          <div className="relative z-[1] flex flex-col justify-end min-h-[34vh] md:min-h-[40vh] px-4 md:px-8 pb-8 md:pb-12 max-w-7xl mx-auto">
            <span className="inline-block w-fit px-3 py-1 bg-amber-600/85 backdrop-blur-md text-[10px] uppercase tracking-widest font-black rounded-full border border-amber-500/35 text-white mb-3">
              Partenaire
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter leading-tight">
              <span className="text-amber-500">{course.name}</span>
            </h1>
            <p className="mt-2 text-sm md:text-base text-white/75 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-amber-300 font-semibold">{course.style_name}</span>
              {levelsLine ? (
                <>
                  <span className="text-white/35" aria-hidden>
                    ·
                  </span>
                  <span>{levelsLine}</span>
                </>
              ) : null}
              {course.partner_name ? (
                <>
                  <span className="text-white/35" aria-hidden>
                    ·
                  </span>
                  <span className="text-white/55">{course.partner_name}</span>
                </>
              ) : null}
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Colonne principale */}
            <div className="lg:col-span-8 space-y-8">
              {descTrim && !descLooksRedundant && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
                  <h2 className="text-[10px] uppercase tracking-[0.28em] font-black text-white/35 mb-4">
                    À propos
                  </h2>
                  <div className="prose prose-invert max-w-none text-base text-white/75 leading-relaxed font-light">
                    <p className="whitespace-pre-wrap m-0">{course.description}</p>
                  </div>
                </div>
              )}

              {course.schedules && course.schedules.length > 0 && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6 md:p-8">
                  <h2 className="text-[10px] uppercase tracking-[0.28em] font-black text-amber-200/70 mb-5">
                    Horaires
                  </h2>
                  <ul className="space-y-3 text-sm">
                    {course.schedules.map((s) => (
                      <li
                        key={s.id}
                        className="flex flex-wrap items-baseline gap-x-2 gap-y-1 pb-3 border-b border-white/5 last:border-0 last:pb-0"
                      >
                        <span className="font-semibold text-white tabular-nums">
                          {s.day_display}{" "}
                          <span className="text-amber-200/90">
                            {String(s.start_time).slice(0, 5)} – {String(s.end_time).slice(0, 5)}
                          </span>
                        </span>
                        {s.level_name ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/20 border border-amber-500/35 text-amber-100">
                            {s.level_name}
                          </span>
                        ) : null}
                        <span className="text-white/45 w-full sm:w-auto sm:ml-auto text-right sm:text-left">
                          {(s.location_name || globalLoc || "").trim() || "Lieu à préciser"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Infos pratiques : lieu, structure, réseaux — toujours visible */}
            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
                <h2 className="text-[10px] uppercase tracking-[0.28em] font-black text-white/40 mb-4">
                  Infos pratiques
                </h2>
                <dl className="space-y-4 text-sm">
                  {globalLoc ? (
                    <div>
                      <dt className="text-[10px] uppercase tracking-widest text-white/35 mb-1">Lieu</dt>
                      <dd className="text-white/80">{globalLoc}</dd>
                    </div>
                  ) : null}
                  {course.node_slug ? (
                    <div>
                      <dt className="text-[10px] uppercase tracking-widest text-white/35 mb-1">Structure</dt>
                      <dd>
                        <Link
                          href={`/partenaires/structures/${encodeURIComponent(course.node_slug)}`}
                          className="inline-flex items-center gap-1 font-semibold text-amber-300 hover:text-amber-200 underline underline-offset-4 decoration-amber-500/50"
                        >
                          {course.node_name ?? "Voir la structure"}
                          <span aria-hidden>→</span>
                        </Link>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>

              {hasLinks ? <ProfileLinksDisplay links={linksMerged} accent="amber" /> : null}
            </aside>
          </div>
        </section>
      </PartnerDetailEditWrapper>
    </div>
  );
}
