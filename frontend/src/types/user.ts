/**
 * Types pour les utilisateurs et artistes.
 */

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
    bio: string;
    profile_picture: string | null;
    professions: DanceProfessionApi[];
    dance_level: LevelPublicApi | null;
    is_vibe: boolean;
}
