import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { PageHeader } from '@/src/components/PageHeader';
import { Chip } from '@/src/components/ui/Chip';
import { useShuttles } from '@/src/hooks/useShuttles';
import { SHUTTLE_DIRECTION_LABEL, type ShuttleDirection } from '@/src/lib/shuttle-types';

export default function ShuttlesScreen() {
  const router = useRouter();
  const { schedules, loading, error } = useShuttles();
  const [dayId, setDayId] = useState<string | null>(null);
  const [direction, setDirection] = useState<ShuttleDirection>('to_hotel');

  const activeDayId = dayId ?? schedules[0]?.id ?? 'jeu';
  const day = schedules.find((d) => d.id === activeDayId);
  const times = day ? (direction === 'to_hotel' ? day.toHotel : day.toPalmeraie) : [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.back}>← Retour</Text>
        </Pressable>
      </View>

      <PageHeader eyebrow="Palmeraie ↔ hôtel" title="Navettes" compact />

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
  topBar: { paddingHorizontal: space.card, paddingTop: 12 },
  back: { ...type.meta, color: theme.gold },
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
