import type { ArtistApi } from "@/types/user";

/**
 * Biographie affichée selon la langue du site.
 * Si la traduction demandée est vide, retombe sur le français puis sur les autres.
 */
export function getArtistBioForLocale(artist: ArtistApi, locale: string): string {
  const fr = artist.bio?.trim() ?? "";
  const en = artist.bio_en?.trim() ?? "";
  const es = artist.bio_es?.trim() ?? "";
  if (locale === "en") return en || fr;
  if (locale === "es") return es || fr;
  return fr || en || es;
}
