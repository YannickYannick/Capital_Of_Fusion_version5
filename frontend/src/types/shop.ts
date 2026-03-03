export interface ProductCategoryApi {
    id: number;
    name: string;
    slug: string;
    description: string;
}

export interface ProductApi {
    id: number;
    category: ProductCategoryApi;
    name: string;
    slug: string;
    description: string;
    price: string;
    image: string | null;
    in_stock: boolean;
    stripe_payment_url: string;
}
