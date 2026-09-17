import { useEffect, useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { useLocale } from '@/src/i18n/LocaleContext';
import { useAnnouncements } from '@/src/providers/AnnouncementsProvider';

/**
 * Bandeau urgent type ticker — clic pour le texte complet, fermable.
 */
export function UrgentBanner() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { t } = useLocale();
  const { urgent, dismissAllUrgent } = useAnnouncements();
  const offset = useSharedValue(0);
  const [detailOpen, setDetailOpen] = useState(false);

  const line = urgent
    ? `${urgent.title} — ${urgent.body}${urgent.link_label ? ` → ${urgent.link_label}` : ''}`
    : '';

  const badge =
    (urgent?.badge_label || '').trim() || t('urgent.badge');

  const marquee = line ? `${line}     ·     ${line}     ·     ` : '';

  useEffect(() => {
    if (!marquee || width <= 0) {
      cancelAnimation(offset);
      offset.value = 0;
      return;
    }
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

  useEffect(() => {
    setDetailOpen(false);
  }, [urgent?.id]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const openLink = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setDetailOpen(false);
    if (trimmed.startsWith('/')) {
      router.push(trimmed as '/passes');
      return;
    }
    Linking.openURL(trimmed).catch(() => undefined);
  };

  /** Tap bandeau : lien externe/interne si présent, sinon détail. */
  const onBannerPress = () => {
    if (!urgent) return;
    const url = (urgent.link_url || '').trim();
    if (url) {
      openLink(url);
      return;
    }
    setDetailOpen(true);
  };

  if (!urgent) return null;

  return (
    <>
      <View
        style={[styles.wrap, { paddingTop: Math.max(insets.top, 6) }]}
        accessibilityRole="alert"
        accessibilityLabel={line}
      >
        <View style={styles.row}>
          <Text style={styles.badge}>{badge}</Text>
          <Pressable
            onPress={onBannerPress}
            accessibilityRole="button"
            accessibilityLabel={t('urgent.readA11y')}
            style={styles.track}
          >
            <Animated.View style={[styles.marqueeRow, animStyle]}>
              <Text style={styles.marqueeText} numberOfLines={1}>
                {marquee}
              </Text>
            </Animated.View>
          </Pressable>
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

      <Modal
        visible={detailOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setDetailOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalBadge}>{badge}</Text>
            <Text style={styles.modalTitle}>{urgent.title}</Text>
            <Text style={styles.modalBody}>{urgent.body}</Text>
            {urgent.link_url ? (
              <Pressable
                onPress={() => openLink(urgent.link_url)}
                accessibilityRole="button"
                style={styles.modalLink}
              >
                <Text style={styles.modalLinkLabel}>
                  {urgent.link_label || urgent.link_url}
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => setDetailOpen(false)}
              accessibilityRole="button"
              style={styles.modalClose}
            >
              <Text style={styles.modalCloseLabel}>{t('urgent.closeDetail')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: theme.overlay,
    justifyContent: 'center',
    paddingHorizontal: space.screen,
  },
  modalCard: {
    backgroundColor: '#1a1230',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(255,180,80,0.35)',
    padding: space.card,
    gap: 10,
  },
  modalBadge: {
    ...type.meta,
    fontSize: 10,
    fontWeight: '700',
    color: theme.gold,
    letterSpacing: 0.8,
  },
  modalTitle: {
    ...type.title,
    fontSize: 18,
    color: theme.foreground,
  },
  modalBody: {
    ...type.body,
    fontSize: 15,
    color: theme.textSoft,
    lineHeight: 22,
  },
  modalLink: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  modalLinkLabel: {
    ...type.meta,
    color: theme.gold,
    fontSize: 13,
  },
  modalClose: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: theme.goldBorder,
  },
  modalCloseLabel: {
    ...type.body,
    fontSize: 14,
    color: theme.gold,
    fontWeight: '600',
  },
});
