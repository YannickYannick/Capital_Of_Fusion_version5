/**
 * Détail des passes PBVF 2026 — inclus / non inclus (affiches officielles).
 */

export type FestivalPass = {
  id: string;
  title: string;
  included: string[];
  notIncluded: string[];
  /** Clé dans `passImages`. */
  imageKey: keyof typeof passImages;
};

export const PASS_WARNING =
  'Vérifie bien ce qui est inclus dans ton pass avant d’acheter des options (add-ons).';

export const PASS_INTRO =
  'Quel accès as-tu avec ton pass ? Consulte le détail de chaque formule ci-dessous.';

export const passImages = {
  intro: require('@/assets/images/festival/passes/intro.png'),
  fullPass: require('@/assets/images/festival/passes/full-pass.png'),
  hotelPackFull: require('@/assets/images/festival/passes/hotel-pack-full.png'),
  nightParty4Nights: require('@/assets/images/festival/passes/night-party-4nights.png'),
  hotelSocialDays: require('@/assets/images/festival/passes/hotel-social-days.png'),
  partyThursday: require('@/assets/images/festival/passes/party-thursday.png'),
  partyFriday: require('@/assets/images/festival/passes/party-friday.png'),
  partySaturday: require('@/assets/images/festival/passes/party-saturday.png'),
  partySunday: require('@/assets/images/festival/passes/party-sunday.png'),
  bootcampThursday: require('@/assets/images/festival/passes/bootcamp-thursday.png'),
  masterclass: require('@/assets/images/festival/passes/masterclass.png'),
} as const;

export const FESTIVAL_PASSES: FestivalPass[] = [
  {
    id: 'full-pass',
    title: 'Full Pass',
    imageKey: 'fullPass',
    included: [
      'Tous les workshops, sauf Masterclasses payantes',
      'Tous les Social Day au venue principal',
      'Jack & Jill en spectateur',
      'Battle Final en spectateur',
      'Toutes les Night Parties & After Parties thématiques',
      'Vestiaire gratuit, sauf soirée du samedi',
    ],
    notIncluded: [
      'Hébergement hôtel',
      'Social Day à l’hôtel',
      'Masterclasses payantes',
      'Vestiaire soirée samedi',
      'Navettes',
    ],
  },
  {
    id: 'hotel-pack-full',
    title: 'Hotel Pack + Full Pass',
    imageKey: 'hotelPackFull',
    included: [
      '4 nuits à l’hôtel',
      'Tous les workshops, sauf Masterclasses payantes',
      'Tous les Social Day à l’hôtel',
      'Tous les Social Day au venue principal',
      'Jack & Jill en spectateur',
      'Battle Final en spectateur',
      'Toutes les Night Parties & After Parties thématiques',
      'Vestiaire gratuit, sauf soirée du samedi',
    ],
    notIncluded: [
      'Masterclasses payantes',
      'Vestiaire soirée samedi',
      'Navettes',
    ],
  },
  {
    id: 'night-party-4nights',
    title: 'Night Party Pass — 4 nuits',
    imageKey: 'nightParty4Nights',
    included: [
      'Toutes les Night Parties',
      'Toutes les After Parties',
      'Tous les Social Day au venue principal',
      'Jack & Jill en spectateur',
      'Battle Final en spectateur',
      'Vestiaire, sauf soirée du samedi',
    ],
    notIncluded: [
      'Workshops',
      'Masterclasses & Bootcamps',
      'Social Day à l’hôtel',
      'Navettes',
      'Vestiaire soirée samedi',
    ],
  },
  {
    id: 'hotel-social-days',
    title: 'Hotel Social Days Pass & Outdoor Pool Party',
    imageKey: 'hotelSocialDays',
    included: [
      'Tous les socials de jour à l’hôtel (jeudi → dimanche)',
      'Outdoor Pool Party',
    ],
    notIncluded: [
      'Tout le reste du programme festival (hors socials hôtel)',
      'Navettes',
    ],
  },
  {
    id: 'party-thursday',
    title: 'Party Pass — Thursday Urban Vibe Night',
    imageKey: 'partyThursday',
    included: [
      'Vestiaire jeudi',
      'Urban Vibe Night Party (jeudi)',
      'Accès de 22h15 à 4h00',
    ],
    notIncluded: [
      'Bootcamp / Workshops / Masterclasses',
      'Socials de jour à l’hôtel',
      'Socials de jour au venue (sauf jeudi)',
      'Soirées vendredi / samedi / dimanche',
      'Navettes',
      'All-Star Battle',
      'Jack & Jill',
    ],
  },
  {
    id: 'party-friday',
    title: 'Party Pass — Friday Añejo Vibe Night',
    imageKey: 'partyFriday',
    included: [
      'Vestiaire vendredi',
      'Accès de 20h45 à 5h45',
      'Street Bachata Battle Final (spectateur)',
      'XXL Vibe Room',
      'Boiler Room',
      'Añejo Vibe Night Party',
    ],
    notIncluded: [
      'Workshops / Masterclasses / Bootcamps',
      'Socials de jour à l’hôtel',
      'Social open air au venue',
      'Programme multi-jours (jeu / sam / dim)',
      'Navettes',
      'Battle Pre-Selection',
      'Jack & Jill',
    ],
  },
  {
    id: 'party-saturday',
    title: 'Party Pass — Capital of Fusion Saturday Night',
    imageKey: 'partySaturday',
    included: [
      'Accès au complexe aquatique 7 000 m²',
      'Accès de 22h30 à 5h00',
      'After Party de 5h00 à 8h00 (Zone 1)',
      'Piscine, jacuzzi, toboggan & activités',
      'Toutes les soirées Capital of Fusion du samedi (4 rue Louis Armand, 75015)',
    ],
    notIncluded: [
      'Vestiaire',
      'Socials de jour à l’hôtel',
      'Socials open air de jour au venue',
      'Workshops / Masterclasses / Bootcamps',
      'Navettes',
      'Jack & Jill',
      'Programme jeudi, vendredi & dimanche',
      'Kompa Party & Live Kompa Concert',
    ],
  },
  {
    id: 'party-sunday',
    title: 'Party Pass — Sunday Smooth Vibe Night',
    imageKey: 'partySunday',
    included: [
      'Vestiaire dimanche',
      'Accès de 18h45 à 5h00',
      'Jack & Jill Social French Cup Final (spectateur)',
      'Open-Air Social au venue de 19h00 à 21h00',
      'Smooth Vibe Night Party',
      'Black-Out Closing Party',
    ],
    notIncluded: [
      'Activités jeudi, vendredi & samedi',
      'Workshops, Masterclasses & Bootcamps',
      'Socials de jour à l’hôtel',
      'Navettes',
      'Kompa Party & Live Kompa Concert',
    ],
  },
  {
    id: 'bootcamp-thursday',
    title: 'Bootcamp Bachazouk Carlos y Paz + Thursday Urban Vibe',
    imageKey: 'bootcampThursday',
    included: [
      'Bootcamp Bachazouk Carlos y Paz',
      'Vestiaire jeudi',
      'Social Day jeudi — La Casa Room',
      'Urban Vibe Night Party (jeudi)',
    ],
    notIncluded: [
      'Workshops',
      'Masterclasses',
      'Socials de jour à l’hôtel',
      'Socials de jour au venue (sauf jeudi)',
      'Soirées vendredi / samedi / dimanche',
      'Navettes',
      'All-Star Battle & Jack & Jill',
    ],
  },
  {
    id: 'masterclass',
    title: 'Masterclass Ticket',
    imageKey: 'masterclass',
    included: [
      'Accès à la Masterclass correspondant à ton billet :',
      'Méline · Claudio · Mika & Liza',
    ],
    notIncluded: [
      'Tout le reste du programme, activités & services',
      'Valable uniquement pour la Masterclass indiquée sur le billet',
    ],
  },
];
