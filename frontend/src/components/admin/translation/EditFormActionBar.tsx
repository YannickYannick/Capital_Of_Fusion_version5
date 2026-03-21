"use client";

/**
 * Barre d’actions en bas du formulaire d’édition (Identité COF pilote).
 */
interface EditFormActionBarProps {
    onSave: () => void;
    onCancel: () => void;
    onTranslateAi: () => void;
    onTranslateManual: () => void;
    translateDisabled: boolean;
    saving: boolean;
}

export function EditFormActionBar({
    onSave,
    onCancel,
    onTranslateAi,
    onTranslateManual,
    translateDisabled,
    saving,
}: EditFormActionBarProps) {
    return (
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/10">
            <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 transition"
            >
                {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 transition"
            >
                Annuler
            </button>
            <button
                type="button"
                onClick={onTranslateAi}
                disabled={saving || translateDisabled}
                className="px-4 py-2 rounded-lg bg-emerald-600/30 text-emerald-200 hover:bg-emerald-600/50 border border-emerald-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm"
                title={translateDisabled ? "Cochez « Inclure dans la traduction »" : undefined}
            >
                Traduire (IA)
            </button>
            <button
                type="button"
                onClick={onTranslateManual}
                disabled={saving || translateDisabled}
                className="px-4 py-2 rounded-lg bg-amber-600/25 text-amber-200 hover:bg-amber-600/45 border border-amber-500/35 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm"
                title={translateDisabled ? "Cochez « Inclure dans la traduction »" : undefined}
            >
                Traduire manuellement
            </button>
        </div>
    );
}
