"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { isStaffOrSuperuser } from "@/lib/staffAccess";
import { getPartnerBrandAdmin, patchPartnerBrandAdmin, getApiBaseUrl } from "@/lib/api";

const inputClass =
  "w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 text-sm";

function logoUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  const base = getApiBaseUrl();
  return `${base}${raw.startsWith("/") ? "" : "/"}${raw}`;
}

export default function EditPartnerBrandPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [brandSlug, setBrandSlug] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);

  const canEdit = isStaffOrSuperuser(user);

  useEffect(() => {
    if (!slug || !canEdit) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getPartnerBrandAdmin(slug)
      .then((b) => {
        setName(b.name ?? "");
        setBrandSlug(b.slug ?? "");
        setDescription(b.description ?? "");
        setCurrentLogo(b.logo);
      })
      .catch(() => setError("Marque introuvable ou accès refusé."))
      .finally(() => setLoading(false));
  }, [slug, canEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !slug) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("slug", brandSlug.trim());
      fd.append("description", description.trim());
      if (logoFile) fd.append("logo", logoFile);
      const updated = await patchPartnerBrandAdmin(slug, fd);
      setCurrentLogo(updated.logo);
      setLogoFile(null);
      setSuccessMessage("Enregistré.");
      if (updated.slug !== slug) {
        router.replace(`/partenaires/marques/${encodeURIComponent(updated.slug)}/edit`);
      }
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
        <Link href="/partenaires/marques" className="text-amber-400 hover:underline">
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
        <Link href="/partenaires/marques" className="text-amber-400 hover:underline mt-2 inline-block">
          ← Marques partenaires
        </Link>
      </div>
    );
  }

  const resolvedLogo = logoUrl(currentLogo);

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-16 text-white">
      <Link href="/partenaires/marques" className="text-white/60 hover:text-white text-sm mb-4 inline-block">
        ← Marques partenaires
      </Link>
      <h1 className="text-3xl font-bold mb-2">Modifier la marque partenaire</h1>
      <p className="text-white/50 text-sm mb-6 font-mono">{slug}</p>

      {resolvedLogo && (
        <div className="mb-6 rounded-xl border border-white/10 p-4 bg-white/5 inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resolvedLogo} alt="" className="max-h-24 w-auto object-contain" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white/70 text-sm mb-1">Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-white/80"
          />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-1">Nom</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-1">Slug (URL)</label>
          <input type="text" value={brandSlug} onChange={(e) => setBrandSlug(e.target.value)} className={inputClass} required />
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
          <Link href="/partenaires/marques" className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
