export interface ProjectCategoryApi {
    id: number;
    name: string;
    slug: string;
    description: string;
}

export interface ProjectApi {
    id: number;
    category: ProjectCategoryApi;
    title: string;
    slug: string;
    summary: string;
    content: string;
    cover_image: string | null;
    start_date: string | null;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'UPCOMING';
}

export type ProjectStatus = ProjectApi['status'];

/** Configuration des couleurs et labels par statut de projet.
 *  Source unique de vérité — import depuis cette fichier dans chaque page. */
export const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; dot: string }> = {
    IN_PROGRESS: {
        label: "En cours",
        color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        dot: "bg-emerald-400",
    },
    UPCOMING: {
        label: "À venir",
        color: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        dot: "bg-purple-400",
    },
    COMPLETED: {
        label: "Terminé",
        color: "bg-white/10 text-white/50 border-white/10",
        dot: "bg-white/40",
    },
};
