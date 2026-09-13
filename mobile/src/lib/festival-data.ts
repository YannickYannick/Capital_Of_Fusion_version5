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

export const INFOS = [
  { title: 'Passes & billetterie', body: "Réserve ton pass sur le site officiel Capital of Fusion avant l'événement." },
  { title: 'Navettes', body: 'Navettes Palmeraie ↔ hôtel — jeudi–vendredi et week-end (voir affiches horaires).' },
  { title: 'Venue — La Palmeraie', body: 'La Casa Room, El Patio et Vibe Room : workshops, battles et soirées.' },
  { title: 'Aquaboulevard', body: 'Pool party, Kompa Party et Capital of Fusion Party le samedi.' },
  { title: 'Accès & venue', body: "Plan d'entrée sur site, zones Area 1 / Area 2 et infos pratiques sur le site web." },
];

export const MAP_POINTS = [
  { name: 'La Casa Room', detail: 'Workshops & soirées — Palmeraie' },
  { name: 'El Patio', detail: 'Social day & battles — Palmeraie' },
  { name: 'Vibe Room', detail: 'Stages & Vibe Room party' },
  { name: 'Aquaboulevard', detail: 'Pool party & soirées week-end' },
  { name: 'Navettes', detail: 'Arrêts Palmeraie ↔ hôtel partenaire' },
  { name: 'Accueil & billetterie', detail: 'Entrée principale — voir plan site' },
];

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
} as const;

export const images = {
  hero: require('@/assets/images/festival/hero-stage.jpg'),
  pbvLogo: require('@/assets/images/pbv-logo.png'),
  news: require('@/assets/images/festival/news-dance.jpg'),
  bracelet: require('@/assets/images/festival/bracelet.jpg'),
  siteMap: require('@/assets/images/festival/site-map.jpg'),
  jackNJillSaturday: require('@/assets/images/festival/jack-n-jill-pre-selection-final-saturday.png'),
  jackNJillSunday: require('@/assets/images/festival/jack-n-jill-french-social-cup-final-sunday.png'),
};
