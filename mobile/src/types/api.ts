import type { ProfileExternalLinks } from '@/src/lib/profileLinks';

export type DanceProfessionApi = {
  id: string;
  name: string;
  slug: string;
};

export type ArtistApi = {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  bio: string;
  bio_en?: string;
  bio_es?: string;
  profile_picture: string | null;
  cover_image?: string | null;
  professions: DanceProfessionApi[];
  is_staff_member: boolean;
  artist_display_order?: number;
  external_links?: ProfileExternalLinks;
  linked_partner_structures?: { name: string; slug: string }[];
};

export type ShuttleDayScheduleApi = {
  id: string;
  label: string;
  date: string;
  isoDate: string;
  toHotel: string[];
  toPalmeraie: string[];
};

export type FestivalDayApi = {
  id: string;
  label: string;
  date: string;
  isoDate: string;
};

export type ProgramSlotApi = {
  id: string;
  day: string;
  artist: string;
  genre: string;
  stage: string;
  start: string;
  end: string;
  live?: boolean;
  category?: string;
  level?: string;
  style?: string;
  notInFullPass?: boolean;
};

export type FestivalProgramApi = {
  edition: string;
  days: FestivalDayApi[];
  stages: string[];
  slots: ProgramSlotApi[];
};
