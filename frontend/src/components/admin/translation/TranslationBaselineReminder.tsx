"use client";

import { useMemo, useState } from "react";
import { markdownToHtml } from "@/lib/markdownToHtml";

const proseClasses =
    "text-white/85 leading-relaxed text-xs [&_a]:text-purple-400 [&_a:hover]:underline [&_h2]:mt-3 [&_h2]:text-base [&_ul]:list-disc [&_ol]:list-decimal [&_pre]:bg-white/5 [&_pre]:p-2 [&_pre]:rounded [&_pre]:text-[11px]";

export interface TranslationBaselineReminderProps {
    /** Code langue pour le libellé */
    lang: "en" | "es";
    /** Contenu actuellement enregistré en base pour cette langue (avant la session en cours). */
    markdown: string;
    loading?: boolean;
}

/**
 * Rappel du texte EN/ES déjà en ligne, au-dessus du textarea de traduction dans la modale.
 */
export function TranslationBaselineReminder({ lang, markdown, loading }: TranslationBaselineReminderProps) {
    const [open, setOpen] = useState(true);
    const label = lang === "en" ? "Anglais" : "Espagnol";

    const html = useMemo(() => markdownToHtml(markdown || ""), [markdown]);

    return (
        <section
            className="rounded-lg border border-amber-500/20 bg-amber-950/20 overflow-hidden"
            aria-label={`Texte ${label} actuellement en ligne`}
        >
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between gap-2 px-2.5 py-2 text-left text-xs font-medium text-amber-100/90 hover:bg-white/5 transition"
            >
                <span>
                    Version en ligne ({label}) — avant cette traduction
                    {loading ? <span className="text-white/40 font-normal ml-1">(chargement…)</span> : null}
                </span>
                <span className="text-white/40 shrink-0" aria-hidden>
                    {open ? "▼" : "▶"}
                </span>
            </button>
            {open && !loading && (
                <div className="border-t border-amber-500/15 px-2.5 pb-2.5 pt-1.5">
                    <p className="text-[11px] text-white/45 mb-1.5">
                        Aperçu du rendu tel qu’affiché sur le site pour cette langue (dernière version
                        enregistrée).
                    </p>
                    <div
                        className={`max-h-[min(200px,28vh)] overflow-y-auto rounded-md border border-white/10 bg-black/25 px-2 py-1.5 ${proseClasses} prose prose-invert max-w-none`}
                    >
                        {markdown.trim() ? (
                            <div dangerouslySetInnerHTML={{ __html: html }} />
                        ) : (
                            <p className="text-white/35 italic text-xs m-0">
                                Aucune traduction enregistrée pour le moment.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
