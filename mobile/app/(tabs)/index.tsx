import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { space, theme } from '@/constants/theme';
import { fonts, type } from '@/constants/typography';
import { HomeHero } from '@/src/components/HomeHero';
import { HomeAnnouncements } from '@/src/components/HomeAnnouncements';
import { GlassCard } from '@/src/components/ui/SurfaceCard';
import { LivePill } from '@/src/components/ui/LivePill';
import programSeed from '@/src/data/program.seed.json';
import { useLocale } from '@/src/i18n/LocaleContext';
import {
  festivalStartDate,
  findLiveSlot,
  slotWindow,
} from '@/src/lib/liveNow';
import { useAnnouncements } from '@/src/providers/AnnouncementsProvider';

/** Accueil — hero + live / compteur + annonces normales. */
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, dayLabel } = useLocale();
  const { urgent } = useAnnouncements();
  const days = programSeed.days;

  const live = useMemo(
    () => findLiveSlot(programSeed.slots, days),
    [days],
  );

  const festStart = useMemo(() => festivalStartDate(days), [days]);
  const now = Date.now();
  const beforeFestival = festStart != null && now < festStart.getTime();

  const liveEnd = live ? slotWindow(live, days)?.end ?? null : null;
  /** Le bandeau urgent gère déjà le safe-area haut. */
  const heroTop = urgent ? 8 : insets.top;

  const firstDay = days[0] ? dayLabel(days[0]) : null;
  const lastDay = days[days.length - 1] ? dayLabel(days[days.length - 1]) : null;
  const liveDayMeta = live ? days.find((d) => d.id === live.day) : null;
  const liveDay = liveDayMeta ? dayLabel(liveDayMeta) : null;

  const heroEyebrow = live && liveDay
    ? t('home.eyebrowLive', { day: liveDay.label, date: liveDay.date })
    : beforeFestival
      ? t('home.eyebrowSoon', { start: firstDay?.date ?? '', end: lastDay?.date ?? '' })
      : t('home.eyebrowParis', { start: firstDay?.date ?? '', end: lastDay?.date ?? '' });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 120 }}>
      <HomeHero topInset={heroTop} eyebrow={heroEyebrow} />

      <View style={styles.content}>
        {live && liveEnd ? (
          <Pressable onPress={() => router.push('/(tabs)/timetable')} accessibilityRole="button">
            <GlassCard featured style={styles.liveCard}>
              <View style={styles.liveHeader}>
                <LivePill target={liveEnd} />
                <Text style={styles.liveLabel}>{t('home.liveNow')}</Text>
              </View>
              <Text style={styles.liveArtist}>{live.artist}</Text>
              <Text style={styles.liveMeta}>
                {live.stage} · {live.start} – {live.end}
              </Text>
            </GlassCard>
          </Pressable>
        ) : beforeFestival && festStart ? (
          <Pressable onPress={() => router.push('/(tabs)/timetable')} accessibilityRole="button">
            <GlassCard featured style={styles.liveCard}>
              <View style={styles.liveHeader}>
                <LivePill target={festStart} />
                <Text style={styles.liveLabel}>{t('home.beforeFestival')}</Text>
              </View>
              <Text style={styles.liveArtist}>{t('home.brandTitle')}</Text>
              <Text style={styles.liveMeta}>
                {t('home.openingMeta', {
                  day: firstDay?.label ?? '',
                  date: firstDay?.date ?? '',
                })}
              </Text>
            </GlassCard>
          </Pressable>
        ) : null}

        <HomeAnnouncements />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  content: { paddingHorizontal: space.card, gap: space.gap, marginTop: space.gap },
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
