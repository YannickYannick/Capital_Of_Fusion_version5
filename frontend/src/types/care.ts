export interface PractitionerApi {
    id: number;
    name: string;
    specialty: string;
    bio: string;
    profile_image: string | null;
    booking_url: string;
}

export interface CareServiceApi {
    id: number;
    practitioner: PractitionerApi;
    name: string;
    description: string;
    duration_minutes: number;
    price: string;
}
