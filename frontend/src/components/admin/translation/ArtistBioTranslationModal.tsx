"use client";

import { useEffect, useState } from "react";
import {
  previewTranslationAdmin,
  applyTranslationAdmin,
  submitTranslationPending,
  type TranslateTargetLang,
  type AdminTranslatePreviewResponse,
} from "@/lib/adminApi";
import { TranslationBaselineReminder } from "@/components/admin/translation/TranslationBaselineReminder";

const MODEL = "users.User";
const FIELD = "bio";

export interface ArtistBioTranslationModalProps {
  open: boolean;
  onClose: () => void;
  /** Texte FR (champ bio) — peut être non sauvegardé. */
  sourceFr: string;
  /** PK utilisateur (API artist.id). */
  objectId: string;
  /** Textes EN/ES déjà en base (rappel). */
  baselineEn: string;
  baselineEs: string;
  isAdmin: boolean;
  mode: "ai" | "manual";
  onSuccess: () => void;
}

export function ArtistBioTranslationModal({
  open,
  onClose,
  sourceFr,
  objectId,
  baselineEn,
  baselineEs,
  isAdmin,
  mode,
  onSuccess,
}: ArtistBioTranslationModalProps) {
  const [step, setStep] = useState<"lang" | "edit">("lang");
  const [targets, setTargets] = useState<TranslateTargetLang[]>([]);
  const [en, setEn] = useState(false);
  const [es, setEs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Partial<Record<TranslateTargetLang, AdminTranslatePreviewResponse | null>>>(
    {}
  );
  const [edited, setEdited] = useState<Partial<Record<TranslateTargetLang, string>>>({});

  useEffect(() => {
    if (!open) {
      setStep("lang");
      setTargets([]);
      setEn(false);
      setEs(false);
      setPreviews({});
      setEdited({});
      setError(null);
      setSuccess(null);
      return;
    }
    setStep("lang");
    setTargets([]);
    setEn(false);
    setEs(false);
    setPreviews({});
    setEdited({});
    setError(null);
    setSuccess(null);
  }, [open, mode]);

  const baselineForLang = (lang: TranslateTargetLang) => (lang === "en" ? baselineEn : baselineEs);

  const continueFromLang = async () => {
    const t: TranslateTargetLang[] = [];
    if (en) t.push("en");
    if (es) t.push("es");
    if (t.length === 0) {
      setError("Choisis au moins une langue (anglais et/ou espagnol).");
      return;
    }
    setError(null);
    setTargets(t);
    setStep("edit");

    if (mode === "manual") {
      const init: Partial<Record<TranslateTargetLang, string>> = {};
      t.forEach((lang) => {
        init[lang] = "";
      });
      setEdited(init);
      return;
    }

    setLoading(true);
    try {
      const next: Partial<Record<TranslateTargetLang, AdminTranslatePreviewResponse>> = {};
      const nextEdited: Partial<Record<TranslateTargetLang, string>> = {};
      await Promise.all(
        t.map(async (target) => {
          const res = await previewTranslationAdmin({
            model: MODEL,
            object_id: objectId,
            field: FIELD,
            target,
            source_text: sourceFr,
          });
          next[target] = res;
          nextEdited[target] = res.suggestion || "";
        })
      );
      setPreviews(next);
      setEdited(nextEdited);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de prévisualisation");
      setStep("lang");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTranslations = async () => {
    setError(null);
    setSuccess(null);
    for (const lang of targets) {
      const v = (edited[lang] ?? "").trim();
      if (!v) {
        setError(`Le texte ${lang.toUpperCase()} est vide.`);
        return;
      }
    }
    setLoading(true);
    try {
      if (isAdmin) {
        for (const lang of targets) {
          await applyTranslationAdmin({
            model: MODEL,
            object_id: objectId,
            field: FIELD,
            target: lang,
            value: edited[lang] ?? "",
          });
        }
        setSuccess("Traductions enregistrées.");
        onSuccess();
      } else {
        const proposal: Partial<Record<TranslateTargetLang, Record<string, string>>> = {};
        for (const lang of targets) {
          proposal[lang] = { [FIELD]: edited[lang] ?? "" };
        }
        await submitTranslationPending({
          model: MODEL,
          object_id: objectId,
          translation_proposal: proposal,
        });
        setSuccess("Proposition envoyée. Un administrateur validera les traductions.");
        onSuccess();
      }
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur d'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-2xl border border-purple-500/30 shadow-2xl"
        style={{
          background: "linear-gradient(135deg, #1a0a2e 0%, #0d0d1a 100%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h2 className="text-lg font-bold text-white">Traduction — Biographie</h2>
          <button type="button" onClick={onClose} className="text-xl text-white/50 hover:text-white" aria-label="Fermer">
            ✕
          </button>
        </div>

        <div className="space-y-4 p-5">
          {step === "lang" && (
            <>
              <p className="text-sm text-white/70">Langues cibles pour la traduction (au moins une) :</p>
              <div className="flex flex-wrap gap-6">
                <label className="flex cursor-pointer items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={en}
                    onChange={(e) => setEn(e.target.checked)}
                    className="rounded border-white/30"
                  />
                  <span>Anglais</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={es}
                    onChange={(e) => setEs(e.target.checked)}
                    className="rounded border-white/30"
                  />
                  <span>Espagnol</span>
                </label>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
            </>
          )}

          {step === "edit" && (
            <>
              {loading && mode === "ai" && Object.keys(previews).length === 0 && (
                <p className="text-sm text-purple-300">Génération des suggestions…</p>
              )}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {targets.map((lang) => (
                  <div key={lang} className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-300">
                      {lang === "en" ? "Anglais" : "Espagnol"} ({lang})
                    </h3>
                    <TranslationBaselineReminder lang={lang} markdown={baselineForLang(lang)} loading={false} />
                    {mode === "ai" && previews[lang] && (
                      <p className="line-clamp-2 text-xs text-white/40">
                        Source FR: {previews[lang]!.source.slice(0, 120)}
                        {previews[lang]!.source.length > 120 ? "…" : ""}
                      </p>
                    )}
                    <textarea
                      value={edited[lang] ?? ""}
                      onChange={(e) => setEdited((prev) => ({ ...prev, [lang]: e.target.value }))}
                      disabled={loading}
                      className="min-h-[200px] w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 font-mono text-sm text-white outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={mode === "manual" ? `Texte en ${lang === "en" ? "anglais" : "espagnol"}` : "Suggestion éditable"}
                    />
                  </div>
                ))}
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              {success && <p className="text-sm text-emerald-400">{success}</p>}
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 p-5">
          <button
            type="button"
            onClick={() => (step === "edit" ? setStep("lang") : onClose())}
            disabled={loading}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
          >
            {step === "edit" ? "← Langues" : "Fermer"}
          </button>
          {step === "lang" && (
            <button
              type="button"
              onClick={continueFromLang}
              disabled={loading}
              className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
            >
              Continuer
            </button>
          )}
          {step === "edit" && (
            <button
              type="button"
              onClick={handleSaveTranslations}
              disabled={loading}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {loading ? "Enregistrement…" : "Enregistrer les traductions"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
