import type { MetadataRoute } from "next";
import { getCourses } from "@/lib/api";
import { getEvents } from "@/lib/api";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://capitaloffusion.fr";

/**
 * Génère /sitemap.xml — liste d’URLs pour les moteurs de recherche.
 * Pages statiques + cours + événements (dynamiques).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/cours`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/evenements`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/explore`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  let coursePages: MetadataRoute.Sitemap = [];
  let eventPages: MetadataRoute.Sitemap = [];

  try {
    const courses = await getCourses();
    coursePages = courses.map((c) => ({
      url: `${baseUrl}/cours/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // API peut être indisponible au build
  }

  try {
    const events = await getEvents({ upcoming: false });
    eventPages = events.map((e) => ({
      url: `${baseUrl}/evenements/${e.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // API peut être indisponible au build
  }

  return [...staticPages, ...coursePages, ...eventPages];
}
