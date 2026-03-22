"use client";

import { useState, useEffect } from "react";
import {
    previewTranslationAdmin,
    applyTranslationAdmin,
    submitTranslationPending,
    getSiteIdentityTranslationsAdmin,
    type TranslateTargetLang,
    type AdminTranslatePreviewResponse,
} from "@/lib/adminApi";
import { TranslationBaselineReminder } from "@/components/admin/translation/TranslationBaselineReminder";

const MODEL = "core.SiteConfiguration";

export type SiteIdentityField = "vision_markdown" | "history_markdown";

interface SiteIdentityTranslationModalProps {
    open: boolean;
    onClose: () => void;
    /** Champ édité sur cette page. */
    field: SiteIdentityField;
    /** Texte FR du textarea (source de traduction). */
    sourceFr: string;
    /** true = admin / application directe ; false = staff / file d’attente. */
    isAdmin: boolean;
    /** IA : prévisualisation Gemini ; manuel : textareas vides. */
    mode: "ai" | "manual";
    onSuccess: () => void;
}

const FIELD_LABEL: Record<SiteIdentityField, string> = {
    vision_markdown: "Notre vision",
    history_markdown: "Notre histoire",
};

export function SiteIdentityTranslationModal({
    open,
    onClose,
    field,
    sourceFr,
    isAdmin,
    mode,
    onSuccess,
}: SiteIdentityTranslationModalProps) {
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
    const [baselineByLang, setBaselineByLang] = useState<Partial<Record<TranslateTargetLang, string>>>({});
    const [baselineLoading, setBaselineLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            setStep("lang");
            setTargets([]);
            setEn(false);
            setEs(false);
            setPreviews({});
            setEdited({});
            setBaselineByLang({});
            setBaselineLoading(false);
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
        setBaselineByLang({});
        setBaselineLoading(false);
        setError(null);
        setSuccess(null);
    }, [open, mode, field]);

    /** Textes EN/ES déjà en base (rappel au-dessus de chaque colonne). */
    useEffect(() => {
        if (!open || step !== "edit") return;
        let cancelled = false;
        setBaselineLoading(true);
        getSiteIdentityTranslationsAdmin()
            .then((data) => {
                if (cancelled) return;
                const t = data.identity_translations[field];
                setBaselineByLang({ en: t.en, es: t.es });
            })
            .catch(() => {
                if (!cancelled) setBaselineByLang({});
            })
            .finally(() => {
                if (!cancelled) setBaselineLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [open, step, field]);

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
                        field,
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
                        field,
                        target: lang,
                        value: edited[lang] ?? "",
                    });
                }
                setSuccess("Traductions enregistrées.");
                onSuccess();
            } else {
                const proposal: Partial<Record<TranslateTargetLang, Record<string, string>>> = {};
                for (const lang of targets) {
                    proposal[lang] = { [field]: edited[lang] ?? "" };
                }
                await submitTranslationPending({
                    model: MODEL,
                    translation_proposal: proposal,
                });
                setSuccess("Proposition envoyée. Un administrateur validera les traductions.");
                onSuccess();
            }
            setTimeout(() => {
                onClose();
            }, 800);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur d’enregistrement");
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
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                    <h2 className="text-lg font-bold text-white">
                        Traduction — {FIELD_LABEL[field]}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-white/50 hover:text-white text-xl"
                        aria-label="Fermer"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {step === "lang" && (
                        <>
                            <p className="text-sm text-white/70">
                                Langues cibles pour la traduction (au moins une) :
                            </p>
                            <div className="flex flex-wrap gap-6">
                                <label className="flex items-center gap-2 text-white cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={en}
                                        onChange={(e) => setEn(e.target.checked)}
                                        className="rounded border-white/30"
                                    />
                                    <span>Anglais</span>
                                </label>
                                <label className="flex items-center gap-2 text-white cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={es}
                                        onChange={(e) => setEs(e.target.checked)}
                                        className="rounded border-white/30"
                                    />
                                    <span>Espagnol</span>
                                </label>
                            </div>
                            {error && <p className="text-red-400 text-sm">{error}</p>}
                        </>
                    )}

                    {step === "edit" && (
                        <>
                            {loading && mode === "ai" && Object.keys(previews).length === 0 && (
                                <p className="text-purple-300 text-sm">Génération des suggestions…</p>
                            )}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {targets.map((lang) => (
                                    <div
                                        key={lang}
                                        className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2"
                                    >
                                        <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider">
                                            {lang === "en" ? "Anglais" : "Espagnol"} ({lang})
                                        </h3>
                                        <TranslationBaselineReminder
                                            lang={lang}
                                            markdown={baselineByLang[lang] ?? ""}
                                            loading={baselineLoading}
                                        />
                                        {mode === "ai" && previews[lang] && (
                                            <p className="text-xs text-white/40 line-clamp-2">
                                                Source FR: {previews[lang]!.source.slice(0, 120)}
                                                {previews[lang]!.source.length > 120 ? "…" : ""}
                                            </p>
                                        )}
                                        <textarea
                                            value={edited[lang] ?? ""}
                                            onChange={(e) =>
                                                setEdited((prev) => ({ ...prev, [lang]: e.target.value }))
                                            }
                                            disabled={loading}
                                            className="w-full min-h-[200px] px-3 py-2 rounded-lg bg-black/30 border border-white/15 text-white text-sm font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder={mode === "manual" ? `Texte en ${lang === "en" ? "anglais" : "espagnol"}` : "Suggestion éditable"}
                                        />
                                    </div>
                                ))}
                            </div>
                            {error && <p className="text-red-400 text-sm">{error}</p>}
                            {success && <p className="text-emerald-400 text-sm">{success}</p>}
                        </>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 p-5 border-t border-white/10">
                    <button
                        type="button"
                        onClick={() => (step === "edit" ? setStep("lang") : onClose())}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 text-sm"
                    >
                        {step === "edit" ? "← Langues" : "Fermer"}
                    </button>
                    {step === "lang" && (
                        <button
                            type="button"
                            onClick={continueFromLang}
                            disabled={loading}
                            className="px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 text-sm font-semibold disabled:opacity-50"
                        >
                            Continuer
                        </button>
                    )}
                    {step === "edit" && (
                        <button
                            type="button"
                            onClick={handleSaveTranslations}
                            disabled={loading}
                            className="px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 text-sm font-semibold disabled:opacity-50"
                        >
                            {loading ? "Enregistrement…" : "Enregistrer les traductions"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
