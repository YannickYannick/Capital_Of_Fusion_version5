/** Tokens PBVF — alignés site web (#0a0e27 + or #f3ac41). */
export const theme = {
  background: '#0a0e27',
  foreground: '#ffffff',
  gold: '#f3ac41',
  goldMuted: 'rgba(243, 172, 65, 0.8)',
  goldSoft: 'rgba(243, 172, 65, 0.12)',
  goldBorder: 'rgba(243, 172, 65, 0.4)',
  brandForeground: '#1a0f05',
  surface: 'rgba(255, 255, 255, 0.05)',
  surfaceHover: 'rgba(255, 255, 255, 0.10)',
  surfaceElevated: 'rgba(0, 0, 0, 0.65)',
  glass: 'rgba(0, 0, 0, 0.65)',
  border: 'rgba(255, 255, 255, 0.10)',
  borderStrong: 'rgba(255, 255, 255, 0.15)',
  muted: 'rgba(255, 255, 255, 0.55)',
  textSoft: 'rgba(255, 255, 255, 0.85)',
  textMuted: 'rgba(255, 255, 255, 0.60)',
  overlay: 'rgba(10, 14, 39, 0.72)',
  ctaExploreStart: '#2464af',
  ctaExploreEnd: '#371957',
  shadowGold: 'rgba(243, 172, 65, 0.45)',
  /** @deprecated alias */
  accentForeground: '#1a0f05',
  surface2: 'rgba(255, 255, 255, 0.08)',
  stage: 'rgba(243, 172, 65, 0.22)',
} as const;

export const space = {
  screen: 20,
  card: 16,
  gap: 10,
  gapLg: 16,
  gapXl: 24,
} as const;

export const radius = {
  card: 12,
  cardLg: 12,
  chip: 8,
  button: 8,
  buttonLg: 8,
  pill: 999,
  icon: 8,
} as const;

export const shadow = {
  /** Ombre portée discrète — pas de halo or zéro-offset */
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;
