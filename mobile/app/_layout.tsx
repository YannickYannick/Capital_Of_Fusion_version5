import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { theme } from '@/constants/theme';
import { DesktopGate } from '@/src/components/DesktopGate';
import { UrgentBanner } from '@/src/components/UrgentBanner';
import { LocaleProvider } from '@/src/i18n/LocaleContext';
import { AnnouncementsProvider } from '@/src/providers/AnnouncementsProvider';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Urbane-Light': require('../assets/fonts/urbane/Urbane-Light.ttf'),
    'Urbane-Medium': require('../assets/fonts/urbane/Urbane-Medium.ttf'),
    'Urbane-DemiBold': require('../assets/fonts/urbane/Urbane-DemiBold.ttf'),
    'Urbane-Bold': require('../assets/fonts/urbane/Urbane-Bold.ttf'),
    'Urbane-Heavy': require('../assets/fonts/urbane/Urbane-Heavy.ttf'),
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  /** Filet si useFonts ne résout jamais (Expo Go / émulateur) — évite spinner infini. */
  const [bootstrapTimedOut, setBootstrapTimedOut] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setBootstrapTimedOut(true), 2500);
    return () => clearTimeout(timeout);
  }, []);

  const ready = fontsLoaded || Boolean(fontError) || bootstrapTimedOut;

  useEffect(() => {
    if (!ready) return;
    SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  // Garder le splash natif (#0a0e27) plutôt qu’un écran blanc + spinner système.
  if (!ready) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <LocaleProvider>
        <AnnouncementsProvider>
          <DesktopGate>
            <View style={{ flex: 1, backgroundColor: theme.background }}>
              <UrgentBanner />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: theme.background },
                }}
              >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="artist/[username]" />
                <Stack.Screen name="jack-n-jill" />
                <Stack.Screen name="all-star-street-battle" />
                <Stack.Screen name="shuttles" />
                <Stack.Screen name="passes" />
            <Stack.Screen name="code-of-conduct" />
            <Stack.Screen name="faq" />
          </Stack>
            </View>
          </DesktopGate>
        </AnnouncementsProvider>
      </LocaleProvider>
    </SafeAreaProvider>
  );
}
