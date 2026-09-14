import { Star } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { radius, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { colorForLevel } from '@/src/lib/levelColors';
import { spring } from '@/src/lib/motion';
import type { ProgramSlotApi } from '@/src/types/api';

type SlotRowProps = {
  slot: ProgramSlotApi;
  favorite: boolean;
  onToggle: (id: string) => void;
  index?: number;
};

/**
 * Ligne créneau planning — bandeau couleur selon niveau workshop.
 */
export function SlotRow({ slot, favorite, onToggle, index = 0 }: SlotRowProps) {
  const starScale = useSharedValue(1);
  const levelColor = colorForLevel(slot.level);

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }],
  }));

  const handleToggle = () => {
    starScale.value = withSequence(withSpring(1.35, spring.favorite), withSpring(1, spring.favorite));
    onToggle(slot.id);
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).springify().damping(18)}>
      <View
        style={[
          styles.card,
          slot.live && styles.live,
          levelColor ? { borderLeftColor: levelColor, borderLeftWidth: 4 } : null,
        ]}
      >
        <View style={styles.time}>
          <Text style={styles.start}>{slot.start}</Text>
          <Text style={styles.end}>{slot.end}</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.artist} numberOfLines={1}>
            {slot.artist}
          </Text>
          <Text style={styles.meta} numberOfLines={2}>
            {slot.genre} · {slot.stage}
            {slot.notInFullPass ? ' · Hors pass' : ''}
          </Text>
          {levelColor ? (
            <View style={styles.levelRow}>
              <View style={[styles.levelDot, { backgroundColor: levelColor }]} />
              <Text style={[styles.levelText, { color: levelColor }]}>
                {levelLabel(slot.level)}
              </Text>
            </View>
          ) : null}
        </View>
        <Pressable
          onPress={handleToggle}
          accessibilityRole="button"
          accessibilityLabel={
            favorite ? `Retirer ${slot.artist} des favoris` : `Ajouter ${slot.artist} aux favoris`
          }
          style={styles.starBtn}
          hitSlop={8}
        >
          <Animated.View style={starStyle}>
            <Star
              size={20}
              color={favorite ? theme.gold : theme.muted}
              fill={favorite ? theme.gold : 'transparent'}
            />
          </Animated.View>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function levelLabel(level?: string): string {
  switch ((level ?? '').toLowerCase()) {
    case 'open':
      return 'Open Level';
    case 'beginner':
      return 'Beginner';
    case 'intermediate':
      return 'Intermediate';
    case 'advanced':
      return 'Advanced';
    default:
      return level ?? '';
  }
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: theme.surface,
    borderRadius: radius.card,
    borderLeftWidth: 0,
  },
  live: {
    backgroundColor: theme.surface2,
  },
  time: { width: 48, alignItems: 'flex-start' },
  start: { ...type.caption, fontFamily: type.caption.fontFamily, color: theme.foreground },
  end: { marginTop: 2, ...type.caption, fontSize: 10, color: theme.muted },
  body: { flex: 1, minWidth: 0 },
  artist: { ...type.title, fontSize: 16, color: theme.foreground },
  meta: { marginTop: 2, ...type.caption, color: theme.muted },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  levelDot: {
    width: 7,
    height: 7,
    borderRadius: 2,
  },
  levelText: {
    ...type.caption,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  starBtn: { padding: 6 },
});
