import { StyleSheet, Text, View } from 'react-native';

import { space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { LEVEL_LEGEND } from '@/src/lib/levelColors';

/**
 * Légende niveaux workshops (couleurs affiches officielles).
 */
export function LevelLegend() {
  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <Text style={styles.title}>Niveaux</Text>
      <View style={styles.row}>
        {LEVEL_LEGEND.map((item) => (
          <View key={item.id} style={styles.item}>
            <View style={[styles.swatch, { backgroundColor: item.color }]} />
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: space.gapLg,
    paddingTop: space.gap,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    gap: 10,
  },
  title: {
    ...type.meta,
    color: theme.gold,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  label: {
    ...type.caption,
    color: theme.muted,
  },
});
