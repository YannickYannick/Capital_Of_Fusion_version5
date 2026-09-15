import { StyleSheet, Text, View } from 'react-native';

import { space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { useLocale } from '@/src/i18n/LocaleContext';
import { LEVEL_LEGEND } from '@/src/lib/levelColors';

/**
 * Légende niveaux workshops (couleurs affiches officielles).
 */
export function LevelLegend() {
  const { t } = useLocale();

  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <Text style={styles.title}>{t('timetable.levels')}</Text>
      <View style={styles.row}>
        {LEVEL_LEGEND.map((item) => (
          <View key={item.id} style={styles.item}>
            <View style={[styles.swatch, { backgroundColor: item.color }]} />
            <Text style={styles.label}>{t(`levels.${item.id}`)}</Text>
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
