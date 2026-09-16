import { useEffect } from 'react';
import { X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { useLocale } from '@/src/i18n/LocaleContext';
import { useAnnouncements } from '@/src/providers/AnnouncementsProvider';

/**
 * Bandeau urgent type ticker — texte qui défile en boucle, fermable.
 */
export function UrgentBanner() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { t } = useLocale();
  const { urgent, dismissAllUrgent } = useAnnouncements();
  const offset = useSharedValue(0);

  const line = urgent
    ? `${urgent.title} — ${urgent.body}${urgent.link_label ? ` → ${urgent.link_label}` : ''}`
    : '';

  /** Deux copies pour une boucle sans trou. */
  const marquee = line ? `${line}     ·     ${line}     ·     ` : '';

  useEffect(() => {
    if (!marquee || width <= 0) {
      cancelAnimation(offset);
      offset.value = 0;
      return;
    }
    // Largeur approx. : ~7.2 px / caractère (font 13).
    const contentWidth = Math.max(marquee.length * 7.2, width);
    const distance = contentWidth / 2;
    const duration = Math.max(14_000, distance * 18);
    offset.value = 0;
    offset.value = withRepeat(
      withTiming(-distance, { duration, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(offset);
  }, [marquee, width, offset]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  if (!urgent) return null;

  return (
    <View
      style={[styles.wrap, { paddingTop: Math.max(insets.top, 6) }]}
      accessibilityRole="alert"
      accessibilityLabel={line}
    >
      <View style={styles.row}>
        <Text style={styles.badge}>{t('urgent.badge')}</Text>
        <View style={styles.track}>
          <Animated.View style={[styles.marqueeRow, animStyle]}>
            <Text style={styles.marqueeText} numberOfLines={1}>
              {marquee}
            </Text>
          </Animated.View>
        </View>
        <Pressable
          onPress={dismissAllUrgent}
          accessibilityRole="button"
          accessibilityLabel={t('urgent.dismissA11y')}
          hitSlop={10}
          style={styles.close}
        >
          <X size={16} color={theme.foreground} strokeWidth={2.5} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#5c1a1a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,180,80,0.35)',
    paddingBottom: 8,
    paddingHorizontal: 10,
    zIndex: 50,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 28,
  },
  badge: {
    ...type.meta,
    fontSize: 10,
    fontWeight: '700',
    color: theme.gold,
    letterSpacing: 0.8,
  },
  track: {
    flex: 1,
    overflow: 'hidden',
    height: 22,
    justifyContent: 'center',
  },
  marqueeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marqueeText: {
    ...type.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.92)',
    fontVariant: ['tabular-nums'],
  },
  close: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
});
