"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { isStaffOrSuperuser } from "@/lib/staffAccess";
import { usePlanetMusicOverride } from "@/contexts/PlanetMusicOverrideContext";
import { partnerNodeBackgroundMusicOverride } from "@/lib/partnerStructureMusic";
import { getArtists, getPartnerNodeAdmin, patchPartnerNodeAdmin } from "@/lib/api";
import { ProfileLinksFormFields } from "@/components/shared/ProfileLinksFormFields";
import type { PartnerNodeApi } from "@/types/partner";
import type { ArtistApi } from "@/types/user";
import {
  profileLinksFromApi,
  profileLinksToFormState,
  formStateToProfilePayload,
  type ProfileLinksFormState,
} from "@/types/profileLinks";

const inputClass =
  "w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 text-sm";

function artistNumericId(id: string | number): number {
  return typeof id === "number" ? id : parseInt(String(id), 10);
}

function artistDisplayName(a: ArtistApi): string {
  const n = `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim();
  return n || a.username;
}

export default function EditPartnerStructurePage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const { user } = useAuth();
  const { setOverride, setYoutubeAmbientSuspended } = usePlanetMusicOverride();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [linkForm, setLinkForm] = useState<ProfileLinksFormState>(() =>
    profileLinksToFormState(profileLinksFromApi(undefined))
  );
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [musicYoutubeUrl, setMusicYoutubeUrl] = useState("");
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [clearBackgroundMusic, setClearBackgroundMusic] = useState(false);
  const [musicPreviewNode, setMusicPreviewNode] = useState<PartnerNodeApi | null>(null);
  const [catalogArtists, setCatalogArtists] = useState<ArtistApi[]>([]);
  const [linkedArtistIds, setLinkedArtistIds] = useState<number[]>([]);

  const canEdit = isStaffOrSuperuser(user);

  useEffect(() => {
    if (!slug || !canEdit) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getPartnerNodeAdmin(slug)
      .then((n: PartnerNodeApi) => {
        setName(n.name ?? "");
        setShortDescription(n.short_description ?? "");
        setDescription(n.description ?? "");
        setContent(n.content ?? "");
        setCtaText(n.cta_text ?? "");
        setCtaUrl(n.cta_url ?? "");
        setLinkForm(profileLinksToFormState(profileLinksFromApi(n.external_links)));
        setMusicYoutubeUrl(n.background_music_youtube_url ?? "");
        setMusicFile(null);
        setClearBackgroundMusic(false);
        setMusicPreviewNode(n);
        setLinkedArtistIds(
          (n.linked_artists ?? []).map((la) => artistNumericId(la.id)).filter((x) => !Number.isNaN(x))
        );
      })
      .catch(() => setError("Structure introuvable ou accès refusé."))
      .finally(() => setLoading(false));
  }, [slug, canEdit]);

  useEffect(() => {
    if (!canEdit) return;
    getArtists()
      .then(setCatalogArtists)
      .catch(() => setCatalogArtists([]));
  }, [canEdit]);

  useEffect(() => {
    if (!slug) return;
    if (!musicPreviewNode || musicPreviewNode.slug !== slug) return;
    const ov = partnerNodeBackgroundMusicOverride(musicPreviewNode);
    if (ov) {
      setYoutubeAmbientSuspended(false);
      setOverride(ov);
      return;
    }
    setOverride(null);
    setYoutubeAmbientSuspended(false);
  }, [musicPreviewNode, slug, setOverride, setYoutubeAmbientSuspended]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !slug) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("short_description", shortDescription.trim());
      fd.append("description", description.trim());
      fd.append("content", content.trim());
      fd.append("cta_text", ctaText.trim());
      fd.append("cta_url", ctaUrl.trim());
      fd.append("external_links", JSON.stringify(formStateToProfilePayload(linkForm)));
      if (profileFile) fd.append("profile_image", profileFile);
      if (coverFile) fd.append("cover_image", coverFile);
      fd.append("background_music_youtube_url", musicYoutubeUrl.trim());
      if (musicFile) fd.append("background_music", musicFile);
      if (clearBackgroundMusic) fd.append("clear_background_music", "1");
      fd.append("linked_artist_ids", JSON.stringify(linkedArtistIds));
      const updated = await patchPartnerNodeAdmin(slug, fd);
      setSuccessMessage("Enregistré.");
      setProfileFile(null);
      setCoverFile(null);
      setMusicFile(null);
      setClearBackgroundMusic(false);
      setMusicPreviewNode(updated);
      setLinkedArtistIds(
        (updated.linked_artists ?? []).map((la) => artistNumericId(la.id)).filter((x) => !Number.isNaN(x))
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="text-white/80 px-4 pt-24">
        <p>Connexion requise.</p>
        <Link href="/login" className="text-amber-400 hover:underline">
          Se connecter
        </Link>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="text-white/80 px-4 pt-24">
        <p>Droits insuffisants.</p>
        <Link href={`/partenaires/structures/${encodeURIComponent(slug)}`} className="text-amber-400 hover:underline">
          Retour
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-white/80 px-4 pt-24">
        <p>Chargement…</p>
      </div>
    );
  }

  if (error && !name) {
    return (
      <div className="px-4 pt-24">
        <p className="text-red-400">{error}</p>
        <Link href="/partenaires/structures" className="text-amber-400 hover:underline mt-2 inline-block">
          ← Structures partenaires
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-16 text-white">
      <Link
        href={`/partenaires/structures/${encodeURIComponent(slug)}`}
        className="text-white/60 hover:text-white text-sm mb-4 inline-block"
      >
        ← Retour à la structure
      </Link>
      <h1 className="text-3xl font-bold mb-2">Modifier la structure partenaire</h1>
      <p className="text-white/50 text-sm mb-6 font-mono">{slug}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-white/10 rounded-xl p-4">
          <div>
            <label className="block text-white/70 text-sm mb-1">Photo de profil</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfileFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-white/80"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-1">Image de couverture</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-white/80"
            />
          </div>
        </div>

        <div className="border border-amber-500/20 rounded-xl p-4 space-y-3 bg-amber-500/5">
          <p className="text-white/70 text-sm">
            Musique sur la fiche publique : elle remplace le son des vidéos d’accueil du site. En quittant la fiche
            (ou cette page d’édition), le son YouTube du site reste coupé jusqu’à ce que vous repassiez par l’accueil ou
            Explore.
          </p>
          <div>
            <label className="block text-white/70 text-sm mb-1">URL YouTube (prioritaire sur le fichier)</label>
            <input
              type="url"
              value={musicYoutubeUrl}
              onChange={(e) => setMusicYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=…"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-1">Fichier audio (MP3, OGG…)</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setMusicFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-white/80"
            />
          </div>
          {musicPreviewNode?.background_music && (
            <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={clearBackgroundMusic}
                onChange={(e) => setClearBackgroundMusic(e.target.checked)}
                className="rounded border-white/30 bg-white/10 text-amber-500"
              />
              Supprimer le fichier audio actuellement en ligne
            </label>
          )}
        </div>

        <div>
          <label className="block text-white/70 text-sm mb-1">Nom</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-1">Accroche courte</label>
          <input
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            maxLength={300}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-1">Contenu détaillé</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className={`${inputClass} font-mono`}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/70 text-sm mb-1">Texte CTA</label>
            <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-1">URL CTA</label>
            <input type="text" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} className={inputClass} />
          </div>
        </div>

        <ProfileLinksFormFields value={linkForm} onChange={setLinkForm} inputClass={inputClass} />

        <div className="border border-white/10 rounded-xl p-4 space-y-3">
          <label className="block text-white/70 text-sm font-medium">Artistes associés</label>
          <p className="text-white/45 text-xs">
            Cochez les profils de l’annuaire artistes liés à cette structure (plusieurs possibles).
          </p>
          <div className="max-h-56 overflow-y-auto rounded-lg border border-white/10 bg-black/20 p-2 space-y-1">
            {catalogArtists.length === 0 ? (
              <p className="text-white/40 text-sm px-2 py-4">Chargement de l’annuaire…</p>
            ) : (
              catalogArtists.map((a) => {
                const id = artistNumericId(a.id);
                const checked = linkedArtistIds.includes(id);
                return (
                  <label
                    key={a.username}
                    className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-white/5 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setLinkedArtistIds((prev) =>
                          checked ? prev.filter((x) => x !== id) : [...prev, id]
                        );
                      }}
                      className="rounded border-white/30 bg-white/10 text-amber-500 shrink-0"
                    />
                    <span className="text-white/90">{artistDisplayName(a)}</span>
                    <span className="text-white/35 font-mono text-xs truncate">@{a.username}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {successMessage && <p className="text-green-400 text-sm">{successMessage}</p>}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          <Link
            href={`/partenaires/structures/${encodeURIComponent(slug)}`}
            className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
