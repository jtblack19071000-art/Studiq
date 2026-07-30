import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Button, H2, Paragraph, Text, YStack } from 'tamagui';

import { AuthForm } from '@/src/components/AuthForm';
import { Card } from '@/src/components/Card';
import { Paywall } from '@/src/components/Paywall';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import {
  isNotificationPermissionGranted,
  notificationsSchedulingSupported,
  requestNotificationPermissions,
  syncScheduledReminders,
} from '@/src/lib/notifications';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/state/authStore';
import { useScheduleStore } from '@/src/state/scheduleStore';
import { useSubscriptionStore } from '@/src/state/subscriptionStore';

export default function SettingsScreen() {
  const session = useAuthStore((state) => state.session);
  const signOut = useAuthStore((state) => state.signOut);
  const tier = useSubscriptionStore((state) => state.tier);
  const scheduleEvents = useScheduleStore((state) => state.events);

  const [notificationsGranted, setNotificationsGranted] = useState<boolean | null>(null);

  useEffect(() => {
    isNotificationPermissionGranted().then(setNotificationsGranted);
  }, []);

  async function handleEnableNotifications() {
    const granted = await requestNotificationPermissions();
    setNotificationsGranted(granted);
    if (granted) {
      await syncScheduledReminders(scheduleEvents);
    }
  }

  return (
    <Screen>
      <YStack gap="$1" paddingTop="$2">
        <H2>Settings</H2>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Account & sync" />
        <Card gap="$3">
          <YStack>
            <Text fontWeight="600">Cloud sync</Text>
            <Paragraph color="$color10" fontSize="$3">
              {supabase
                ? 'Connected to Supabase.'
                : 'Not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable cloud sync — until then, everything is stored locally on this device.'}
            </Paragraph>
          </YStack>
          {supabase ? (
            session ? (
              <YStack gap="$2">
                <Paragraph fontSize="$3">Signed in as {session.user.email}</Paragraph>
                <Button size="$3" onPress={signOut}>
                  Sign out
                </Button>
              </YStack>
            ) : (
              <AuthForm />
            )
          ) : null}
        </Card>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Subscription" />
        <Card>
          <Text fontWeight="600">
            Current plan: {tier === 'platinum' ? 'Platinum' : 'Free'}
          </Text>
          {tier === 'platinum' ? (
            <Paragraph color="$color10" fontSize="$3">
              You have access to lecture recording, AI-generated study materials, and College
              Match.
            </Paragraph>
          ) : null}
        </Card>
        {tier !== 'platinum' && supabase && session ? (
          <Card>
            <Paywall />
          </Card>
        ) : null}
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Reminders & notifications" />
        <Card gap="$2">
          {!notificationsSchedulingSupported ? (
            <Paragraph color="$color10" fontSize="$3">
              Reminders are local device notifications, which aren&apos;t supported in a web
              browser. Open Studiq on iOS or Android to receive them.
            </Paragraph>
          ) : notificationsGranted ? (
            <Text fontWeight="600">Reminders are on.</Text>
          ) : (
            <YStack gap="$2">
              <Paragraph color="$color10" fontSize="$3">
                Turn on notifications to get reminders for classes, work, and other schedule
                events — set per-event in Quick Add. These are scheduled on this device only;
                Studiq has no server sending you notifications.
              </Paragraph>
              <Button size="$3" theme="active" onPress={handleEnableNotifications}>
                Enable notifications
              </Button>
            </YStack>
          )}
        </Card>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Appearance" />
        <Card>
          <Paragraph color="$color10" fontSize="$3">
            Studiq follows your device&apos;s light/dark setting automatically.
          </Paragraph>
        </Card>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="About" />
        <Card>
          <Paragraph color="$color10" fontSize="$3">
            Studiq v{Constants.expoConfig?.version ?? '1.0.0'}
          </Paragraph>
        </Card>
      </YStack>
    </Screen>
  );
}
