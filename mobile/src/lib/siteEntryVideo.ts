import { Platform } from 'react-native';

import {
  ACCES_VENUE_TEASER_VIDEO_LOCAL,
  ACCES_VENUE_TEASER_VIDEO_REMOTE,
  SITE_ENTRY_VIDEO_LOCAL,
  SITE_ENTRY_VIDEO_REMOTE,
} from '@/src/constants/media';

export type AccesVenueVideoKind = 'site-entry' | 'teaser';

/**
 * URI d’une vidéo Accès & Venue selon la plateforme.
 * Web/PWA : asset local exporté ; natif : CDN site.
 */
export function getAccesVenueVideoUri(kind: AccesVenueVideoKind): string {
  if (kind === 'teaser') {
    return Platform.OS === 'web' ? ACCES_VENUE_TEASER_VIDEO_LOCAL : ACCES_VENUE_TEASER_VIDEO_REMOTE;
  }
  return Platform.OS === 'web' ? SITE_ENTRY_VIDEO_LOCAL : SITE_ENTRY_VIDEO_REMOTE;
}

/** @deprecated Utiliser getAccesVenueVideoUri('site-entry'). */
export function getSiteEntryVideoUri(): string {
  return getAccesVenueVideoUri('site-entry');
}
