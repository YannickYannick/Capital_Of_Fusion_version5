import type { MetadataRoute } from "next";
import { getCourses } from "@/lib/api";
import { getEvents } from "@/lib/api";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://capitaloffusion.fr";

/**
 * Évite qu’un fetch API pendu fasse planter le build Vercel (timeout 60s).
 * Inputs: promesse + délai ms. Outputs: valeur ou throw.
 */
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`sitemap fetch timeout (${ms}ms)`)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Génère /sitemap.xml — liste d’URLs pour les moteurs de recherche.
 * Pages statiques + cours + événements (dynamiques).
 * Si l’API est lente / down au build, on garde au moins les pages statiques.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/cours`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/evenements`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/explore`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    {
      url: `${baseUrl}/festival/acces-venue`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  let coursePages: MetadataRoute.Sitemap = [];
  let eventPages: MetadataRoute.Sitemap = [];

  try {
    const courses = await withTimeout(getCourses(), 10_000);
    coursePages = courses.map((c) => ({
      url: `${baseUrl}/cours/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // API peut être indisponible / lente au build
  }

  try {
    const events = await withTimeout(getEvents({ upcoming: false }), 10_000);
    eventPages = events.map((e) => ({
      url: `${baseUrl}/evenements/${e.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // API peut être indisponible / lente au build
  }

  return [...staticPages, ...coursePages, ...eventPages];
}
