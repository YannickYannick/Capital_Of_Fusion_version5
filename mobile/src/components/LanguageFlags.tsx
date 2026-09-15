import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { useLocale } from '@/src/i18n/LocaleContext';
import { LOCALES, type AppLocale } from '@/src/i18n/types';

/**
 * Sélecteur de langue par drapeaux (EN / FR / ES).
 */
export function LanguageFlags() {
  const { locale, setLocale, t } = useLocale();

  return (
    <View style={styles.wrap} accessibilityRole="radiogroup" accessibilityLabel={t('more.language')}>
      <Text style={styles.label}>{t('more.language')}</Text>
      <View style={styles.row}>
        {LOCALES.map((item) => {
          const active = locale === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setLocale(item.id as AppLocale)}
              style={({ pressed }) => [
                styles.flagBtn,
                active && styles.flagActive,
                pressed && styles.pressed,
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={item.name}
            >
              <Text style={styles.flag}>{item.flag}</Text>
              <Text style={[styles.code, active && styles.codeActive]}>{item.id.toUpperCase()}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  label: { ...type.meta, color: theme.gold },
  row: { flexDirection: 'row', gap: 10 },
  flagBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: radius.card,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  flagActive: {
    borderColor: theme.gold,
    backgroundColor: theme.goldSoft,
  },
  pressed: { opacity: 0.85 },
  flag: { fontSize: 28 },
  code: { ...type.meta, color: theme.muted, fontWeight: '600' },
  codeActive: { color: theme.gold },
});
