import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { TamaguiProvider, Theme } from 'tamagui';

import { useColorScheme } from '@/components/useColorScheme';
import { syncScheduledReminders } from '@/src/lib/notifications';
import { configurePurchases } from '@/src/lib/purchases';
import { useAuthStore } from '@/src/state/authStore';
import { useScheduleStore } from '@/src/state/scheduleStore';
import { useSubscriptionStore } from '@/src/state/subscriptionStore';
import { useThemeStore } from '@/src/state/themeStore';
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
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const accentColor = useThemeStore((state) => state.accentColor);
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
      {/* Accent color is a Tamagui sub-theme layered via nested <Theme>, not a flat "light_blue"
          string — Tamagui's web CSS only extracts variables for the nested-descendant selector
          form (e.g. `:root.t_dark .t_blue`), not a combined single-class name. */}
      <Theme name={accentColor}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="event-detail" options={{ presentation: 'modal', title: 'Event' }} />
        </Stack>
      </Theme>
    </TamaguiProvider>
  );
}
