import type { PlanetMusicOverride } from "@/contexts/PlanetMusicOverrideContext";
import type { PartnerNodeApi } from "@/types/partner";

/**
 * Construit l’override de musique pour `PlanetMusicOverrideContext` à partir d’un nœud partenaire.
 * Priorité : URL YouTube si non vide, sinon fichier audio.
 */
export function partnerNodeBackgroundMusicOverride(
  node: Pick<PartnerNodeApi, "background_music" | "background_music_youtube_url">
): PlanetMusicOverride | null {
  const yt = (node.background_music_youtube_url ?? "").trim();
  if (yt) return { type: "youtube", youtubeUrl: yt };
  const file = (node.background_music ?? "").trim();
  if (file) return { type: "file", fileUrl: file };
  return null;
}
