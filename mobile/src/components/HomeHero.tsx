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
  /** Ligne du haut (ex. « Bientôt · 17–20 sept. »). */
  eyebrow: string;
};

/** Hero accueil — même forme que l’APK (hauteur fixe 300, logo en bas). */
export function HomeHero({ topInset, eyebrow }: HomeHeroProps) {
  const { t } = useLocale();

  return (
    <View style={styles.wrap}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <AftermovieHeroBackground height={HOME_HERO_HEIGHT} />
      </View>
      <LinearGradient
        colors={['rgba(10,14,39,0.15)', 'rgba(10,14,39,0.6)', theme.background]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={[styles.content, { paddingTop: topInset + 8 }]}>
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
    bottom: 16,
    zIndex: 2,
  },
  today: {
    ...type.meta,
    color: theme.gold,
  },
  logo: {
    width: '100%',
    maxWidth: 280,
    height: 88,
    marginTop: 8,
  },
  meta: {
    marginTop: 6,
    ...type.caption,
    color: theme.textSoft,
  },
});
