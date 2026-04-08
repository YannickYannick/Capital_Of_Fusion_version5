"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { createArtistAdmin, getDanceProfessionsAdmin } from "@/lib/api";
import type { DanceProfessionApi } from "@/types/user";

function PageShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-2xl px-4 sm:px-6 pt-12 pb-24 md:pt-20 md:pb-32 lg:max-w-3xl ${className}`}>
      {children}
    </div>
  );
}

export default function NewArtistPage() {
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations("artistCreate");

  const canEdit = user?.user_type === "STAFF" || user?.user_type === "ADMIN";
  const isAdmin = user?.user_type === "ADMIN";

  const [allProfessions, setAllProfessions] = useState<DanceProfessionApi[]>([]);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [bioEn, setBioEn] = useState("");
  const [bioEs, setBioEs] = useState("");
  const [isStaffMember, setIsStaffMember] = useState(false);
  const [selectedProfessionIds, setSelectedProfessionIds] = useState<Set<string>>(new Set());

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!canEdit) {
      setLoading(false);
      return;
    }
    getDanceProfessionsAdmin()
      .then(setAllProfessions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [canEdit]);

  const toggleProfession = (id: string) => {
    setSelectedProfessionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const usernameHint = useMemo(() => {
    if (!username.trim()) return t("usernameHintDefault");
    return t("usernameHintValue", { value: username.trim() });
  }, [t, username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await createArtistAdmin({
        username: username.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        bio: bio.trim(),
        bio_en: bioEn.trim(),
        bio_es: bioEs.trim(),
        is_staff_member: isStaffMember,
        profession_ids: Array.from(selectedProfessionIds),
      });

      if ("pending" in res) {
        setSuccessMessage(res.message || t("createdPending"));
        return;
      }

      setSuccessMessage(t("createdSuccess"));
      const created = res as { username: string };
      router.push(`/artistes/profils/${encodeURIComponent(created.username)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("createError"));
    } finally {
      setSaving(false);
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

  return (
    <PageShell>
      <header className="mb-10 text-center">
        <Link
          href="/artistes"
          className="mb-8 inline-flex items-center gap-2 text-sm text-white/45 transition-colors hover:text-white"
        >
          {t("backToArtists")}
        </Link>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">{t("title")}</h1>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-white/45">
          {isAdmin ? t("adminDirectHint") : t("staffPendingHint")}
        </p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-10">
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div>
            <label htmlFor="artist-username" className="mb-1.5 block text-sm text-white/70">
              {t("username")}
            </label>
            <input
              id="artist-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
              placeholder={t("usernamePlaceholder")}
              required
            />
            <p className="mt-2 text-xs text-white/40">{usernameHint}</p>
          </div>

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
                  className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-medium transition ${
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
                  {p.name}
                </label>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
          )}
          {successMessage && (
            <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              {successMessage}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/artistes")}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 transition"
              disabled={saving}
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 transition disabled:opacity-50"
              disabled={saving || !username.trim()}
            >
              {saving ? t("saving") : t("create")}
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}

