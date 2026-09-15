/**
 * Types i18n PWA — locales supportées.
 */
export type AppLocale = 'en' | 'fr' | 'es';

export const DEFAULT_LOCALE: AppLocale = 'en';
export const LOCALE_STORAGE_KEY = 'pbvf_locale';

export const LOCALES: {
  id: AppLocale;
  flag: string;
  name: string;
}[] = [
  { id: 'en', flag: '🇬🇧', name: 'English' },
  { id: 'fr', flag: '🇫🇷', name: 'Français' },
  { id: 'es', flag: '🇪🇸', name: 'Español' },
];

/** Messages UI (structure partagée EN/FR/ES). */
export type Messages = {
  tabs: { timetable: string; map: string; home: string; lineup: string; more: string };
  common: {
    back: string;
    close: string;
    closeImage: string;
    tapToClose: string;
    seePoster: string;
    hidePoster: string;
    tapToEnlarge: string;
    collapse: string;
    seePlan: string;
    seeVideo: string;
    seeSubspaces: string;
    swipeHint: string;
    prevSlide: string;
    nextSlide: string;
  };
  days: {
    jeu: { short: string; date: string };
    ven: { short: string; date: string };
    sam: { short: string; date: string };
    dim: { short: string; date: string };
  };
  home: {
    eyebrowLive: string;
    eyebrowSoon: string;
    eyebrowParis: string;
    liveNow: string;
    beforeFestival: string;
    brandTitle: string;
    openingMeta: string;
    logoA11y: string;
    announcements: string;
    remainingA11y: string;
  };
  urgent: { badge: string; dismissA11y: string };
  timetable: {
    eyebrow: string;
    title: string;
    favorites: string;
    allStages: string;
    emptyFavorites: string;
    emptyFilters: string;
    levels: string;
    notInFullPass: string;
    addFavoriteA11y: string;
    removeFavoriteA11y: string;
  };
  levels: {
    open: string;
    beginner: string;
    intermediate: string;
    advanced: string;
  };
  map: {
    eyebrow: string;
    title: string;
    overview: string;
    zones: string;
    address: string;
    addressCopied: string;
    copyAddressA11y: string;
    overviewPlan: string;
    overviewExpandA11y: string;
    areas12Name: string;
    areas12Detail: string;
    areas12Plan: string;
    areas12ExpandA11y: string;
    entryTitle: string;
    entryDetail: string;
    entryHint: string;
    teaserTitle: string;
    teaserDetail: string;
    planLabel: string;
    expandPlanA11y: string;
    palmeraieName: string;
    palmeraieDetail: string;
    aquaboulevardName: string;
    aquaboulevardDetail: string;
    subCasa: string;
    subCasaDetail: string;
    subEscuela: string;
    subEscuelaDetail: string;
    subVibe: string;
    subVibeDetail: string;
    subPatio: string;
    subPatioDetail: string;
    subAntille: string;
    subAntilleDetail: string;
    subMangrove: string;
    subMangroveDetail: string;
    subCaribbean: string;
    subCaribbeanDetail: string;
    subSurf: string;
    subSurfDetail: string;
    subJonas: string;
    subJonasDetail: string;
  };
  lineup: {
    eyebrow: string;
    title: string;
    empty: string;
    teamCof: string;
    viewProfileA11y: string;
    filterAll: string;
    filterTeam: string;
    filterGuests: string;
  };
  more: {
    eyebrow: string;
    title: string;
    language: string;
    passesTitle: string;
    passesBody: string;
    shuttlesTitle: string;
    shuttlesBody: string;
    jackTitle: string;
    jackBody: string;
    battleTitle: string;
    battleBody: string;
    codeTitle: string;
    codeBody: string;
    footer: string;
  };
  jack: {
    eyebrow: string;
    title: string;
    tabInfos: string;
    tabJudges: string;
    intro: string;
    saturdayTitle: string;
    saturdayBody: string;
    sundayTitle: string;
    sundayBody: string;
    saturdayPoster: string;
    sundayPoster: string;
    registrationTitle: string;
    registrationHint: string;
    ctaAmateur: string;
    ctaPro: string;
    judgesIntro: string;
    panelSaturday: string;
    panelSundayRounds: string;
    panelSundayFinal: string;
  };
  battle: {
    eyebrow: string;
    title: string;
    tabInfos: string;
    tabRules: string;
    intro: string;
    overviewTitle: string;
    overviewBody: string;
    formatTitle: string;
    formatBullets: string[];
    rulesTitle: string;
    rulesBullets: string[];
    posterLabel: string;
    registrationTitle: string;
    registrationHint: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  passes: {
    eyebrow: string;
    title: string;
    intro: string;
    introSlide: string;
    version: string;
    warning: string;
  };
  code: {
    eyebrow: string;
    title: string;
    intro: string;
    version: string;
  };
  shuttles: {
    eyebrow: string;
    title: string;
    bookingTitle: string;
    fareNote: string;
    cta: string;
    dirToHotel: string;
    dirToPalmeraie: string;
    backendHint: string;
  };
  artist: {
    staffBadge: string;
    about: string;
    partners: string;
    links: string;
    notFound: string;
  };
  notFound: {
    title: string;
    message: string;
    goHome: string;
  };
  desktop: {
    title: string;
    body: string;
    ctaSite: string;
    hintPhone: string;
  };
};
