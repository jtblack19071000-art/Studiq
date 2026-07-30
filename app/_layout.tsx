import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { TamaguiProvider } from 'tamagui';

import { useColorScheme } from '@/components/useColorScheme';
import { syncScheduledReminders } from '@/src/lib/notifications';
import { configurePurchases } from '@/src/lib/purchases';
import { useAuthStore } from '@/src/state/authStore';
import { useScheduleStore } from '@/src/state/scheduleStore';
import { useSubscriptionStore } from '@/src/state/subscriptionStore';
import tamaguiConfig from '@/src/theme/tamagui.config';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const initAuth = useAuthStore((state) => state.init);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const refreshSubscription = useSubscriptionStore((state) => state.refresh);
  const scheduleEvents = useScheduleStore((state) => state.events);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    configurePurchases(userId)
      .then(refreshSubscription)
      .catch((error) => console.warn('Subscription refresh failed.', error));
  }, [userId, refreshSubscription]);

  useEffect(() => {
    // Re-syncs on every app launch and whenever the schedule changes, rolling the notification
    // window forward and picking up new/edited reminders. No-ops until permission is granted.
    syncScheduledReminders(scheduleEvents).catch((error) =>
      console.warn('Reminder sync failed.', error),
    );
  }, [scheduleEvents]);

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </TamaguiProvider>
  );
}
