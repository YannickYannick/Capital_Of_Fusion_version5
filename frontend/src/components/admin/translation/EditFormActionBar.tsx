"use client";

/**
 * Barre d’actions en bas du formulaire d’édition (Identité COF pilote).
 */
interface EditFormActionBarProps {
    onSave: () => void;
    onCancel: () => void;
    onTranslate: () => void;
    translateDisabled: boolean;
    saving: boolean;
}

export function EditFormActionBar({
    onSave,
    onCancel,
    onTranslate,
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
                onClick={onTranslate}
                disabled={saving || translateDisabled}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600/40 to-amber-600/40 text-white hover:from-emerald-500/50 hover:to-amber-500/50 border border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm font-semibold"
                title={
                    translateDisabled
                        ? "Coche Auto (IA) ou Manuel pour ce contenu"
                        : "Ouvrir la traduction (langues puis textes)"
                }
            >
                Traduire
            </button>
        </div>
    );
}
