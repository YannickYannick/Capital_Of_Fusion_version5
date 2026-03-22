"use client";

import { useMemo, useState } from "react";
import { markdownToHtml } from "@/lib/markdownToHtml";

const proseClasses =
    "text-white/90 leading-relaxed text-sm [&_a]:text-purple-400 [&_a:hover]:underline [&_h2]:mt-4 [&_h2]:text-lg [&_h3]:mt-3 [&_ul]:list-disc [&_ol]:list-decimal [&_pre]:bg-white/5 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:text-xs";

export interface MarkdownPreviewPanelProps {
    /** Contenu Markdown / HTML à prévisualiser (souvent le texte de l’éditeur). */
    markdown: string;
    /** Libellé court pour l’en-tête (ex. « Notre vision »). */
    contextLabel?: string;
    /** Version enregistrée sur le serveur : affichée en onglet pour comparaison « avant modification ». */
    savedBaseline?: string | null;
    /** Ouvert par défaut (aperçu du texte actuel). */
    defaultOpen?: boolean;
}

/**
 * Aperçu du rendu HTML/Markdown, typiquement placé au-dessus du bloc traduction.
 */
export function MarkdownPreviewPanel({
    markdown,
    contextLabel,
    savedBaseline,
    defaultOpen = true,
}: MarkdownPreviewPanelProps) {
    const [open, setOpen] = useState(defaultOpen);
    const [tab, setTab] = useState<"current" | "saved">("current");

    const hasBaseline =
        typeof savedBaseline === "string" && savedBaseline.trim().length > 0;
    const baselineDiffers = hasBaseline && savedBaseline!.trim() !== markdown.trim();

    const htmlCurrent = useMemo(() => markdownToHtml(markdown || ""), [markdown]);
    const htmlSaved = useMemo(
        () => (hasBaseline ? markdownToHtml(savedBaseline!) : ""),
        [hasBaseline, savedBaseline]
    );

    const activeHtml = tab === "current" ? htmlCurrent : htmlSaved;

    return (
        <section
            className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden"
            aria-label="Aperçu du rendu"
        >
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium text-white/90 hover:bg-white/5 transition"
            >
                <span>
                    Aperçu du rendu
                    {contextLabel ? (
                        <span className="font-normal text-white/50"> — {contextLabel}</span>
                    ) : null}
                </span>
                <span className="text-white/50 shrink-0" aria-hidden>
                    {open ? "▼" : "▶"}
                </span>
            </button>

            {open && (
                <div className="border-t border-white/10 px-3 pb-3 pt-2">
                    <p className="text-xs text-white/45 mb-2">
                        Tel qu’affiché sur le site (FR). Utile avant d’ouvrir la traduction.
                    </p>

                    {hasBaseline && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            <button
                                type="button"
                                onClick={() => setTab("current")}
                                className={`text-xs px-2 py-1 rounded-md border transition ${
                                    tab === "current"
                                        ? "bg-purple-500/25 border-purple-400/50 text-white"
                                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                                }`}
                            >
                                Texte dans l’éditeur
                            </button>
                            <button
                                type="button"
                                onClick={() => setTab("saved")}
                                className={`text-xs px-2 py-1 rounded-md border transition ${
                                    tab === "saved"
                                        ? "bg-purple-500/25 border-purple-400/50 text-white"
                                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                                }`}
                            >
                                Version enregistrée
                                {baselineDiffers ? (
                                    <span className="ml-1 text-amber-300/90">(différent)</span>
                                ) : null}
                            </button>
                        </div>
                    )}

                    <div
                        className={`max-h-[min(320px,45vh)] overflow-y-auto rounded-lg border border-white/5 bg-black/20 px-3 py-2 ${proseClasses} prose prose-invert max-w-none`}
                    >
                        {activeHtml.trim() ? (
                            <div dangerouslySetInnerHTML={{ __html: activeHtml }} />
                        ) : (
                            <p className="text-white/35 italic text-sm m-0">(vide)</p>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
