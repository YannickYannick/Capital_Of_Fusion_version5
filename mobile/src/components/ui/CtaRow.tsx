import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import { usePressScale } from '@/src/hooks/usePressScale';
import Animated from 'react-native-reanimated';

type CtaRowProps = {
  label: string;
  onPress: () => void;
};

export function CtaRow({ label, onPress }: CtaRowProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.row}
      accessibilityRole="button"
    >
      <Animated.View style={[styles.inner, animatedStyle]}>
        <Text style={styles.label}>{label}</Text>
        <ChevronRight size={18} color={theme.gold} strokeWidth={2.5} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderTopWidth: 1,
    borderTopColor: theme.borderStrong,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: fonts.semiBoldBody,
    fontSize: 14,
    color: theme.foreground,
  },
});
