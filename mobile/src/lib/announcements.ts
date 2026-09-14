import { apiGet } from '@/src/lib/api';
import { FESTIVAL } from '@/src/lib/festival-data';
import announcementsSeed from '@/src/data/announcements.seed.json';

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

/**
 * Seed local (PWA hors-ligne / API KO).
 */
export function localAnnouncementsFallback(): FestivalAnnouncement[] {
  return announcementsSeed as FestivalAnnouncement[];
}

/**
 * GET /api/festival/announcements/ — repli seed si réseau/CORS KO.
 */
export async function fetchFestivalAnnouncements(
  edition = FESTIVAL.edition,
): Promise<FestivalAnnouncement[]> {
  try {
    const data = await apiGet<FestivalAnnouncement[]>('/api/festival/announcements/', {
      params: { edition },
    });
    return Array.isArray(data) ? data : localAnnouncementsFallback();
  } catch {
    return localAnnouncementsFallback();
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
