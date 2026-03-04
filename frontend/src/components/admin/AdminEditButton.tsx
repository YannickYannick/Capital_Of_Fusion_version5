"use client";

/**
 * AdminEditButton — Bouton ✏️ flottant visible uniquement pour les admins.
 * Utilisé sur les cartes/éléments pour ouvrir la modale admin.
 */
import { useAuth } from "@/contexts/AuthContext";

interface AdminEditButtonProps {
    /** Callback pour modifier cet élément */
    onEdit: () => void;
    /** Positionnement absolu (par défaut : top-2 right-2) */
    className?: string;
    /** Label accessible */
    label?: string;
}

export function AdminEditButton({
    onEdit,
    className = "absolute top-2 right-2",
    label = "Modifier",
}: AdminEditButtonProps) {
    const { user } = useAuth();
    if (user?.user_type !== "ADMIN") return null;

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onEdit();
            }}
            title={label}
            aria-label={label}
            className={`${className} z-10 flex items-center justify-center w-8 h-8 rounded-full bg-purple-600/80 hover:bg-purple-500 text-white text-sm shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 border border-purple-400/30`}
        >
            ✏️
        </button>
    );
}

interface AdminAddButtonProps {
    /** Callback pour créer un nouvel élément */
    onAdd: () => void;
    /** Label du bouton */
    label?: string;
}

/**
 * AdminAddButton — Bouton ➕ visible uniquement pour les admins.
 * Placé en haut de section pour créer du nouveau contenu.
 */
export function AdminAddButton({ onAdd, label = "Ajouter" }: AdminAddButtonProps) {
    const { user } = useAuth();
    if (user?.user_type !== "ADMIN") return null;

    return (
        <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 hover:text-white text-sm font-semibold transition-all duration-200 hover:scale-105"
        >
            <span className="text-base">➕</span>
            {label}
        </button>
    );
}
