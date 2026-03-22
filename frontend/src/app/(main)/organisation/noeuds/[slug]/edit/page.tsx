"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getOrganizationNodeBySlug, patchOrganizationNodeAdmin } from "@/lib/api";
import type { OrganizationNodeApi } from "@/types/organization";

export default function EditOrganizationNodePage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const { user } = useAuth();

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
  const [videoUrl, setVideoUrl] = useState("");
  const [isVisible3d, setIsVisible3d] = useState(true);
  const [planetColor, setPlanetColor] = useState("");
  const [orbitRadius, setOrbitRadius] = useState("");
  const [orbitSpeed, setOrbitSpeed] = useState("");
  const [planetScale, setPlanetScale] = useState("");

  const canEdit = user?.user_type === "STAFF" || user?.user_type === "ADMIN";

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    getOrganizationNodeBySlug(slug)
      .then((n: OrganizationNodeApi) => {
        setName(n.name ?? "");
        setShortDescription(n.short_description ?? "");
        setDescription(n.description ?? "");
        setContent(n.content ?? "");
        setCtaText(n.cta_text ?? "");
        setCtaUrl(n.cta_url ?? "");
        setVideoUrl(n.video_url ?? "");
        setIsVisible3d(!!n.is_visible_3d);
        setPlanetColor(n.planet_color ?? "");
        setOrbitRadius(n.orbit_radius != null ? String(n.orbit_radius) : "");
        setOrbitSpeed(n.orbit_speed != null ? String(n.orbit_speed) : "");
        setPlanetScale(n.planet_scale != null ? String(n.planet_scale) : "");
      })
      .catch(() => setError("Nœud introuvable."))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !slug) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        short_description: shortDescription.trim(),
        description: description.trim(),
        content: content.trim(),
        cta_text: ctaText.trim(),
        cta_url: ctaUrl.trim(),
        video_url: videoUrl.trim(),
        is_visible_3d: isVisible3d,
        planet_color: planetColor.trim(),
      };
      if (orbitRadius.trim() !== "") payload.orbit_radius = Number(orbitRadius);
      if (orbitSpeed.trim() !== "") payload.orbit_speed = Number(orbitSpeed);
      if (planetScale.trim() !== "") payload.planet_scale = Number(planetScale);

      const result = await patchOrganizationNodeAdmin(slug, payload);
      if (result && typeof result === "object" && "pending" in result && result.pending) {
        setSuccessMessage(
          result.message ||
            "Modification enregistrée. Elle sera visible après approbation par un administrateur."
        );
        return;
      }
      setSuccessMessage("Enregistré.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="text-white/80">
        <p>Connexion requise.</p>
        <Link href="/login" className="text-purple-400 hover:underline">
          Se connecter
        </Link>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="text-white/80">
        <p>Droits insuffisants.</p>
        <Link href={`/organisation/noeuds/${encodeURIComponent(slug)}`} className="text-purple-400 hover:underline">
          Retour
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-white/80">
        <p>Chargement…</p>
      </div>
    );
  }

  if (error && !name) {
    return (
      <div>
        <p className="text-red-400">{error}</p>
        <Link href="/organisation/noeuds" className="text-purple-400 hover:underline mt-2 inline-block">
          ← Annuaire des nœuds
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl pb-16">
      <Link
        href={`/organisation/noeuds/${encodeURIComponent(slug)}`}
        className="text-white/60 hover:text-white text-sm mb-4 inline-block"
      >
        ← Retour au nœud
      </Link>
      <h1 className="text-3xl font-bold text-white mb-2">Modifier le nœud</h1>
      <p className="text-white/50 text-sm mb-6">
        Slug URL : <span className="font-mono text-white/70">{slug}</span> (non modifiable ici)
      </p>
      <p className="text-white/40 text-xs mb-6">
        Image de couverture et fichiers 3D : utilise l’admin Django si besoin. Ici : textes et paramètres
        principaux.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white/70 text-sm mb-1">Nom affiché</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500/50"
            required
          />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-1">Accroche courte</label>
          <input
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            maxLength={300}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500/50"
          />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-1">Contenu détaillé (markdown possible)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/70 text-sm mb-1">Texte du bouton CTA</label>
            <input
              type="text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-1">URL du CTA</label>
            <input
              type="text"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-1">Vidéo (URL)</label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_visible_3d"
            checked={isVisible3d}
            onChange={(e) => setIsVisible3d(e.target.checked)}
            className="rounded border-white/20"
          />
          <label htmlFor="is_visible_3d" className="text-white/80 text-sm">
            Visible dans Explore 3D
          </label>
        </div>
        <div className="border border-white/10 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Planète (optionnel)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-white/60 text-xs mb-1">Couleur</label>
              <input
                type="text"
                value={planetColor}
                onChange={(e) => setPlanetColor(e.target.value)}
                placeholder="#a855f7"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1">Rayon orbite</label>
              <input
                type="text"
                value={orbitRadius}
                onChange={(e) => setOrbitRadius(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1">Vitesse orbite</label>
              <input
                type="text"
                value={orbitSpeed}
                onChange={(e) => setOrbitSpeed(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1">Échelle planète</label>
              <input
                type="text"
                value={planetScale}
                onChange={(e) => setPlanetScale(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {successMessage && <p className="text-green-400 text-sm">{successMessage}</p>}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          <Link
            href={`/organisation/noeuds/${encodeURIComponent(slug)}`}
            className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
