import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { LevelLegend } from '@/src/components/LevelLegend';
import { PageHeader } from '@/src/components/PageHeader';
import { SlotRow } from '@/src/components/SlotRow';
import { Chip } from '@/src/components/ui/Chip';
import { useFavorites } from '@/src/hooks/useFavorites';
import { useProgram } from '@/src/hooks/useProgram';

export default function TimetableScreen() {
  const { days, stages, slots, loading, error } = useProgram();
  const [day, setDay] = useState<string | null>(null);
  const [stage, setStage] = useState<string>('all');
  const [onlyFavs, setOnlyFavs] = useState(false);
  const { has, toggle } = useFavorites();

  const activeDay = day ?? days[0]?.id ?? 'jeu';

  /**
   * Favoris = les 4 jours (ignore le filtre jour). Sinon = jour actif.
   */
  const visibleSlots = slots
    .filter(
      (s) =>
        (onlyFavs || s.day === activeDay) &&
        (stage === 'all' || s.stage === stage) &&
        (!onlyFavs || has(String(s.id))),
    )
    .sort((a, b) => {
      if (onlyFavs && a.day !== b.day) {
        const ai = days.findIndex((d) => d.id === a.day);
        const bi = days.findIndex((d) => d.id === b.day);
        return ai - bi;
      }
      return a.start.localeCompare(b.start);
    });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 120 }}>
      <PageHeader eyebrow="Workshops & soirées" title="Planning" compact />

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color={theme.gold} size="large" />
        </View>
      )}

      {error && !loading && <Text style={styles.empty}>{error}</Text>}

      {!loading && !error && (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            <Chip
              label="★ Favoris"
              active={onlyFavs}
              onPress={() => setOnlyFavs((v) => !v)}
              variant="favorite"
            />
            {days.map((d) => (
              <Chip
                key={d.id}
                label={`${d.label} ${d.date}`}
                active={!onlyFavs && d.id === activeDay}
                onPress={() => {
                  setOnlyFavs(false);
                  setDay(d.id);
                }}
                variant="day"
              />
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsStage}>
            <Chip
              key="all"
              label="Toutes salles"
              active={stage === 'all'}
              onPress={() => setStage('all')}
              variant="stage"
            />
            {stages.map((s) => (
              <Chip
                key={s}
                label={s}
                active={s === stage}
                onPress={() => setStage(s)}
                variant="stage"
              />
            ))}
          </ScrollView>

          <View style={styles.list}>
            {visibleSlots.length === 0 ? (
              <Text style={styles.empty}>
                {onlyFavs ? 'Aucun favori pour l’instant.' : 'Aucun créneau pour ces filtres.'}
              </Text>
            ) : (
              visibleSlots.map((s, i) => {
                const dayMeta = days.find((d) => d.id === s.day);
                const showDayHeader =
                  onlyFavs && (i === 0 || visibleSlots[i - 1]?.day !== s.day);
                return (
                  <View key={String(s.id)}>
                    {showDayHeader ? (
                      <Text style={styles.dayHeading}>
                        {dayMeta ? `${dayMeta.label} ${dayMeta.date}` : s.day}
                      </Text>
                    ) : null}
                    <SlotRow
                      slot={s}
                      favorite={has(String(s.id))}
                      onToggle={(id) => toggle(id)}
                      index={i}
                    />
                  </View>
                );
              })
            )}
            <LevelLegend />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  chips: { paddingHorizontal: space.card, gap: 8, paddingBottom: 8 },
  chipsStage: { paddingHorizontal: space.card, gap: 8, paddingBottom: space.card },
  list: { paddingHorizontal: space.card, gap: space.gap },
  dayHeading: {
    ...type.meta,
    fontSize: 12,
    color: theme.gold,
    marginTop: space.gap,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  center: { paddingVertical: 48, alignItems: 'center' },
  empty: {
    textAlign: 'center',
    paddingVertical: 32,
    paddingHorizontal: space.card,
    ...type.body,
    color: theme.muted,
  },
});
