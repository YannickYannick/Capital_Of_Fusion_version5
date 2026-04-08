"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { isStaffOrSuperuser } from "@/lib/staffAccess";
import {
  getAdminPartners,
  getPartnerNodes,
  getPartnerEventAdmin,
  patchPartnerEventAdmin,
} from "@/lib/api";
import type { PartnerMinimalApi, PartnerNodeApi } from "@/types/partner";
import { ProfileLinksFormFields } from "@/components/shared/ProfileLinksFormFields";
import {
  profileLinksFromApi,
  profileLinksToFormState,
  formStateToProfilePayload,
  type ProfileLinksFormState,
} from "@/types/profileLinks";

const inputClass =
  "w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 text-sm";

function toDateInput(iso: string): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export default function EditPartnerEventPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [partners, setPartners] = useState<PartnerMinimalApi[]>([]);
  const [nodes, setNodes] = useState<PartnerNodeApi[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"FESTIVAL" | "PARTY" | "WORKSHOP">("PARTY");
  const [locationName, setLocationName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [nodeId, setNodeId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [linkForm, setLinkForm] = useState<ProfileLinksFormState>(() =>
    profileLinksToFormState(profileLinksFromApi(undefined))
  );

  const canEdit = isStaffOrSuperuser(user);

  const filteredNodes = useMemo(() => {
    if (!partnerId) return [];
    return nodes.filter((n) => n.partner === partnerId);
  }, [nodes, partnerId]);

  useEffect(() => {
    if (!slug || !canEdit) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([getPartnerEventAdmin(slug), getAdminPartners(), getPartnerNodes()])
      .then(([ev, p, n]) => {
        setPartners(p);
        setNodes(n);
        setName(ev.name ?? "");
        setDescription(ev.description ?? "");
        setLinkForm(profileLinksToFormState(profileLinksFromApi(ev.external_links)));
        if (ev.type === "FESTIVAL" || ev.type === "PARTY" || ev.type === "WORKSHOP") {
          setType(ev.type);
        }
        setLocationName(ev.location_name ?? "");
        setStartDate(toDateInput(ev.start_date));
        setEndDate(toDateInput(ev.end_date));
        setPartnerId(ev.partner ?? "");
        setNodeId(ev.node ?? "");
      })
      .catch(() => setError("Événement introuvable ou accès refusé."))
      .finally(() => setLoading(false));
  }, [slug, canEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !slug) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      if (type === "FESTIVAL" && !nodeId) {
        setError("Pour afficher un lien vers la structure organisatrice, sélectionnez une structure.");
        setSaving(false);
        return;
      }
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("description", description.trim());
      fd.append("type", type);
      fd.append("location_name", locationName.trim());
      fd.append("start_date", startDate);
      fd.append("end_date", endDate);
      fd.append("partner", partnerId || "");
      fd.append("node", nodeId || "");
      fd.append("external_links", JSON.stringify(formStateToProfilePayload(linkForm)));
      if (profileFile) fd.append("profile_image", profileFile);
      if (coverFile) fd.append("cover_image", coverFile);
      if (imageFile) fd.append("image", imageFile);
      await patchPartnerEventAdmin(slug, fd);
      setSuccessMessage("Enregistré.");
      setImageFile(null);
      setProfileFile(null);
      setCoverFile(null);
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
        <Link href={`/partenaires/evenements/${encodeURIComponent(slug)}`} className="text-amber-400 hover:underline">
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
        <Link href="/partenaires/evenements" className="text-amber-400 hover:underline mt-2 inline-block">
          ← Événements partenaires
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-16 text-white">
      <Link
        href={`/partenaires/evenements/${encodeURIComponent(slug)}`}
        className="text-white/60 hover:text-white text-sm mb-4 inline-block"
      >
        ← Retour à l&apos;événement
      </Link>
      <h1 className="text-3xl font-bold mb-2">Modifier l&apos;événement partenaire</h1>
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
        <div>
          <label className="block text-white/70 text-sm mb-1">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-white/80"
          />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-1">Nom</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-1">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className={inputClass}>
            <option value="FESTIVAL">Festival</option>
            <option value="PARTY">Soirée</option>
            <option value="WORKSHOP">Atelier</option>
          </select>
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
          <label className="block text-white/70 text-sm mb-1">Lieu (texte)</label>
          <input type="text" value={locationName} onChange={(e) => setLocationName(e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/70 text-sm mb-1">Date de début</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-1">Date de fin</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} required />
          </div>
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-1">Partenaire (marque)</label>
          <select
            value={partnerId}
            onChange={(e) => {
              setPartnerId(e.target.value);
              setNodeId("");
            }}
            className={inputClass}
            required
          >
            <option value="">—</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-1">Structure (optionnel)</label>
          <select value={nodeId} onChange={(e) => setNodeId(e.target.value)} className={inputClass}>
            <option value="">—</option>
            {filteredNodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </div>

        <ProfileLinksFormFields value={linkForm} onChange={setLinkForm} inputClass={inputClass} />

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
            href={`/partenaires/evenements/${encodeURIComponent(slug)}`}
            className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
