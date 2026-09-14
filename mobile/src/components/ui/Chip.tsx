import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { radius, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { spring } from '@/src/lib/motion';

type ChipVariant = 'day' | 'stage' | 'toggle' | 'favorite';

type ChipProps = {
  label: string;
  active?: boolean;
  onPress: () => void;
  variant?: ChipVariant;
  style?: ViewStyle;
};

export function Chip({ label, active = false, onPress, variant = 'day', style }: ChipProps) {
  const scale = useSharedValue(1);
  const activeProgress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    activeProgress.value = withSpring(active ? 1 : 0, spring.press);
    scale.value = withSpring(active ? 1.02 : 1, spring.press);
  }, [active, activeProgress, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isStage = variant === 'stage';
  const isToggle = variant === 'toggle';
  const isFavorite = variant === 'favorite';

  const baseStyle = isFavorite
    ? styles.favorite
    : isStage
      ? styles.stage
      : isToggle
        ? styles.toggle
        : styles.day;
  const activeStyle = isFavorite
    ? styles.favoriteActive
    : isStage
      ? styles.stageActive
      : isToggle
        ? styles.toggleActive
        : styles.dayActive;
  const textActiveStyle = isFavorite
    ? styles.favoriteTextActive
    : isStage
      ? styles.stageTextActive
      : isToggle
        ? styles.toggleTextActive
        : styles.dayTextActive;
  const textIdleStyle = isFavorite ? styles.favoriteText : styles.text;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.96, spring.press);
      }}
      onPressOut={() => {
        scale.value = withSpring(active ? 1.02 : 1, spring.press);
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Animated.View style={[baseStyle, active && activeStyle, animatedStyle, style]}>
        <Text style={[textIdleStyle, active && textActiveStyle]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  day: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.chip,
    backgroundColor: theme.surface,
  },
  dayActive: { backgroundColor: theme.gold },
  stage: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.chip,
    backgroundColor: theme.surface,
  },
  stageActive: {
    backgroundColor: theme.stage,
  },
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.chip,
    backgroundColor: 'transparent',
  },
  toggleActive: { backgroundColor: theme.goldSoft },
  favorite: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.chip,
    backgroundColor: theme.goldSoft,
    borderWidth: 1,
    borderColor: theme.goldBorder,
  },
  favoriteActive: {
    backgroundColor: theme.gold,
    borderColor: theme.gold,
  },
  text: { ...type.meta, fontSize: 12, color: theme.muted },
  dayTextActive: { color: theme.brandForeground },
  stageTextActive: { color: theme.gold },
  toggleTextActive: { color: theme.gold },
  favoriteText: { ...type.meta, fontSize: 12, color: theme.gold, fontWeight: '700' },
  favoriteTextActive: { color: theme.brandForeground, fontWeight: '700' },
});
