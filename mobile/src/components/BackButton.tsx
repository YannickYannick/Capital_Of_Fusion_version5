import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { useLocale } from '@/src/i18n/LocaleContext';

type BackButtonProps = {
  /** Fallback si l’historique est vide (ex. deep link PWA). */
  fallbackHref?: string;
  /** Superposé sur un hero (fond semi-opaque). */
  floating?: boolean;
  label?: string;
};

/**
 * Bouton retour — pastille or + chevron (plus lisible que le texte « ← Retour »).
 */
export function BackButton({
  fallbackHref = '/(tabs)/lineup',
  floating = false,
  label,
}: BackButtonProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLocale();
  const resolvedLabel = label ?? t('common.back');

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(fallbackHref as never);
  };

  return (
    <View style={[styles.wrap, floating && { paddingTop: insets.top + 8 }]}>
      <Pressable
        onPress={goBack}
        style={({ pressed }) => [styles.btn, floating && styles.btnFloating, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={resolvedLabel}
        hitSlop={8}
      >
        <ChevronLeft size={20} color={theme.gold} strokeWidth={2.5} />
        <Text style={styles.label}>{resolvedLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 12,
    paddingTop: 8,
    zIndex: 10,
  },
  btn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingLeft: 6,
    paddingRight: 14,
    borderRadius: radius.pill,
    backgroundColor: theme.goldSoft,
  },
  btnFloating: {
    backgroundColor: 'rgba(10, 14, 39, 0.82)',
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    ...type.meta,
    color: theme.gold,
    textTransform: 'none',
    letterSpacing: 0,
    fontSize: 13,
  },
});
