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
