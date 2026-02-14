import Link from "next/link";
import { getCourseBySlug, getApiBaseUrl } from "@/lib/api";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Page détail d'un cours — GET /api/courses/<slug>/
 */
export default async function CoursDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let course;
  try {
    course = await getCourseBySlug(slug);
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
          href="/cours"
          className="text-sm text-purple-300 hover:text-white transition"
        >
          ← Retour aux cours
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
          <h1 className="text-3xl font-bold text-white">{course.name}</h1>
          <p className="mt-2 text-white/70">
            <span className="text-purple-300">{course.style_name}</span>
            {" · "}
            <span>{course.level_name}</span>
            {course.node_name && (
              <>
                {" · "}
                <span className="text-white/60">{course.node_name}</span>
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
        </article>
      </div>
    </div>
  );
}
