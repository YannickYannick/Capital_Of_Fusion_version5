"use client";

/**
 * Deux colonnes : traduction automatique (IA) ou manuelle — une seule à la fois.
 */
interface TranslationModeCheckboxesProps {
    /** Case « Traduction auto (IA) » */
    useAi: boolean;
    /** Case « Traduction manuelle » */
    useManual: boolean;
    onChangeAi: (checked: boolean) => void;
    onChangeManual: (checked: boolean) => void;
    /** Libellé de la ligne (ex. ce champ) */
    rowLabel?: string;
}

export function TranslationModeCheckboxes({
    useAi,
    useManual,
    onChangeAi,
    onChangeManual,
    rowLabel = "Ce contenu",
}: TranslationModeCheckboxesProps) {
    return (
        <div
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3"
            role="group"
            aria-label="Mode de traduction pour les langues étrangères"
        >
            <p className="text-xs text-white/50 uppercase tracking-wider">Traduction (EN / ES)</p>
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto_auto] gap-3 sm:gap-4 items-center text-sm">
                <span className="text-white/85 font-medium">{rowLabel}</span>
                <label className="flex items-center gap-2 text-white/90 cursor-pointer justify-start sm:justify-center">
                    <input
                        type="checkbox"
                        checked={useAi}
                        onChange={(e) => {
                            const v = e.target.checked;
                            onChangeAi(v);
                            if (v) onChangeManual(false);
                        }}
                        className="rounded border-emerald-500/50 text-emerald-500 focus:ring-emerald-500/50"
                    />
                    <span className="whitespace-nowrap">Auto (IA)</span>
                </label>
                <label className="flex items-center gap-2 text-white/90 cursor-pointer justify-start sm:justify-center">
                    <input
                        type="checkbox"
                        checked={useManual}
                        onChange={(e) => {
                            const v = e.target.checked;
                            onChangeManual(v);
                            if (v) onChangeAi(false);
                        }}
                        className="rounded border-amber-500/50 text-amber-500 focus:ring-amber-500/50"
                    />
                    <span className="whitespace-nowrap">Manuel</span>
                </label>
            </div>
            <p className="text-xs text-white/40">
                Choisis si tu prépares des traductions via l’IA ou à la main ; puis clique sur « Traduire ».
            </p>
        </div>
    );
}
