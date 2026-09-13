import { CalendarDays, Home, Map, MoreHorizontal, Music2 } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { spring } from '@/src/lib/motion';

export type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (event: { type: string; target: string; canPreventDefault?: boolean }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
};

const TABS: {
  name: string;
  label: string;
  Icon: typeof CalendarDays;
}[] = [
  { name: 'timetable', label: 'Planning', Icon: CalendarDays },
  { name: 'map', label: 'Carte', Icon: Map },
  { name: 'index', label: 'Accueil', Icon: Home },
  { name: 'lineup', label: 'Artistes', Icon: Music2 },
  { name: 'more', label: 'Plus', Icon: MoreHorizontal },
];

function TabItem({
  label,
  Icon,
  focused,
  onPress,
}: {
  label: string;
  Icon: typeof CalendarDays;
  focused: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.04 : 1, spring.tab);
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const color = focused ? theme.gold : theme.muted;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.92, spring.press);
      }}
      onPressOut={() => {
        scale.value = withSpring(focused ? 1.04 : 1, spring.press);
      }}
      style={styles.item}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
    >
      <Animated.View style={[styles.iconWrap, animatedStyle]}>
        <Icon size={focused ? 22 : 20} color={color} strokeWidth={focused ? 2.5 : 1.75} />
        {focused && <View style={styles.dot} />}
      </Animated.View>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function PbvfTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  const go = (name: string) => {
    const route = state.routes.find((r: { name: string; key: string }) => r.name === name);
    if (!route) return;
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!event.defaultPrevented) navigation.navigate(name);
  };

  const isFocused = (name: string) => state.routes[state.index]?.name === name;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map(({ name, label, Icon }) => (
        <TabItem
          key={name}
          label={label}
          Icon={Icon}
          focused={isFocused(name)}
          onPress={() => go(name)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: 'rgba(10, 14, 39, 0.98)',
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  item: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 6 },
  iconWrap: { alignItems: 'center', height: 26, justifyContent: 'center' },
  dot: {
    marginTop: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.gold,
  },
  label: { ...type.meta, fontSize: 10 },
});
