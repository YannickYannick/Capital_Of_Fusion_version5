import { Linking, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { ReactNode } from 'react';

import { space, theme } from '@/constants/theme';
import { fonts, type } from '@/constants/typography';
import { useLocale } from '@/src/i18n/LocaleContext';

const SITE_URL = 'https://www.capitaloffusion.com';
const DESKTOP_MIN_WIDTH = 900;

type DesktopGateProps = { children: ReactNode };

/**
 * Sur web desktop : message « app mobile only » + lien site.
 * Mobile / natif : children inchangés.
 */
export function DesktopGate({ children }: DesktopGateProps) {
  const { width } = useWindowDimensions();
  const { t } = useLocale();

  const isDesktopWeb = Platform.OS === 'web' && width >= DESKTOP_MIN_WIDTH;
  if (!isDesktopWeb) return <>{children}</>;

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{t('desktop.title')}</Text>
      <Text style={styles.body}>{t('desktop.body')}</Text>
      <Pressable
        onPress={() => Linking.openURL(SITE_URL)}
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        accessibilityRole="link"
      >
        <Text style={styles.ctaLabel}>{t('desktop.ctaSite')}</Text>
      </Pressable>
      <Text style={styles.hint}>{t('desktop.hintPhone')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.card * 2,
    gap: 16,
  },
  title: {
    ...type.titleLg,
    fontFamily: fonts.display,
    color: theme.foreground,
    textAlign: 'center',
  },
  body: {
    ...type.body,
    color: theme.muted,
    textAlign: 'center',
    maxWidth: 420,
  },
  cta: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.gold,
  },
  ctaLabel: {
    ...type.bodyMedium,
    color: '#0a0e27',
    fontWeight: '700',
  },
  pressed: { opacity: 0.9 },
  hint: {
    ...type.caption,
    color: theme.textSoft,
    textAlign: 'center',
    marginTop: 8,
  },
});
