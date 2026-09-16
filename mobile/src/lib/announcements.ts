import { apiGet } from '@/src/lib/api';
import { FESTIVAL } from '@/src/lib/festival-data';
import announcementsSeed from '@/src/data/announcements.seed.json';
import type { AppLocale } from '@/src/i18n/types';

export type AnnouncementPriority = 'urgent' | 'normal';

export type FestivalAnnouncement = {
  id: string;
  edition: string;
  title: string;
  body: string;
  priority: AnnouncementPriority;
  starts_at: string | null;
  ends_at: string | null;
  link_url: string;
  link_label: string;
  sort_order: number;
};

type SeedCopy = {
  title: string;
  body: string;
  link_label: string;
};

type SeedAnnouncement = {
  id: string;
  edition: string;
  priority: AnnouncementPriority;
  starts_at: string | null;
  ends_at: string | null;
  link_url: string;
  sort_order: number;
  i18n: Record<AppLocale, SeedCopy>;
};

/**
 * Seed local (PWA hors-ligne / API KO), déjà localisé.
 */
export function localAnnouncementsFallback(
  locale: AppLocale = 'en',
): FestivalAnnouncement[] {
  return (announcementsSeed as SeedAnnouncement[]).map((item) => {
    const copy = item.i18n[locale] ?? item.i18n.en;
    return {
      id: item.id,
      edition: item.edition,
      title: copy.title,
      body: copy.body,
      priority: item.priority,
      starts_at: item.starts_at,
      ends_at: item.ends_at,
      link_url: item.link_url,
      link_label: copy.link_label,
      sort_order: item.sort_order,
    };
  });
}

/**
 * GET /api/festival/announcements/?lang= — repli seed si réseau/CORS KO.
 */
export async function fetchFestivalAnnouncements(
  locale: AppLocale = 'en',
  edition = FESTIVAL.edition,
): Promise<FestivalAnnouncement[]> {
  try {
    const data = await apiGet<FestivalAnnouncement[]>('/api/festival/announcements/', {
      params: { edition, lang: locale },
    });
    return Array.isArray(data) ? data : localAnnouncementsFallback(locale);
  } catch {
    return localAnnouncementsFallback(locale);
  }
}

export function filterUrgent(items: FestivalAnnouncement[]): FestivalAnnouncement[] {
  return items
    .filter((a) => a.priority === 'urgent')
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function filterNormal(items: FestivalAnnouncement[]): FestivalAnnouncement[] {
  return items
    .filter((a) => a.priority === 'normal')
    .sort((a, b) => a.sort_order - b.sort_order);
}
