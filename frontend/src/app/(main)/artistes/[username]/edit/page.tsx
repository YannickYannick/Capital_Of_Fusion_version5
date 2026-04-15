"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { isStaffOrSuperuser } from "@/lib/staffAccess";
import {
  getArtistAdmin,
  patchArtistAdmin,
  uploadArtistProfilePicture,
  uploadArtistCoverImage,
  getApiBaseUrl,
  getPartnerNodes,
} from "@/lib/api";
import type { PartnerNodeApi } from "@/types/partner";
import { ProfileLinksFormFields } from "@/components/shared/ProfileLinksFormFields";
import type { ArtistApi, DanceProfessionApi } from "@/types/user";
import { formatProfessionChipLabel } from "@/lib/professionLabel";
import {
  profileLinksFromApi,
  profileLinksToFormState,
  formStateToProfilePayload,
  type ProfileLinksFormState,
} from "@/types/profileLinks";
import { EditFormActionBar } from "@/components/admin/translation/EditFormActionBar";
import { TranslationModeCheckboxes } from "@/components/admin/translation/TranslationModeCheckboxes";
import { ArtistBioTranslationModal } from "@/components/admin/translation/ArtistBioTranslationModal";

function photoUrl(pic: string | null | undefined): string {
  if (!pic) return "/images/placeholder-artist.jpg";
  if (pic.startsWith("//")) return `https:${pic}`;
  if (pic.startsWith("http")) return pic;
  const base = getApiBaseUrl().replace(/\/$/, "");
  return `${base}${pic.startsWith("/") ? "" : "/"}${pic}`;
}

/** Conteneur centré, espacement sous la navbar fixe */
function PageShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`mx-auto w-full max-w-2xl px-4 sm:px-6 pt-12 pb-24 md:pt-20 md:pb-32 lg:max-w-3xl ${className}`}
    >
      {children}
    </div>
  );
}

export default function EditArtistPage() {
  const params = useParams();
  const router = useRouter();
  const username = typeof params?.username === "string" ? params.username : "";
  const { user } = useAuth();
  const t = useTranslations("artistEdit");

  const [artist, setArtist] = useState<ArtistApi | null>(null);
  const [allProfessions, setAllProfessions] = useState<DanceProfessionApi[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [bioEn, setBioEn] = useState("");
  const [bioEs, setBioEs] = useState("");
  const [isStaffMember, setIsStaffMember] = useState(false);
  const [selectedProfessionIds, setSelectedProfessionIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [translateAi, setTranslateAi] = useState(false);
  const [translateManual, setTranslateManual] = useState(false);
  const [translationModal, setTranslationModal] = useState<"ai" | "manual" | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [linkForm, setLinkForm] = useState<ProfileLinksFormState>(() =>
    profileLinksToFormState(profileLinksFromApi(undefined))
  );
  const [partnerStructures, setPartnerStructures] = useState<PartnerNodeApi[]>([]);
  const [selectedStructureSlugs, setSelectedStructureSlugs] = useState<Set<string>>(new Set());

  const canEdit = isStaffOrSuperuser(user);
  const isAdmin = user?.user_type === "ADMIN";

  useEffect(() => {
    if (!username || !canEdit) {
      setLoading(false);
      return;
    }
    getArtistAdmin(username)
      .then(({ artist: a, all_professions }) => {
        setArtist(a);
        setAllProfessions(all_professions);
        setFirstName(a.first_name ?? "");
        setLastName(a.last_name ?? "");
        setBio(a.bio ?? "");
        setBioEn(a.bio_en ?? "");
        setBioEs(a.bio_es ?? "");
        setIsStaffMember(!!a.is_staff_member);
        setSelectedProfessionIds(new Set(a.professions.map((p) => p.id)));
        const links = profileLinksFromApi(a.external_links);
        if (!links.contact.phone && a.phone) links.contact.phone = a.phone;
        if (!links.contact.email && a.email) links.contact.email = a.email;
        setLinkForm(profileLinksToFormState(links));
      })
      .catch(() => setError(t("notFoundOrDenied")))
      .finally(() => setLoading(false));
  }, [username, canEdit, t]);

  const refreshArtistFromApi = () => {
    if (!username) return;
    getArtistAdmin(username)
      .then(({ artist: a }) => {
        setArtist(a);
        setBio(a.bio ?? "");
        setBioEn(a.bio_en ?? "");
        setBioEs(a.bio_es ?? "");
      })
      .catch(() => {});
  };

  const toggleProfession = (id: string) => {
    setSelectedProfessionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleStructureSlug = (slug: string) => {
    setSelectedStructureSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const saveArtist = async () => {
    if (!canEdit || !username) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const ext = formStateToProfilePayload(linkForm);
      const updated = await patchArtistAdmin(username, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        bio: bio.trim(),
        bio_en: bioEn.trim(),
        bio_es: bioEs.trim(),
        phone: ext.contact.phone,
        is_staff_member: isStaffMember,
        profession_ids: Array.from(selectedProfessionIds),
        linked_partner_structure_slugs: Array.from(selectedStructureSlugs),
        external_links: ext,
      });
      setArtist(updated);
      setBioEn(updated.bio_en ?? "");
      setBioEs(updated.bio_es ?? "");
      setSelectedStructureSlugs(
        new Set((updated.linked_partner_structures ?? []).map((s) => s.slug))
      );
      setSuccessMessage(t("profileSaved"));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void saveArtist();
  };

  const openTranslate = () => {
    if (!bio.trim()) {
      setError(t("translateNeedFrBio"));
      return;
    }
    if (!translateAi && !translateManual) {
      setError(t("translateNeedMode"));
      return;
    }
    setError(null);
    setTranslationModal(translateAi ? "ai" : "manual");
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !username) return;
    setUploadingPhoto(true);
    setError(null);
    try {
      const updated = await uploadArtistProfilePicture(username, file);
      setArtist(updated);
      setSuccessMessage(t("photoSaved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("photoUploadError"));
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !username) return;
    setUploadingCover(true);
    setError(null);
    try {
      const updated = await uploadArtistCoverImage(username, file);
      setArtist(updated);
      setSuccessMessage(t("coverSaved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("photoUploadError"));
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  };

  if (!user) {
    return (
      <PageShell className="text-center">
        <p className="text-white/80 mb-6 text-lg">{t("loginRequired")}</p>
        <Link
          href="/artistes"
          className="inline-flex items-center justify-center rounded-full px-6 py-3 bg-white/10 text-white hover:bg-white/20 transition border border-white/10"
        >
          {t("backToArtists")}
        </Link>
      </PageShell>
    );
  }

  if (!canEdit) {
    return (
      <PageShell className="text-center">
        <p className="text-white/80 mb-6 text-lg">{t("insufficientRights")}</p>
        <Link
          href="/artistes"
          className="inline-flex items-center justify-center rounded-full px-6 py-3 bg-white/10 text-white hover:bg-white/20 transition border border-white/10"
        >
          {t("backToArtists")}
        </Link>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-6 text-white/60">{t("loading")}</p>
      </PageShell>
    );
  }

  if (error && !artist) {
    return (
      <PageShell className="text-center">
        <div className="rounded-2xl border border-red-500/25 bg-red-500/5 px-6 py-10 backdrop-blur-sm">
          <p className="text-red-400 mb-8">{error}</p>
          <Link
            href="/artistes"
            className="inline-flex items-center justify-center rounded-full px-6 py-3 bg-white/10 text-white hover:bg-white/20 transition border border-white/10"
          >
            {t("backToArtists")}
          </Link>
        </div>
      </PageShell>
    );
  }

  if (!artist) return null;

  return (
    <PageShell>
      <header className="mb-10 text-center">
        <Link
          href={`/artistes/profils/${encodeURIComponent(username)}`}
          className="mb-8 inline-flex items-center gap-2 text-sm text-white/45 transition-colors hover:text-white"
        >
          {t("backToProfile")}
        </Link>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">{t("title")}</h1>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-white/45">
          <span className="font-mono text-purple-400/90">@{artist.username}</span>
        </p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-10">
        <div className="mb-8 space-y-3 border-b border-white/10 pb-8">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-white/35">
            {t("coverSectionLabel")}
          </p>
          <div className="relative group mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 aspect-[21/9] bg-gradient-to-br from-purple-900/40 to-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl(artist.cover_image)}
              alt={t("coverPhotoAlt")}
              className="h-full w-full object-cover transition-opacity group-hover:opacity-80"
            />
            <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleCoverUpload}
                disabled={uploadingCover}
              />
              {uploadingCover ? (
                <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-sm font-semibold text-white">{t("changeCoverPhoto")}</span>
                  <span className="mt-1 text-[10px] uppercase tracking-widest text-white/60">
                    {t("coverFormatHint")}
                  </span>
                </>
              )}
            </label>
          </div>
          <p className="text-center text-xs text-white/40">{t("clickToChangeCover")}</p>
        </div>

        <div className="mb-8 flex flex-col items-center gap-4 border-b border-white/10 pb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-white/35">{t("profilePhotoSectionLabel")}</p>
          <div className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl(artist.profile_picture)}
              alt={t("profilePhotoAlt")}
              className="h-32 w-32 flex-shrink-0 rounded-2xl border border-white/10 object-cover shadow-lg transition-opacity group-hover:opacity-70"
            />
            <label
              className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center rounded-2xl bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
              />
              {uploadingPhoto ? (
                <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="h-6 w-6 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-medium text-white">{t("changePhoto")}</span>
                </>
              )}
            </label>
          </div>
          <p className="text-xs text-white/40">{t("clickToChangePhoto")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="artist-first" className="mb-1.5 block text-sm text-white/70">
                {t("firstName")}
              </label>
              <input
                id="artist-first"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
              />
            </div>
            <div>
              <label htmlFor="artist-last" className="mb-1.5 block text-sm text-white/70">
                {t("lastName")}
              </label>
              <input
                id="artist-last"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-purple-500/20 bg-purple-500/[0.06] p-4 md:p-6">
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-white">{t("bioSectionTitle")}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-white/45">{t("bioFallbackHint")}</p>
            </div>
            <div>
              <label htmlFor="artist-bio-fr" className="mb-1.5 block text-sm font-medium text-white/80">
                {t("bioFrLabel")}
              </label>
              <textarea
                id="artist-bio-fr"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
              />
            </div>
            <div>
              <label htmlFor="artist-bio-en" className="mb-1.5 block text-sm font-medium text-white/80">
                {t("bioEnLabel")}
              </label>
              <textarea
                id="artist-bio-en"
                value={bioEn}
                onChange={(e) => setBioEn(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
              />
            </div>
            <div>
              <label htmlFor="artist-bio-es" className="mb-1.5 block text-sm font-medium text-white/80">
                {t("bioEsLabel")}
              </label>
              <textarea
                id="artist-bio-es"
                value={bioEs}
                onChange={(e) => setBioEs(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
              />
            </div>
          </div>

          <TranslationModeCheckboxes
            useAi={translateAi}
            useManual={translateManual}
            onChangeAi={setTranslateAi}
            onChangeManual={setTranslateManual}
            rowLabel={t("translationRowLabel")}
          />

          <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
            <input
              type="checkbox"
              id="is_staff_member"
              checked={isStaffMember}
              onChange={(e) => setIsStaffMember(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 text-purple-600 focus:ring-purple-500/40"
            />
            <label htmlFor="is_staff_member" className="text-sm text-white/85">
              {t("staffMemberLabel")}
            </label>
          </div>

          <div>
            <p className="mb-1 text-sm text-white/70">{t("professionsLabel")}</p>
            <p className="mb-3 text-xs text-white/45 leading-relaxed">{t("professionsMultiHint")}</p>
            <div className="flex flex-wrap gap-2">
              {allProfessions.map((p) => (
                <label
                  key={p.id}
                  className={`inline-flex min-h-[2.25rem] min-w-[2.5rem] cursor-pointer items-center justify-center rounded-xl border px-3 py-2 text-xs font-medium transition ${
                    selectedProfessionIds.has(p.id)
                      ? "border-purple-400/50 bg-purple-600/40 text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedProfessionIds.has(p.id)}
                    onChange={() => toggleProfession(p.id)}
                  />
                  {formatProfessionChipLabel(p)}
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4 md:p-6">
            <h3 className="text-sm font-semibold tracking-wide text-white">{t("partnerStructuresLabel")}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-white/45">{t("partnerStructuresHint")}</p>
            <div className="mt-4 max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-2">
              {partnerStructures.length === 0 ? (
                <p className="px-2 py-4 text-sm text-white/40">{t("structuresLoading")}</p>
              ) : (
                partnerStructures.map((node) => {
                  const checked = selectedStructureSlugs.has(node.slug);
                  return (
                    <label
                      key={node.slug}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm hover:bg-white/5"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleStructureSlug(node.slug)}
                        className="h-4 w-4 shrink-0 rounded border-white/20 text-amber-500 focus:ring-amber-500/40"
                      />
                      <span className="font-medium text-white/90">{node.name}</span>
                      <span className="ml-auto truncate font-mono text-[10px] text-white/35">{node.slug}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <ProfileLinksFormFields
            value={linkForm}
            onChange={setLinkForm}
            inputClass="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
          />

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
          )}
          {successMessage && (
            <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              {successMessage}
            </p>
          )}

          <EditFormActionBar
            onSave={() => void saveArtist()}
            onCancel={() => router.push(`/artistes/profils/${encodeURIComponent(username)}`)}
            onTranslate={openTranslate}
            translateDisabled={!translateAi && !translateManual}
            saving={saving}
          />
        </form>
      </div>

      {translationModal && (
        <ArtistBioTranslationModal
          open={!!translationModal}
          onClose={() => setTranslationModal(null)}
          sourceFr={bio}
          objectId={String(artist.id)}
          baselineEn={bioEn}
          baselineEs={bioEs}
          isAdmin={isAdmin}
          mode={translationModal}
          onSuccess={() => {
            refreshArtistFromApi();
            router.refresh();
          }}
        />
      )}
    </PageShell>
  );
}
