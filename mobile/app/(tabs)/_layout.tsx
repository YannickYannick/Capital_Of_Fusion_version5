import { Tabs } from 'expo-router';

import { PbvfTabBar } from '@/src/components/PbvfTabBar';
import { useLocale } from '@/src/i18n/LocaleContext';

export default function TabLayout() {
  const { t } = useLocale();

  return (
    <Tabs
      initialRouteName="index"
      tabBar={(props) => <PbvfTabBar {...(props as unknown as import('@/src/components/PbvfTabBar').TabBarProps)} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="timetable" options={{ title: t('tabs.timetable') }} />
      <Tabs.Screen name="map" options={{ title: t('tabs.map') }} />
      <Tabs.Screen name="index" options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="lineup" options={{ title: t('tabs.lineup') }} />
      <Tabs.Screen name="more" options={{ title: t('tabs.more') }} />
    </Tabs>
  );
}
