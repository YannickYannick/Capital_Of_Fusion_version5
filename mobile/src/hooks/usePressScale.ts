import { useCallback } from 'react';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { spring } from '@/src/lib/motion';

/** Scale léger au press — chips, boutons, onglets. */
export function usePressScale(active = false) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = useCallback(() => {
    scale.value = withSpring(0.94, spring.press);
  }, [scale]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(active ? 1.04 : 1, spring.press);
  }, [active, scale]);

  return { animatedStyle, onPressIn, onPressOut };
}
