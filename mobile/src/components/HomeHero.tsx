import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { AftermovieHeroBackground } from '@/src/components/AftermovieHeroBackground';
import { HOME_HERO_HEIGHT } from '@/src/constants/media';
import { FESTIVAL, images } from '@/src/lib/festival-data';

type HomeHeroProps = {
  topInset: number;
  dayLabel: string;
};

/** Hero accueil — aftermovie + logo PBVF PNG. */
export function HomeHero({ topInset, dayLabel }: HomeHeroProps) {
  return (
    <View style={styles.wrap}>
      <AftermovieHeroBackground height={HOME_HERO_HEIGHT} />
      <LinearGradient
        colors={['rgba(10,14,39,0.15)', 'rgba(10,14,39,0.6)', theme.background]}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: topInset + 8 }]}>
        <Text style={styles.today}>Aujourd'hui · {dayLabel}</Text>
        <Image
          source={images.pbvLogo}
          style={styles.logo}
          contentFit="contain"
          accessibilityLabel="Paris Bachata Vibe Festival"
        />
        <Text style={styles.meta}>{FESTIVAL.location} · {FESTIVAL.edition}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: HOME_HERO_HEIGHT, position: 'relative' },
  content: {
    position: 'absolute',
    left: space.screen,
    right: space.screen,
    bottom: 16,
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
