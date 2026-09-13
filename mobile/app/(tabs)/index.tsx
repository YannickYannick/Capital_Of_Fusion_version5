import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { space, theme } from '@/constants/theme';
import { fonts, type } from '@/constants/typography';
import { HomeHero } from '@/src/components/HomeHero';
import { QuickActions } from '@/src/components/QuickActions';
import { GlassCard } from '@/src/components/ui/SurfaceCard';
import { LivePill } from '@/src/components/ui/LivePill';
import programSeed from '@/src/data/program.seed.json';
import { DAYS } from '@/src/lib/festival-data';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const live = programSeed.slots.find((s) => s.live);
  const day = DAYS.find((d) => d.id === live?.day) ?? DAYS[0]!;
  const dayLabel = `${day.label} · ${day.date}`;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 120 }}>
      <HomeHero topInset={insets.top} dayLabel={dayLabel} />

      <View style={styles.content}>
        {live && (
          <Pressable onPress={() => router.push('/(tabs)/timetable')} accessibilityRole="button">
            <GlassCard featured style={styles.liveCard}>
              <View style={styles.liveHeader}>
                <LivePill />
                <Text style={styles.liveLabel}>En ce moment</Text>
              </View>
              <Text style={styles.liveArtist}>{live.artist}</Text>
              <Text style={styles.liveMeta}>
                {live.stage} · {live.start} – {live.end}
              </Text>
            </GlassCard>
          </Pressable>
        )}

        <QuickActions />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  content: { paddingHorizontal: space.card, gap: space.gap },
  liveCard: { padding: space.card },
  liveHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  liveLabel: { ...type.meta, color: theme.muted },
  liveArtist: {
    marginTop: 10,
    ...type.titleLg,
    fontSize: 22,
    color: theme.foreground,
    fontFamily: fonts.display,
  },
  liveMeta: { marginTop: 4, ...type.body, fontSize: 14, color: theme.textMuted },
});
