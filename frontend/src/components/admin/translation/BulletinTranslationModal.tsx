"use client";

import { useState, useEffect } from "react";
import {
    previewTranslationAdmin,
    applyTranslationAdmin,
    submitTranslationPending,
    type TranslateTargetLang,
    type AdminTranslatePreviewResponse,
} from "@/lib/adminApi";
import { getAdminBulletinBySlug } from "@/lib/api";
import { TranslationBaselineReminder } from "@/components/admin/translation/TranslationBaselineReminder";

const MODEL = "core.Bulletin";

export type BulletinTranslationModalProps = {
    open: boolean;
    onClose: () => void;
    bulletinSlug: string;
    bulletinId: string;
    /** Textes FR du formulaire (sources de traduction). */
    titleFr: string;
    contentFr: string;
    isAdmin: boolean;
    mode: "ai" | "manual";
    onSuccess: () => void;
};

type LangBlock = { title: string; content_markdown: string };

export function BulletinTranslationModal({
    open,
    onClose,
    bulletinSlug,
    bulletinId,
    titleFr,
    contentFr,
    isAdmin,
    mode,
    onSuccess,
}: BulletinTranslationModalProps) {
    const [step, setStep] = useState<"lang" | "edit">("lang");
    const [targets, setTargets] = useState<TranslateTargetLang[]>([]);
    const [en, setEn] = useState(false);
    const [es, setEs] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [previews, setPreviews] = useState<
        Partial<Record<TranslateTargetLang, { title: AdminTranslatePreviewResponse; content: AdminTranslatePreviewResponse }>>
    >({});
    const [edited, setEdited] = useState<Partial<Record<TranslateTargetLang, LangBlock>>>({});
    const [baseline, setBaseline] = useState<{
        title_en?: string;
        title_es?: string;
        content_markdown_en?: string;
        content_markdown_es?: string;
    }>({});
    const [baselineLoading, setBaselineLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            setStep("lang");
            setTargets([]);
            setEn(false);
            setEs(false);
            setPreviews({});
            setEdited({});
            setBaseline({});
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
        setBaseline({});
        setBaselineLoading(false);
        setError(null);
        setSuccess(null);
    }, [open, mode, bulletinSlug]);

    useEffect(() => {
        if (!open || step !== "edit" || !bulletinSlug) return;
        let cancelled = false;
        setBaselineLoading(true);
        getAdminBulletinBySlug(bulletinSlug)
            .then((b) => {
                if (cancelled) return;
                setBaseline({
                    title_en: b.title_en ?? "",
                    title_es: b.title_es ?? "",
                    content_markdown_en: b.content_markdown_en ?? "",
                    content_markdown_es: b.content_markdown_es ?? "",
                });
            })
            .catch(() => {
                if (!cancelled) setBaseline({});
            })
            .finally(() => {
                if (!cancelled) setBaselineLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [open, step, bulletinSlug]);

    const continueFromLang = async () => {
        const t: TranslateTargetLang[] = [];
        if (en) t.push("en");
        if (es) t.push("es");
        if (t.length === 0) {
            setError("Choisis au moins une langue (anglais et/ou espagnol).");
            return;
        }
        if (!titleFr.trim() || !contentFr.trim()) {
            setError("Renseigne le titre et le contenu en français avant de traduire.");
            return;
        }
        setError(null);
        setTargets(t);
        setStep("edit");

        if (mode === "manual") {
            const init: Partial<Record<TranslateTargetLang, LangBlock>> = {};
            t.forEach((lang) => {
                init[lang] = { title: "", content_markdown: "" };
            });
            setEdited(init);
            return;
        }

        setLoading(true);
        try {
            const nextPreviews: Partial<
                Record<TranslateTargetLang, { title: AdminTranslatePreviewResponse; content: AdminTranslatePreviewResponse }>
            > = {};
            const nextEdited: Partial<Record<TranslateTargetLang, LangBlock>> = {};
            await Promise.all(
                t.map(async (target) => {
                    const [titleRes, contentRes] = await Promise.all([
                        previewTranslationAdmin({
                            model: MODEL,
                            object_id: bulletinId,
                            field: "title",
                            target,
                            source_text: titleFr,
                        }),
                        previewTranslationAdmin({
                            model: MODEL,
                            object_id: bulletinId,
                            field: "content_markdown",
                            target,
                            source_text: contentFr,
                        }),
                    ]);
                    nextPreviews[target] = { title: titleRes, content: contentRes };
                    nextEdited[target] = {
                        title: titleRes.suggestion || "",
                        content_markdown: contentRes.suggestion || "",
                    };
                })
            );
            setPreviews(nextPreviews);
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
            const block = edited[lang];
            if (!block?.title?.trim() || !block?.content_markdown?.trim()) {
                setError(`Complète le titre et le contenu pour ${lang.toUpperCase()}.`);
                return;
            }
        }
        setLoading(true);
        try {
            if (isAdmin) {
                for (const lang of targets) {
                    const block = edited[lang]!;
                    await applyTranslationAdmin({
                        model: MODEL,
                        object_id: bulletinId,
                        field: "title",
                        target: lang,
                        value: block.title,
                    });
                    await applyTranslationAdmin({
                        model: MODEL,
                        object_id: bulletinId,
                        field: "content_markdown",
                        target: lang,
                        value: block.content_markdown,
                    });
                }
                setSuccess("Traductions enregistrées.");
                onSuccess();
            } else {
                const proposal: Partial<Record<TranslateTargetLang, Record<string, string>>> = {};
                for (const lang of targets) {
                    const block = edited[lang]!;
                    proposal[lang] = {
                        title: block.title,
                        content_markdown: block.content_markdown,
                    };
                }
                await submitTranslationPending({
                    model: MODEL,
                    object_id: bulletinId,
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
                    <h2 className="text-lg font-bold text-white">Traduction — Bulletin</h2>
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
                                Langues cibles pour la traduction du titre et du contenu (au moins une) :
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
                                {targets.map((lang) => {
                                    const blTitle =
                                        lang === "en" ? baseline.title_en ?? "" : baseline.title_es ?? "";
                                    const blContent =
                                        lang === "en"
                                            ? baseline.content_markdown_en ?? ""
                                            : baseline.content_markdown_es ?? "";
                                    return (
                                        <div
                                            key={lang}
                                            className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3"
                                        >
                                            <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider">
                                                {lang === "en" ? "Anglais" : "Espagnol"} ({lang})
                                            </h3>
                                            <div className="rounded-lg border border-amber-500/20 bg-amber-950/20 px-2.5 py-2">
                                                <p className="text-[11px] text-amber-100/80 font-medium mb-1">
                                                    Titre — version en ligne ({lang.toUpperCase()})
                                                    {baselineLoading ? (
                                                        <span className="text-white/40"> (chargement…)</span>
                                                    ) : null}
                                                </p>
                                                <p className="text-xs text-white/70 whitespace-pre-wrap break-words">
                                                    {blTitle.trim() ? blTitle : "— Aucun titre enregistré —"}
                                                </p>
                                            </div>
                                            <TranslationBaselineReminder
                                                lang={lang}
                                                markdown={blContent}
                                                loading={baselineLoading}
                                            />
                                            {mode === "ai" && previews[lang] && (
                                                <p className="text-xs text-white/40 line-clamp-2">
                                                    Sources FR — titre : {previews[lang]!.title.source.slice(0, 80)}… ·
                                                    contenu : {previews[lang]!.content.source.slice(0, 80)}…
                                                </p>
                                            )}
                                            <div>
                                                <label className="block text-xs text-white/50 mb-1">Titre traduit</label>
                                                <textarea
                                                    value={edited[lang]?.title ?? ""}
                                                    onChange={(e) =>
                                                        setEdited((prev) => ({
                                                            ...prev,
                                                            [lang]: {
                                                                title: e.target.value,
                                                                content_markdown: prev[lang]?.content_markdown ?? "",
                                                            },
                                                        }))
                                                    }
                                                    disabled={loading}
                                                    rows={2}
                                                    className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15 text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                                    placeholder="Titre"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-white/50 mb-1">
                                                    Contenu (Markdown)
                                                </label>
                                                <textarea
                                                    value={edited[lang]?.content_markdown ?? ""}
                                                    onChange={(e) =>
                                                        setEdited((prev) => ({
                                                            ...prev,
                                                            [lang]: {
                                                                title: prev[lang]?.title ?? "",
                                                                content_markdown: e.target.value,
                                                            },
                                                        }))
                                                    }
                                                    disabled={loading}
                                                    className="w-full min-h-[180px] px-3 py-2 rounded-lg bg-black/30 border border-white/15 text-white text-sm font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                                                    placeholder="Contenu"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
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
