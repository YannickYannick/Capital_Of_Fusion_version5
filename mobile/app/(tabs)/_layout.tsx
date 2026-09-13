import { Tabs } from 'expo-router';

import { PbvfTabBar } from '@/src/components/PbvfTabBar';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      tabBar={(props) => <PbvfTabBar {...(props as unknown as import('@/src/components/PbvfTabBar').TabBarProps)} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="timetable" options={{ title: 'Planning' }} />
      <Tabs.Screen name="map" options={{ title: 'Carte' }} />
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="lineup" options={{ title: 'Artistes' }} />
      <Tabs.Screen name="more" options={{ title: 'Plus' }} />
    </Tabs>
  );
}
