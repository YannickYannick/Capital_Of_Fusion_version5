/**
 * Types Shop — Catégories et produits de la boutique.
 */

export interface ProductCategoryApi {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    image: string | null;
    order: number;
    is_active: boolean;
    products_count: number;
    created_at: string;
    updated_at: string;
}

export interface ProductApi {
    id: string;
    category: string;
    category_name: string;
    category_slug: string;
    name: string;
    slug: string;
    description: string;
    short_description: string;
    price: string;
    compare_price: string | null;
    image: string | null;
    images: string[];
    sizes: string[];
    colors: string[];
    stock: number;
    is_available: boolean;
    is_featured: boolean;
    in_stock: boolean;
    order: number;
    created_at: string;
    updated_at: string;
}

export interface ProductListApi {
    id: string;
    category_name: string;
    category_slug: string;
    name: string;
    slug: string;
    short_description: string;
    price: string;
    compare_price: string | null;
    image: string | null;
    is_available: boolean;
    is_featured: boolean;
    in_stock: boolean;
}
