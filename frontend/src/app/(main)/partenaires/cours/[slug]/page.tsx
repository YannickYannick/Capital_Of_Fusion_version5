import type { Metadata } from "next";
import Link from "next/link";
import { getPartnerCourseBySlug, getApiBaseUrl } from "@/lib/api";
import { notFound } from "next/navigation";

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

  const baseUrl = getApiBaseUrl();
  const imageUrl = course.image
    ? `${baseUrl}${course.image.startsWith("/") ? "" : "/"}${course.image}`
    : null;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/partenaires/cours"
          className="text-sm text-amber-300 hover:text-white transition"
        >
          ← Retour aux cours partenaires
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
            Partenaire
          </span>
          <h1 className="text-3xl font-bold text-white mt-1">{course.name}</h1>
          <p className="mt-2 text-white/70">
            <span className="text-amber-300">{course.style_name}</span>
            {" · "}
            <span>{course.level_name}</span>
            {course.node_name && (
              <>
                {" · "}
                <span className="text-white/60">{course.node_name}</span>
              </>
            )}
            {course.partner_name && (
              <>
                {" · "}
                <span className="text-white/60">{course.partner_name}</span>
              </>
            )}
          </p>
          {course.description && (
            <div className="mt-6 prose prose-invert prose-sm max-w-none">
              <p className="text-white/80 whitespace-pre-wrap">
                {course.description}
              </p>
            </div>
          )}
          {course.schedules && course.schedules.length > 0 && (
            <div className="mt-8 border-t border-white/10 pt-6">
              <h2 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-3">Horaires</h2>
              <ul className="space-y-2 text-sm text-white/70">
                {course.schedules.map((s) => (
                  <li key={s.id}>
                    {s.day_display} {s.start_time} – {s.end_time}
                    {s.location_name && ` · ${s.location_name}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
