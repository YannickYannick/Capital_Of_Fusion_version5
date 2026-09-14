import { useRouter } from 'expo-router';
import { CalendarDays, Map, Music2 } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { radius, space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { usePressScale } from '@/src/hooks/usePressScale';

const ACTIONS = [
  { label: 'Planning', route: '/(tabs)/timetable', Icon: CalendarDays },
  { label: 'Carte', route: '/(tabs)/map', Icon: Map },
  { label: 'Artistes', route: '/(tabs)/lineup', Icon: Music2 },
] as const;

function ActionTile({
  label,
  Icon,
  onPress,
}: {
  label: string;
  Icon: typeof CalendarDays;
  onPress: () => void;
}) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale();

  return (
    <Pressable style={styles.tilePress} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.tile, animatedStyle]}>
        <Icon size={20} color={theme.gold} strokeWidth={2} />
        <Text style={styles.tileLabel}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

/** Raccourcis — même forme que l’APK. */
export function QuickActions() {
  const router = useRouter();

  return (
    <View style={styles.row}>
      {ACTIONS.map((a) => (
        <ActionTile key={a.route} label={a.label} Icon={a.Icon} onPress={() => router.push(a.route)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: space.gap,
    marginTop: space.gapLg,
    marginBottom: space.gap,
  },
  tilePress: { flex: 1 },
  tile: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: radius.card,
    backgroundColor: theme.surface,
  },
  tileLabel: {
    ...type.meta,
    fontSize: 12,
    color: theme.foreground,
  },
});
