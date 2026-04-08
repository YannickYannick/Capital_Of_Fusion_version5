"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { isStaffOrSuperuser } from "@/lib/staffAccess";
import {
  getAdminPartners,
  getPartnerNodes,
  getPartnerCourseMeta,
  getPartnerCourseAdmin,
  patchPartnerCourseAdmin,
} from "@/lib/api";
import type { PartnerCourseMetaApi, PartnerMinimalApi, PartnerNodeApi } from "@/types/partner";
import { ProfileLinksFormFields } from "@/components/shared/ProfileLinksFormFields";
import {
  profileLinksFromApi,
  profileLinksToFormState,
  formStateToProfilePayload,
  type ProfileLinksFormState,
} from "@/types/profileLinks";
import type { PartnerScheduleApi } from "@/types/partner";

const inputClass =
  "w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 text-sm";

type ScheduleDraft = {
  day_of_week: number;
  start_time: string; // HH:MM
  end_time: string;   // HH:MM
  location_name: string;
  level: string;      // UUID ou ""
};

export default function EditPartnerCoursePage() {
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
  const [meta, setMeta] = useState<PartnerCourseMetaApi | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [styleId, setStyleId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [nodeId, setNodeId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [linkForm, setLinkForm] = useState<ProfileLinksFormState>(() =>
    profileLinksToFormState(profileLinksFromApi(undefined))
  );
  const [locationName, setLocationName] = useState("");
  const [schedules, setSchedules] = useState<ScheduleDraft[]>([]);

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
    Promise.all([
      getPartnerCourseAdmin(slug),
      getAdminPartners(),
      getPartnerNodes(),
      getPartnerCourseMeta(),
    ])
      .then(([course, p, n, m]) => {
        setPartners(p);
        setNodes(n);
        setMeta(m);
        setName(course.name ?? "");
        setDescription(course.description ?? "");
        setLocationName(course.location_name ?? "");
        setLinkForm(profileLinksToFormState(profileLinksFromApi(course.external_links)));
        setStyleId(course.style ?? "");
        setLevelId(course.level ?? "");
        setPartnerId(course.partner ?? "");
        setNodeId(course.node ?? "");
        setIsActive(course.is_active !== false);
        setSchedules(
          (course.schedules ?? []).map((s: PartnerScheduleApi) => ({
            day_of_week: s.day_of_week ?? 0,
            start_time: (s.start_time ?? "").slice(0, 5),
            end_time: (s.end_time ?? "").slice(0, 5),
            location_name: s.location_name ?? "",
            level: (s.level as any) ?? "",
          }))
        );
      })
      .catch(() => setError("Cours introuvable ou accès refusé."))
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
      fd.append("description", description.trim());
      fd.append("location_name", locationName.trim());
      fd.append("style", styleId);
      fd.append("level", levelId);
      fd.append("partner", partnerId || "");
      fd.append("node", nodeId || "");
      fd.append("is_active", isActive ? "true" : "false");
      fd.append("external_links", JSON.stringify(formStateToProfilePayload(linkForm)));
      fd.append("schedules", JSON.stringify(schedules));
      if (imageFile) fd.append("image", imageFile);
      await patchPartnerCourseAdmin(slug, fd);
      setSuccessMessage("Enregistré.");
      setImageFile(null);
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
        <Link href={`/partenaires/cours/${encodeURIComponent(slug)}`} className="text-amber-400 hover:underline">
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
        <Link href="/partenaires/cours" className="text-amber-400 hover:underline mt-2 inline-block">
          ← Cours partenaires
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-16 text-white">
      <Link
        href={`/partenaires/cours/${encodeURIComponent(slug)}`}
        className="text-white/60 hover:text-white text-sm mb-4 inline-block"
      >
        ← Retour au cours
      </Link>
      <h1 className="text-3xl font-bold mb-2">Modifier le cours partenaire</h1>
      <p className="text-white/50 text-sm mb-6 font-mono">{slug}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <input
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            className={inputClass}
            placeholder="Ex: Pavillon des Lions, Choisy-le-Roi"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/70 text-sm mb-1">Style</label>
            <select value={styleId} onChange={(e) => setStyleId(e.target.value)} className={inputClass} required>
              <option value="">—</option>
              {meta?.styles.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-1">Niveau</label>
            <select value={levelId} onChange={(e) => setLevelId(e.target.value)} className={inputClass} required>
              <option value="">—</option>
              {meta?.levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-white/30 bg-white/10 text-amber-500"
          />
          Cours actif (visible sur le site)
        </label>
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

        <div className="border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Créneaux</p>
            <button
              type="button"
              onClick={() =>
                setSchedules((prev) => [
                  ...prev,
                  { day_of_week: 0, start_time: "19:00", end_time: "20:00", location_name: "", level: "" },
                ])
              }
              className="px-3 py-1.5 rounded-lg bg-white/10 text-white/90 hover:bg-white/20 text-xs font-bold"
            >
              + Ajouter
            </button>
          </div>
          {schedules.length === 0 ? (
            <p className="text-white/40 text-sm">Aucun créneau.</p>
          ) : (
            <div className="space-y-3">
              {schedules.map((s, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-6 gap-2 bg-black/20 border border-white/10 rounded-xl p-3">
                  <select
                    className={`${inputClass} sm:col-span-2`}
                    value={s.day_of_week}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setSchedules((prev) => prev.map((x, i) => (i === idx ? { ...x, day_of_week: v } : x)));
                    }}
                  >
                    <option value={0}>Lundi</option>
                    <option value={1}>Mardi</option>
                    <option value={2}>Mercredi</option>
                    <option value={3}>Jeudi</option>
                    <option value={4}>Vendredi</option>
                    <option value={5}>Samedi</option>
                    <option value={6}>Dimanche</option>
                  </select>
                  <input
                    type="time"
                    className={`${inputClass} sm:col-span-1`}
                    value={s.start_time}
                    onChange={(e) => setSchedules((prev) => prev.map((x, i) => (i === idx ? { ...x, start_time: e.target.value } : x)))}
                  />
                  <input
                    type="time"
                    className={`${inputClass} sm:col-span-1`}
                    value={s.end_time}
                    onChange={(e) => setSchedules((prev) => prev.map((x, i) => (i === idx ? { ...x, end_time: e.target.value } : x)))}
                  />
                  <select
                    className={`${inputClass} sm:col-span-1`}
                    value={s.level}
                    onChange={(e) => setSchedules((prev) => prev.map((x, i) => (i === idx ? { ...x, level: e.target.value } : x)))}
                    title="Niveau associé à ce créneau"
                  >
                    <option value="">— Niveau —</option>
                    {meta?.levels.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  <div className="sm:col-span-6 grid grid-cols-1 sm:grid-cols-6 gap-2">
                    <input
                      type="text"
                      className={`${inputClass} sm:col-span-5`}
                      value={s.location_name}
                      onChange={(e) => setSchedules((prev) => prev.map((x, i) => (i === idx ? { ...x, location_name: e.target.value } : x)))}
                      placeholder="Lieu (optionnel, sinon le lieu global)"
                    />
                    <button
                      type="button"
                      onClick={() => setSchedules((prev) => prev.filter((_, i) => i !== idx))}
                      className="px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-200 hover:bg-red-500/25 text-sm font-bold"
                    >
                      Suppr.
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
            href={`/partenaires/cours/${encodeURIComponent(slug)}`}
            className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
