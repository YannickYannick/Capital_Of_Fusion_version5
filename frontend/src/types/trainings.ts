export interface SubscriptionPassApi {
    id: number;
    name: string;
    description: string;
    price: string;
    validity_months: number;
    stripe_payment_url: string;
}

export interface TrainingSessionApi {
    id: number;
    date: string;
    location: string;
    theme: string;
    available_spots: number;
    is_active: boolean;
}
