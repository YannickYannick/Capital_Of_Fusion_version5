import { WithSpringConfig } from 'react-native-reanimated';

export const spring = {
  press: { damping: 16, stiffness: 320, mass: 0.6 } satisfies WithSpringConfig,
  tab: { damping: 18, stiffness: 260 } satisfies WithSpringConfig,
  favorite: { damping: 12, stiffness: 400 } satisfies WithSpringConfig,
} as const;
