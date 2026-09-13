import { StyleSheet, Text, View } from 'react-native';

import { radius, theme } from '@/constants/theme';
import { type } from '@/constants/typography';

export function LivePill() {
  return (
    <View style={styles.pill}>
      <Text style={styles.text}>En direct</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.chip,
    backgroundColor: theme.goldSoft,
  },
  text: {
    ...type.meta,
    color: theme.gold,
  },
});
