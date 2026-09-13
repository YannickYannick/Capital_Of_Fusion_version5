import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { radius, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { usePressScale } from '@/src/hooks/usePressScale';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'gold' | 'glass';
  style?: ViewStyle;
};

/** CTA — Inter sentence case, rayon 8px, sans glow. */
export function PrimaryButton({ label, onPress, variant = 'gold', style }: PrimaryButtonProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale();
  const isGold = variant === 'gold';

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} accessibilityRole="button">
      <Animated.View style={[animatedStyle, style]}>
        {isGold ? (
          <View style={styles.gold}>
            <Text style={styles.goldText}>{label}</Text>
          </View>
        ) : (
          <LinearGradient
            colors={[theme.ctaExploreStart, theme.ctaExploreEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <Text style={styles.glassText}>{label}</Text>
          </LinearGradient>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gold: {
    borderRadius: radius.button,
    backgroundColor: theme.gold,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  goldText: {
    ...type.cta,
    color: theme.brandForeground,
  },
  gradient: {
    borderRadius: radius.button,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  glassText: {
    ...type.cta,
    color: theme.foreground,
    fontSize: 14,
  },
});
