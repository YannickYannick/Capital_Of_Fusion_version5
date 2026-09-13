import { StyleSheet, Text, View } from 'react-native';

import { space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  compact?: boolean;
};

export function PageHeader({ eyebrow, title, subtitle, compact }: PageHeaderProps) {
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: space.screen,
    paddingTop: 28,
    paddingBottom: space.card,
  },
  wrapCompact: {
    paddingTop: 22,
    paddingBottom: 10,
  },
  eyebrow: {
    ...type.meta,
    color: theme.gold,
  },
  title: {
    ...type.display,
    marginTop: 4,
    color: theme.foreground,
  },
  titleCompact: {
    fontSize: 24,
    lineHeight: 28,
  },
  subtitle: {
    marginTop: 6,
    ...type.body,
    color: theme.textMuted,
  },
});
