import { useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { BackButton } from '@/src/components/BackButton';
import { PageHeader } from '@/src/components/PageHeader';
import { Chip } from '@/src/components/ui/Chip';
import { CtaRow } from '@/src/components/ui/CtaRow';
import { SurfaceCard } from '@/src/components/ui/SurfaceCard';
import { useShuttles } from '@/src/hooks/useShuttles';
import { SHUTTLE_BOOKING } from '@/src/lib/festival-data';
import { SHUTTLE_DIRECTION_LABEL, type ShuttleDirection } from '@/src/lib/shuttle-types';

/**
 * Horaires navettes + lien réservation Weezevent.
 */
export default function ShuttlesScreen() {
  const { schedules, loading, error } = useShuttles();
  const [dayId, setDayId] = useState<string | null>(null);
  const [direction, setDirection] = useState<ShuttleDirection>('to_hotel');

  const activeDayId = dayId ?? schedules[0]?.id ?? 'jeu';
  const day = schedules.find((d) => d.id === activeDayId);
  const times = day ? (direction === 'to_hotel' ? day.toHotel : day.toPalmeraie) : [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 120 }}>
      <BackButton fallbackHref="/(tabs)/more" />

      <PageHeader eyebrow="Palmeraie ↔ hôtel" title="Navettes" compact />

      <View style={styles.bookingWrap}>
        <SurfaceCard style={styles.bookingCard}>
          <Text style={styles.bookingTitle}>Réservation</Text>
          <Text style={styles.bookingNote}>{SHUTTLE_BOOKING.fareNote}</Text>
          <CtaRow
            label={SHUTTLE_BOOKING.ctaLabel}
            onPress={() => Linking.openURL(SHUTTLE_BOOKING.url)}
          />
        </SurfaceCard>
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color={theme.gold} />
        </View>
      )}

      {error && (
        <Text style={styles.error}>
          {error}
          {'\n'}Vérifie que le backend Django tourne (port 8000).
        </Text>
      )}

      {!loading && !error && (
        <View style={styles.content}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {schedules.map((d) => (
              <Chip
                key={d.id}
                label={`${d.label} ${d.date}`}
                active={d.id === activeDayId}
                onPress={() => setDayId(d.id)}
                variant="day"
              />
            ))}
          </ScrollView>

          <View style={styles.dirRow}>
            {(['to_hotel', 'to_palmeraie'] as const).map((dir) => (
              <Chip
                key={dir}
                label={SHUTTLE_DIRECTION_LABEL[dir]}
                active={direction === dir}
                onPress={() => setDirection(dir)}
                variant="stage"
              />
            ))}
          </View>

          <View style={styles.times}>
            {times.map((time) => (
              <View key={time} style={styles.timeCell}>
                <Text style={styles.time}>{time}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  bookingWrap: { paddingHorizontal: space.card, marginBottom: space.gap },
  bookingCard: { padding: space.card, gap: 10 },
  bookingTitle: { ...type.title, color: theme.foreground },
  bookingNote: { ...type.body, color: theme.muted },
  content: { paddingHorizontal: space.card, gap: space.gap },
  chips: { gap: 8, paddingBottom: 4 },
  dirRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  times: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: space.gap },
  timeCell: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: theme.surface,
  },
  time: { ...type.bodyMedium, color: theme.foreground },
  center: { paddingVertical: 40, alignItems: 'center' },
  error: { paddingHorizontal: space.card, ...type.body, color: theme.muted },
});
