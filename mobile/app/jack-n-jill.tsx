import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { PageHeader } from '@/src/components/PageHeader';
import { CtaRow } from '@/src/components/ui/CtaRow';
import { SurfaceCard } from '@/src/components/ui/SurfaceCard';
import { JACK_N_JILL, images } from '@/src/lib/festival-data';

export default function JackNJillScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.back}>← Retour</Text>
        </Pressable>
      </View>

      <PageHeader eyebrow="Compétition" title="Jack N Jill Vibe" subtitle={JACK_N_JILL.intro} />

      <View style={styles.list}>
        <SurfaceCard style={styles.card}>
          <Text style={styles.sectionTitle}>{JACK_N_JILL.saturdayTitle}</Text>
          <Text style={styles.body}>{JACK_N_JILL.saturdayBody}</Text>
          <Image
            source={images.jackNJillSaturday}
            style={styles.poster}
            contentFit="contain"
            accessibilityLabel={JACK_N_JILL.saturdayPosterLabel}
          />
        </SurfaceCard>

        <SurfaceCard style={styles.card}>
          <Text style={styles.sectionTitle}>{JACK_N_JILL.sundayTitle}</Text>
          <Text style={styles.body}>{JACK_N_JILL.sundayBody}</Text>
          <Image
            source={images.jackNJillSunday}
            style={styles.poster}
            contentFit="contain"
            accessibilityLabel={JACK_N_JILL.sundayPosterLabel}
          />
        </SurfaceCard>

        <SurfaceCard style={styles.card}>
          <Text style={styles.sectionTitle}>Inscriptions</Text>
          <Text style={styles.body}>{JACK_N_JILL.registrationHint}</Text>
          <CtaRow
            label="Catégorie amateur"
            onPress={() => Linking.openURL(JACK_N_JILL.registrationAmateur)}
          />
          <View style={styles.ctaSpacer} />
          <CtaRow
            label="Catégorie professionnelle"
            onPress={() => Linking.openURL(JACK_N_JILL.registrationPro)}
          />
        </SurfaceCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  topBar: { paddingHorizontal: space.card, paddingTop: 12 },
  back: { ...type.meta, color: theme.gold },
  list: { paddingHorizontal: space.card, gap: space.gap, marginTop: space.gap },
  card: { padding: space.card, gap: 10 },
  sectionTitle: { ...type.title, color: theme.foreground },
  body: { ...type.body, color: theme.muted },
  poster: {
    width: '100%',
    aspectRatio: 0.72,
    borderRadius: 12,
    marginTop: 4,
    backgroundColor: theme.surface,
  },
  ctaSpacer: { height: 8 },
});
