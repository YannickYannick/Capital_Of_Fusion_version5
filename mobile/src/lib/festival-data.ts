/**
 * Données festival PBVF — source locale pour l'app React Native.
 * Purpose: alimenter l'UI avant branchement API Django.
 */
export const FESTIVAL = {
  name: 'PBVF',
  displayName: 'Paris Bachata Vibe Festival',
  brand: 'Capital of Fusion',
  location: 'PARIS',
  edition: '2026',
  theme: 'Capital of Fusion',
} as const;

export type Day = { id: string; label: string; date: string };

export const DAYS: Day[] = [
  { id: 'jeu', label: 'Jeu', date: '17 sept.' },
  { id: 'ven', label: 'Ven', date: '18 sept.' },
  { id: 'sam', label: 'Sam', date: '19 sept.' },
  { id: 'dim', label: 'Dim', date: '20 sept.' },
];

export const STAGES = ['La Casa Room', 'El Patio', 'Vibe Room', 'Aquaboulevard'] as const;

export type Slot = {
  id: string;
  artist: string;
  genre: string;
  stage: (typeof STAGES)[number];
  start: string;
  end: string;
  day: string;
  live?: boolean;
};

export const SLOTS: Slot[] = [
  { id: '1', artist: 'Urban Vibe Night', genre: 'Bachata urbaine', stage: 'La Casa Room', start: '21:00', end: '02:00', day: 'jeu', live: true },
  { id: '2', artist: 'Añejo Vibe', genre: 'Bachata sensual', stage: 'El Patio', start: '20:30', end: '01:30', day: 'ven' },
  { id: '3', artist: 'Street Bachata Battle', genre: 'Compétition', stage: 'Vibe Room', start: '14:00', end: '18:00', day: 'ven' },
  { id: '4', artist: 'Jack & Jill — Présélections', genre: 'Compétition', stage: 'La Casa Room', start: '10:00', end: '17:00', day: 'sam' },
  { id: '5', artist: 'Kompa Party', genre: 'Kompa · live', stage: 'Aquaboulevard', start: '22:00', end: '03:00', day: 'sam' },
  { id: '6', artist: 'Capital of Fusion Party', genre: 'Bachata fusion', stage: 'Aquaboulevard', start: '23:00', end: '04:00', day: 'sam' },
  { id: '7', artist: 'Finales Jack & Jill', genre: 'Compétition', stage: 'La Casa Room', start: '11:00', end: '16:00', day: 'dim' },
  { id: '8', artist: 'French Social Cup', genre: 'Social', stage: 'El Patio', start: '15:00', end: '19:00', day: 'dim' },
  { id: '9', artist: 'Smooth Vibe Party', genre: 'Bachata smooth', stage: 'Vibe Room', start: '20:00', end: '01:00', day: 'dim' },
];

export const NEWS = [
  {
    date: 'Août 2026',
    title: 'Le planning est disponible',
    body: `Ajoute tes workshops et tes soirées à tes favoris pour créer ton timetable personnalisé. Commence à planifier ton ${FESTIVAL.displayName} : ${FESTIVAL.theme}.`,
    cta: 'Découvrir le timetable',
    route: '/(tabs)/timetable' as const,
  },
];

/** Sous-espace d’une zone venue (salle / plage / bassin). */
export type VenueSubArea = {
  name: string;
  detail: string;
};

/** Zone venue avec plan officiel + sous-areas (aligné page Accès & Venue). */
export type VenueArea = {
  id: string;
  name: string;
  detail: string;
  /** Clé dans `images` pour le plan de la zone. */
  mapKey: 'venueOverview' | 'venueArea1' | 'venueArea2';
  subAreas: VenueSubArea[];
};

/**
 * Zones & sous-areas — même structure que le site web (La Palmeraie / Aquaboulevard).
 */
export const VENUE_AREAS: VenueArea[] = [
  {
    id: 'palmeraie',
    name: 'Zone 1 — La Palmeraie',
    detail: 'Indoor · workshops, battles & soirées',
    mapKey: 'venueArea1',
    subAreas: [
      { name: 'La Casa Room', detail: 'Workshops, battles & night parties' },
      { name: 'La Escuela Room', detail: 'Cours & stages' },
      { name: 'La Vibe Room', detail: 'Stages & Vibe Room party' },
    ],
  },
  {
    id: 'aquaboulevard',
    name: 'Zone 2 — Aquaboulevard',
    detail: 'Pool party, social & espaces aquatiques',
    mapKey: 'venueArea2',
    subAreas: [
      { name: 'El Patio Room', detail: 'Workshops & social open air' },
      { name: 'Antille Beach', detail: 'Espace plage' },
      { name: 'Mangrove Area', detail: 'Espace détente' },
      { name: 'Caribbean Beach', detail: 'Espace plage' },
      { name: 'Surf Pool', detail: 'Bassin / pool party' },
      { name: 'Jonas', detail: 'Espace événement' },
    ],
  },
];

/** @deprecated Préférer VENUE_AREAS — conservé pour compat. */
export const MAP_POINTS = VENUE_AREAS.flatMap((area) =>
  area.subAreas.map((s) => ({ name: s.name, detail: `${s.detail} — ${area.name}` })),
);

/** Réservation navettes — Weezevent + tarif à bord. */
export const SHUTTLE_BOOKING = {
  url: 'https://my.weezevent.com/shuttle-paris-bachata-vibes-festival',
  ctaLabel: 'Réserver une navette',
  fareNote:
    'Comptez 2 € à régler dans la navette — paiement possible avec la carte Vibe.',
} as const;

export const JACK_N_JILL = {
  intro:
    'Pré-sélection samedi et finale dimanche — divisions pro et amateur. Consulte les affiches officielles pour le format et les horaires.',
  saturdayTitle: 'Samedi — Pré-sélection finale',
  saturdayBody:
    'Check-in et dossards de 17h30 à 18h45. Qualificatives 19h–20h30, demi-finales 20h30–21h30. Top 5 par catégorie qualifiés pour le dimanche.',
  sundayTitle: 'Dimanche — Bachata French Social Cup Final',
  sundayBody:
    'Check-in 18h–18h45. Qualification 19h–19h45, demi-finales 20h–20h45, finale 20h45–22h30. Réservé aux danseurs qualifiés.',
  saturdayPosterLabel: 'Affiche Jack and Jill Pre Selection Final — samedi 19 septembre',
  sundayPosterLabel: 'Affiche Bachata French Social Cup Final — dimanche 20 septembre',
  registrationHint: 'Inscriptions sur Bachata Social World Cup (liens officiels).',
  registrationAmateur:
    'https://bachatasocialworldcup.com/qualifiers/pre-selection-finale-amateur-2026',
  registrationPro:
    'https://bachatasocialworldcup.com/qualifiers/pre-selection-finale-pro-2026',
  judgesIntro: 'Panels officiels Jack & Jill — samedi, dimanche tours et finale.',
  judgesPanels: [
    {
      id: 'saturday',
      title: 'Samedi — 1er & 2e tours',
      imageKey: 'jackNJillJudgesSaturday' as const,
      judges: ['Owen & Eva', 'Diger & Marie', 'Manue & Mika', 'Christina & Rebecca', 'Dim & Mathilde'],
    },
    {
      id: 'sunday-rounds',
      title: 'Dimanche — 1er & 2e tours',
      imageKey: 'jackNJillJudgesSundayRounds' as const,
      judges: ['Melonito & Eva', 'Dario & Christina', 'Dim & Mathilde', 'Manue & Mika', 'Amelie & Bastien'],
    },
    {
      id: 'sunday-final',
      title: 'Dimanche — Finale',
      imageKey: 'jackNJillJudgesSundayFinal' as const,
      judges: ['Melvin & Gatica', 'Diger & Marie', 'Dario & Christina', 'Dim & Mathilde', 'Amelie & Bastien'],
    },
  ],
} as const;

export const images = {
  hero: require('@/assets/images/festival/hero-stage.jpg'),
  pbvLogo: require('@/assets/images/pbv-logo.png'),
  news: require('@/assets/images/festival/news-dance.jpg'),
  bracelet: require('@/assets/images/festival/bracelet.jpg'),
  /** @deprecated Placeholder — préférer venueOverview / venueArea1 / venueArea2 */
  siteMap: require('@/assets/images/festival/site-map.jpg'),
  venueOverview: require('@/assets/images/festival/venue-overview.jpg'),
  /** Plan Zones 1 & 2 (La Palmeraie + Aquaboulevard) — page Accès & Venue. */
  venueAreas12: require('@/assets/images/festival/area1-2.png'),
  venueArea1: require('@/assets/images/festival/area1.png'),
  venueArea2: require('@/assets/images/festival/area2.png'),
  jackNJillSaturday: require('@/assets/images/festival/jack-n-jill-pre-selection-final-saturday.png'),
  jackNJillSunday: require('@/assets/images/festival/jack-n-jill-french-social-cup-final-sunday.png'),
  jackNJillJudgesSaturday: require('@/assets/images/festival/jack-n-jill-judges-saturday.png'),
  jackNJillJudgesSundayRounds: require('@/assets/images/festival/jack-n-jill-judges-sunday-rounds.png'),
  jackNJillJudgesSundayFinal: require('@/assets/images/festival/jack-n-jill-judges-sunday-final.png'),
};
