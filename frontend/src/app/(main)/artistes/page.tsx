import { getArtistsForArtistsPage } from "@/lib/api";
import { ArtistesPageClient } from "./ArtistesPageClient";

/** ISR aligné sur getArtistsForArtistsPage (réduit cold start + répétitions). */
export const revalidate = 120;

export default async function ArtistesPage() {
  const { artists, error } = await getArtistsForArtistsPage();
  return <ArtistesPageClient initialArtists={artists} initialError={error} />;
}
