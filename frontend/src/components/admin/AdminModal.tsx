"use client";

/**
 * AdminModal — Modale générique pour les formulaires admin.
 * Visible uniquement si user.user_type === "ADMIN".
 */
import { useEffect, useRef } from "react";

interface AdminModalProps {
    /** Titre de la modale */
    title: string;
    /** Contenu (formulaire) */
    children: React.ReactNode;
    /** Callback quand on clique sur Sauvegarder */
    onSave?: () => void;
    /** Callback quand on clique sur Supprimer */
    onDelete?: () => void;
    /** Callback pour fermer la modale */
    onClose: () => void;
    /** État de chargement */
    loading?: boolean;
    /** Texte du bouton de sauvegarde */
    saveLabel?: string;
}

export function AdminModal({
    title,
    children,
    onSave,
    onDelete,
    onClose,
    loading = false,
    saveLabel = "Sauvegarder",
}: AdminModalProps) {
    const backdropRef = useRef<HTMLDivElement>(null);

    // Fermer avec Echap
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
            onClick={(e) => {
                if (e.target === backdropRef.current) onClose();
            }}
        >
            <div
                className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
                style={{
                    background: "linear-gradient(135deg, #1a0a2e 0%, #0d0d1a 100%)",
                    border: "1px solid rgba(243,172,65,0.35)",
                    boxShadow: "0 25px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(243,172,65,0.12)",
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">⚙️</span>
                        <h2 className="text-lg font-black text-white">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/40 hover:text-white transition text-xl leading-none"
                        aria-label="Fermer"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">{children}</div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 p-6 border-t border-white/10">
                    {onDelete ? (
                        <button
                            onClick={onDelete}
                            disabled={loading}
                            className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 text-sm font-semibold transition disabled:opacity-40"
                        >
                            🗑️ Supprimer
                        </button>
                    ) : (
                        <div />
                    )}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white/70 text-sm font-semibold transition disabled:opacity-40"
                        >
                            Annuler
                        </button>
                        {onSave && (
                            <button
                                onClick={onSave}
                                disabled={loading}
                                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition disabled:opacity-40"
                            >
                                {loading ? "⏳ Sauvegarde…" : `💾 ${saveLabel}`}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Champ de formulaire stylisé pour AdminModal */
export function AdminField({
    label,
    children,
    required,
}: {
    label: string;
    children: React.ReactNode;
    required?: boolean;
}) {
    return (
        <label className="block">
            <span className="text-xs text-purple-300/80 font-semibold uppercase tracking-widest">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </span>
            <div className="mt-1">{children}</div>
        </label>
    );
}

/** Classes CSS réutilisables pour les inputs admin */
export const adminInputClass =
    "w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/25 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm";

export const adminSelectClass =
    "w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:ring-2 focus:ring-purple-500 outline-none transition text-sm";

export const adminTextareaClass =
    "w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/25 focus:ring-2 focus:ring-purple-500 outline-none transition text-sm resize-y min-h-[80px]";
