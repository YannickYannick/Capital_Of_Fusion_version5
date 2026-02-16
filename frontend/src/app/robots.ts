import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://capitaloffusion.fr";

/**
 * Génère /robots.txt — indique aux moteurs de recherche quelles URLs crawler.
 * Allow tout sauf éventuelles routes à exclure plus tard (ex. /api, /admin).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/login"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
