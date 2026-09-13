import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { radius, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { spring } from '@/src/lib/motion';

type ChipVariant = 'day' | 'stage' | 'toggle';

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

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.96, spring.press);
      }}
      onPressOut={() => {
        scale.value = withSpring(active ? 1.02 : 1, spring.press);
      }}
    >
      <Animated.View
        style={[
          isStage ? styles.stage : isToggle ? styles.toggle : styles.day,
          active && (isStage ? styles.stageActive : isToggle ? styles.toggleActive : styles.dayActive),
          animatedStyle,
          style,
        ]}
      >
        <Text
          style={[
            styles.text,
            active && (isStage ? styles.stageTextActive : isToggle ? styles.toggleTextActive : styles.dayTextActive),
          ]}
        >
          {label}
        </Text>
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
  text: { ...type.meta, fontSize: 12, color: theme.muted },
  dayTextActive: { color: theme.brandForeground },
  stageTextActive: { color: theme.gold },
  toggleTextActive: { color: theme.gold },
});
