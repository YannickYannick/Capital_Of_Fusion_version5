/**
 * Types pour les utilisateurs et artistes.
 */

import type { ProfileExternalLinks } from "./profileLinks";

export interface DanceProfessionApi {
    id: string;
    name: string;
    slug: string;
}

export interface LevelPublicApi {
    id: string;
    name: string;
    slug: string;
    color: string;
}

export interface ArtistApi {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    /** Biographie (français) */
    bio: string;
    /** Biographie anglais */
    bio_en?: string;
    /** Biographie espagnol */
    bio_es?: string;
    profile_picture: string | null;
    /** Bannière du profil public (Cloudinary / média) */
    cover_image?: string | null;
    /** URL de la photo de profil (alias API / champ backend) */
    profile_image?: string | null;
    /** Nom d’affichage (optionnel, sinon first_name + last_name) */
    display_name?: string | null;
    professions: DanceProfessionApi[];
    /** Styles de danse (optionnel, selon l’API) */
    styles?: Array<{ id: string; name: string }>;
    dance_level: LevelPublicApi | null;
    is_staff_member: boolean;
    /** Ordre sur /artistes (API : plus petit = plus haut). */
    artist_display_order?: number;
    is_vibe: boolean;
    external_links?: ProfileExternalLinks;
    /** Structures partenaires liées à ce profil (M2M). */
    linked_partner_structures?: { name: string; slug: string }[];
}
