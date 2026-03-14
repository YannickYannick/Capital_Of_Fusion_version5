/**
 * Page détail d'une information (Identité COF — Dernières informations).
 * Les staff peuvent aussi voir les brouillons et accéder à "Modifier".
 */
import { getBulletinBySlug, getBulletins } from "@/lib/api";
import { BulletinDetailClient } from "./BulletinDetailClient";

export async function generateStaticParams() {
  try {
    const bulletins = await getBulletins();
    return bulletins.map((b) => ({ slug: b.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const bulletin = await getBulletinBySlug(slug);
    return {
      title: `${bulletin.title} | Dernières informations | Identité COF`,
      description: bulletin.title,
    };
  } catch {
    return { title: "Information | Identité COF" };
  }
}

export default async function BulletinDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let initialBulletin: Awaited<ReturnType<typeof getBulletinBySlug>> | null = null;
  try {
    initialBulletin = await getBulletinBySlug(slug);
  } catch {
    initialBulletin = null;
  }

  return <BulletinDetailClient slug={slug} initialBulletin={initialBulletin} />;
}
