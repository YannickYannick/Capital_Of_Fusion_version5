import type { ImageSource } from 'expo-image';

/**
 * Une slide du Code de conduite (affiche officielle Capital of Fusion).
 */
export type CodeOfConductSlide = {
  id: string;
  /** Libellé court pour dots / accessibilité. */
  sectionLabel: string;
  /** Titre affiché sous le pager. */
  title: string;
  image: ImageSource;
};

export const CODE_OF_CONDUCT_META = {
  version: 'VERSION 3.0 · 24 AUGUST 2026',
  intro:
    'Valeurs partagées et pratiques pour que chaque personne soit bienvenue, en sécurité et libre à nos événements.',
} as const;

/**
 * Ordre officiel des affiches Code of Conduct (préfixe fichier 01→20).
 */
export const CODE_OF_CONDUCT_SLIDES: CodeOfConductSlide[] = [
  {
    id: '01',
    sectionLabel: 'Cover',
    title: 'Code of Conduct',
    image: require('@/assets/images/festival/code-of-conduct/01-cover.png'),
  },
  {
    id: '02',
    sectionLabel: '02',
    title: 'Why this Code exists',
    image: require('@/assets/images/festival/code-of-conduct/02-why-this-code.png'),
  },
  {
    id: '04',
    sectionLabel: '02',
    title: 'Who it applies to, and where',
    image: require('@/assets/images/festival/code-of-conduct/04-who-it-applies.png'),
  },
  {
    id: '05',
    sectionLabel: '03',
    title: 'Our shared commitment',
    image: require('@/assets/images/festival/code-of-conduct/05-shared-commitment-1.png'),
  },
  {
    id: '06',
    sectionLabel: '03',
    title: 'Our shared commitment (suite)',
    image: require('@/assets/images/festival/code-of-conduct/06-shared-commitment-2.png'),
  },
  {
    id: '07',
    sectionLabel: '04',
    title: 'Identity & expression',
    image: require('@/assets/images/festival/code-of-conduct/07-identity-and-expression.png'),
  },
  {
    id: '08',
    sectionLabel: '04',
    title: 'The limits of the shared space',
    image: require('@/assets/images/festival/code-of-conduct/08-limits-of-shared-space.png'),
  },
  {
    id: '09',
    sectionLabel: '05',
    title: 'Power difference',
    image: require('@/assets/images/festival/code-of-conduct/09-power-difference.png'),
  },
  {
    id: '10',
    sectionLabel: '06',
    title: 'Behaviours we will not accept',
    image: require('@/assets/images/festival/code-of-conduct/10-not-accept-1.png'),
  },
  {
    id: '11',
    sectionLabel: '06',
    title: 'Behaviours we will not accept (suite)',
    image: require('@/assets/images/festival/code-of-conduct/11-not-accept-2.png'),
  },
  {
    id: '12',
    sectionLabel: '07',
    title: 'Photography & filming',
    image: require('@/assets/images/festival/code-of-conduct/12-photography-and-filming.png'),
  },
  {
    id: '13',
    sectionLabel: '08',
    title: 'Report something to the Safety Team',
    image: require('@/assets/images/festival/code-of-conduct/13-report-to-safety-team.png'),
  },
  {
    id: '14',
    sectionLabel: '08',
    title: 'Our response commitment',
    image: require('@/assets/images/festival/code-of-conduct/14-our-response-commitment.png'),
  },
  {
    id: '15',
    sectionLabel: '09',
    title: 'How enforcement works',
    image: require('@/assets/images/festival/code-of-conduct/15-how-enforcement-works.png'),
  },
  {
    id: '16',
    sectionLabel: '10',
    title: 'Three levels of ban',
    image: require('@/assets/images/festival/code-of-conduct/16-three-levels-of-ban.png'),
  },
  {
    id: '17',
    sectionLabel: '11',
    title: 'Outcomes the Committee may decide',
    image: require('@/assets/images/festival/code-of-conduct/17-outcomes-1.png'),
  },
  {
    id: '18',
    sectionLabel: '11',
    title: 'Outcomes the Committee may decide (suite)',
    image: require('@/assets/images/festival/code-of-conduct/18-outcomes-2.png'),
  },
  {
    id: '19',
    sectionLabel: '16',
    title: 'Protection from retaliation',
    image: require('@/assets/images/festival/code-of-conduct/19-protection-retaliation.png'),
  },
  {
    id: '20',
    sectionLabel: '17',
    title: 'False reports & abuse of the system',
    image: require('@/assets/images/festival/code-of-conduct/20-false-reports.png'),
  },
];
