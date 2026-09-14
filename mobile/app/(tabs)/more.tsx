import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { radius, space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { PageHeader } from '@/src/components/PageHeader';
import { GlassCard } from '@/src/components/ui/SurfaceCard';
import { FESTIVAL, images } from '@/src/lib/festival-data';

export default function MoreScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 120 }}>
      <PageHeader eyebrow="Avant & pendant" title="Infos" compact />

      <View style={styles.list}>
        <Pressable onPress={() => router.push('/passes')} accessibilityRole="button">
          <GlassCard style={styles.passCard}>
            <View style={styles.passRow}>
              <Image source={images.bracelet} style={styles.passImg} contentFit="cover" />
              <View style={styles.passText}>
                <Text style={styles.passTitle}>Passes</Text>
                <Text style={styles.passBody}>
                  Détail inclus / non inclus de chaque formule.
                </Text>
              </View>
            </View>
          </GlassCard>
        </Pressable>

        <Pressable onPress={() => router.push('/shuttles')} accessibilityRole="button">
          <GlassCard style={styles.card}>
            <Text style={styles.title}>Navettes</Text>
            <Text style={styles.body}>Horaires Palmeraie ↔ hôtel — par jour et par sens.</Text>
          </GlassCard>
        </Pressable>

        <Pressable onPress={() => router.push('/jack-n-jill')} accessibilityRole="button">
          <GlassCard style={styles.card}>
            <Text style={styles.title}>Jack & Jill Vibe</Text>
            <Text style={styles.body}>Affiches — pré-sélection et finale.</Text>
          </GlassCard>
        </Pressable>

        <Pressable onPress={() => router.push('/code-of-conduct')} accessibilityRole="button">
          <GlassCard style={styles.card}>
            <Text style={styles.title}>Code de conduite</Text>
            <Text style={styles.body}>
              Capital of Fusion · version 3.0 — swipe entre les sections.
            </Text>
          </GlassCard>
        </Pressable>
      </View>

      <Text style={styles.footer}>
        {FESTIVAL.name} · {FESTIVAL.location} · {FESTIVAL.edition}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  list: { paddingHorizontal: space.card, gap: space.gap },
  card: { padding: space.card },
  passCard: { padding: space.card },
  passRow: { flexDirection: 'row', gap: space.card, alignItems: 'center' },
  passImg: { width: 72, height: 72, borderRadius: radius.card },
  passText: { flex: 1 },
  passTitle: { ...type.title, color: theme.foreground },
  passBody: { marginTop: 4, ...type.body, fontSize: 14, color: theme.muted },
  title: { ...type.title, fontSize: 16, color: theme.foreground },
  body: { marginTop: 4, ...type.body, fontSize: 14, color: theme.muted },
  footer: {
    marginTop: 28,
    textAlign: 'center',
    ...type.meta,
    fontSize: 10,
    color: theme.muted,
  },
});
