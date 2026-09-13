import { StyleSheet, View, ViewProps } from 'react-native';

import { radius, theme } from '@/constants/theme';

type GlassCardProps = ViewProps & {
  featured?: boolean;
};

/** Surface plate — fond seul, pas de bordure + teinte + ombre empilés. */
export function GlassCard({ style, children, featured, ...rest }: GlassCardProps) {
  return (
    <View style={[styles.card, featured && styles.featured, style]} {...rest}>
      {children}
    </View>
  );
}

/** @deprecated Utiliser GlassCard */
export const SurfaceCard = GlassCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  featured: {
    backgroundColor: theme.surface2,
  },
});
