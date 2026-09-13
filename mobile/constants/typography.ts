import { TextStyle } from 'react-native';

/** Urbane = titres de marque uniquement. Inter = tout le reste. */
export const fonts = {
  display: 'Urbane-Bold',
  bold: 'Urbane-Bold',
  semiBold: 'Urbane-DemiBold',
  medium: 'Urbane-Medium',
  regular: 'Inter_400Regular',
  mediumBody: 'Inter_500Medium',
  semiBoldBody: 'Inter_600SemiBold',
} as const;

export const type = {
  hero: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  display: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.2,
  },
  title: {
    fontFamily: fonts.semiBoldBody,
    fontSize: 17,
    lineHeight: 22,
  },
  titleLg: {
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 24,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  bodyMedium: {
    fontFamily: fonts.mediumBody,
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  /** Meta secondaire — Inter, pas de caps forcés */
  meta: {
    fontFamily: fonts.mediumBody,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.3,
  },
  cta: {
    fontFamily: fonts.semiBoldBody,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0,
  },
} satisfies Record<string, TextStyle>;
