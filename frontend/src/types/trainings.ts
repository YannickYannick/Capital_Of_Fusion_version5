/**
 * Types Trainings — Pass d'abonnement et sessions de formation.
 */

export interface SubscriptionPassApi {
    id: string;
    name: string;
    slug: string;
    price: string;
    description: string;
    benefits: string[];
    duration_days: number;
    sessions_included: number | null;
    is_active: boolean;
    order: number;
    created_at: string;
    updated_at: string;
}

export interface TrainingSessionApi {
    id: string;
    title: string;
    slug: string;
    description: string;
    instructor: string | null;
    instructor_name: string;
    instructor_display: string;
    date: string;
    duration_minutes: number;
    capacity: number;
    location: string;
    level: string | null;
    level_name: string | null;
    is_cancelled: boolean;
    registrations_count: number;
    spots_left: number;
    created_at: string;
    updated_at: string;
}

export interface TrainingRegistrationApi {
    id: string;
    user: string;
    user_username: string;
    session: string;
    session_title: string;
    status: "confirmed" | "waitlist" | "cancelled";
    created_at: string;
}
