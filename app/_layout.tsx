import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { TamaguiProvider, Theme } from 'tamagui';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthGateScreen } from '@/src/components/AuthGateScreen';
import { syncScheduledReminders } from '@/src/lib/notifications';
import { configurePurchases } from '@/src/lib/purchases';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/state/authStore';
import '@/src/state/campusResourcesStore';
import '@/src/state/careerStore';
import '@/src/state/classesStore';
import '@/src/state/collegeMatchStore';
import '@/src/state/financeStore';
import '@/src/state/goalsStore';
import '@/src/state/notesStore';
import { useScheduleStore } from '@/src/state/scheduleStore';
import '@/src/state/studyStore';
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
  const authInitializing = useAuthStore((state) => state.initializing);
  const session = useAuthStore((state) => state.session);
  const pendingVerification = useAuthStore((state) => state.pendingVerification);
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

  // Cloud sync (see src/lib/cloudSync.ts) is what makes accounts actually separate — without a
  // sign-in wall, anyone could use the app on someone else's already-authenticated device. When
  // Supabase isn't configured there's no account system to gate behind, so the app stays fully
  // usable offline, matching how every other cloud-optional feature here degrades.
  //
  // pendingVerification also keeps the wall up even once a session exists: a sign-up isn't done
  // until its code is verified, and verifying a password-recovery code establishes a session
  // before the user has actually chosen a new password — see AuthForm.tsx.
  const requiresSignIn = Boolean(supabase) && (authInitializing || !session || Boolean(pendingVerification));

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme}>
      {/* Accent color is a Tamagui sub-theme layered via nested <Theme>, not a flat "light_blue"
          string — Tamagui's web CSS only extracts variables for the nested-descendant selector
          form (e.g. `:root.t_dark .t_blue`), not a combined single-class name. */}
      <Theme name={accentColor}>
        {requiresSignIn ? (
          <AuthGateScreen />
        ) : (
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="event-detail" options={{ presentation: 'modal', title: 'Event' }} />
          </Stack>
        )}
      </Theme>
    </TamaguiProvider>
  );
}
