import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { AftermovieHeroBackground } from '@/src/components/AftermovieHeroBackground';
import { HOME_HERO_HEIGHT } from '@/src/constants/media';
import { useLocale } from '@/src/i18n/LocaleContext';
import { FESTIVAL, images } from '@/src/lib/festival-data';

type HomeHeroProps = {
  topInset: number;
  /** Ligne du haut (ex. « Coming soon · 17–20 Sep »). */
  eyebrow: string;
};

/**
 * Hero accueil — logo centré, dates lisibles au-dessus / en dessous.
 */
export function HomeHero({ topInset, eyebrow }: HomeHeroProps) {
  const { t } = useLocale();

  return (
    <View style={styles.wrap}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <AftermovieHeroBackground height={HOME_HERO_HEIGHT} />
      </View>
      <LinearGradient
        colors={['rgba(10,14,39,0.2)', 'rgba(10,14,39,0.55)', theme.background]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={[styles.content, { paddingTop: topInset + 12 }]}>
        <Text style={styles.today}>{eyebrow}</Text>
        <Image
          source={images.pbvLogo}
          style={styles.logo}
          contentFit="contain"
          accessibilityLabel={t('home.logoA11y')}
        />
        <Text style={styles.meta}>
          {FESTIVAL.location} · {FESTIVAL.edition}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: HOME_HERO_HEIGHT,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  content: {
    position: 'absolute',
    left: space.screen,
    right: space.screen,
    bottom: 20,
    zIndex: 2,
    alignItems: 'center',
  },
  today: {
    ...type.bodyMedium,
    fontSize: 14,
    letterSpacing: 0.4,
    color: theme.gold,
    textAlign: 'center',
  },
  logo: {
    width: '100%',
    maxWidth: 200,
    height: 200,
    marginTop: 8,
    alignSelf: 'center',
  },
  meta: {
    marginTop: 8,
    ...type.meta,
    fontSize: 13,
    letterSpacing: 1.2,
    color: theme.textSoft,
    textAlign: 'center',
  },
});
