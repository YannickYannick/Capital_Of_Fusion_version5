/**
 * Types Care — Praticiens et services de bien-être.
 */

export interface ServiceCategoryApi {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    order: number;
    services_count: number;
}

export interface CareServiceApi {
    id: string;
    practitioner: string;
    practitioner_name: string;
    practitioner_slug: string;
    category: string | null;
    category_name: string | null;
    title: string;
    slug: string;
    description: string;
    short_description: string;
    duration_minutes: number;
    price: string;
    image: string | null;
    is_available: boolean;
    order: number;
    created_at: string;
    updated_at: string;
}

export interface PractitionerApi {
    id: string;
    name: string;
    slug: string;
    specialty: string;
    bio: string;
    short_bio: string;
    profile_image: string | null;
    phone: string;
    email: string;
    website: string;
    booking_url: string;
    is_active: boolean;
    order: number;
    services: CareServiceApi[];
    services_count: number;
    created_at: string;
    updated_at: string;
}

export interface PractitionerListApi {
    id: string;
    name: string;
    slug: string;
    specialty: string;
    short_bio: string;
    profile_image: string | null;
    booking_url: string;
    is_active: boolean;
    services_count: number;
}
