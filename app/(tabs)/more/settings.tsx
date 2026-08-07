import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Button, H2, Paragraph, Text, XStack, YStack } from 'tamagui';

import { AuthForm } from '@/src/components/AuthForm';
import { Card } from '@/src/components/Card';
import { Hero } from '@/src/components/Hero';
import { Icon } from '@/src/components/Icon';
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
import { ACCENT_COLORS, ACCENT_TINT, useThemeStore, type ColorSchemeOverride } from '@/src/state/themeStore';

const COLOR_SCHEME_OPTIONS: { value: ColorSchemeOverride; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const ACCENT_LABELS: Record<(typeof ACCENT_COLORS)[number], string> = {
  blue: 'Blue',
  green: 'Green',
  red: 'Red',
  yellow: 'Yellow',
};

export default function SettingsScreen() {
  const session = useAuthStore((state) => state.session);
  const signOut = useAuthStore((state) => state.signOut);
  const tier = useSubscriptionStore((state) => state.tier);
  const scheduleEvents = useScheduleStore((state) => state.events);
  const accentColor = useThemeStore((state) => state.accentColor);

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
        <XStack alignItems="center" gap="$2">
          <Icon name="settings" size={22} color="#3B6FE0" />
          <H2>Settings</H2>
        </XStack>
      </YStack>

      <Hero logo alignItems="center" gap="$1" paddingVertical="$5">
        <Icon name={tier === 'premium' ? 'diamond' : 'cloud'} size={32} color={ACCENT_TINT[accentColor]} />
        <Text fontWeight="800" fontSize="$6" style={{ color: ACCENT_TINT[accentColor] }}>
          {tier === 'premium' ? 'Premium plan' : 'Free plan'}
        </Text>
      </Hero>

      <YStack gap="$2">
        <SectionHeader title="Account & sync" icon="cloud" />
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
        <SectionHeader title="Subscription" icon="diamond" />
        <Card>
          <Text fontWeight="600">
            Current plan: {tier === 'premium' ? 'Premium' : 'Free'}
          </Text>
          {tier === 'premium' ? (
            <Paragraph color="$color10" fontSize="$3">
              You have access to lecture recording, AI transcription, and AI-generated study
              materials.
            </Paragraph>
          ) : null}
        </Card>
        {tier !== 'premium' && supabase && session ? (
          <Card>
            <Paywall />
          </Card>
        ) : null}
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Reminders & notifications" icon="bell" />
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

      <AppearanceSection />

      <YStack gap="$2">
        <SectionHeader title="About" icon="info" />
        <Card>
          <Paragraph color="$color10" fontSize="$3">
            Studiq v{Constants.expoConfig?.version ?? '1.0.0'}
          </Paragraph>
        </Card>
      </YStack>
    </Screen>
  );
}

function AppearanceSection() {
  const accentColor = useThemeStore((state) => state.accentColor);
  const setAccentColor = useThemeStore((state) => state.setAccentColor);
  const colorSchemeOverride = useThemeStore((state) => state.colorSchemeOverride);
  const setColorSchemeOverride = useThemeStore((state) => state.setColorSchemeOverride);

  return (
    <YStack gap="$2">
      <SectionHeader title="Appearance" />
      <Card gap="$3">
        <YStack gap="$2">
          <Text fontWeight="600" fontSize="$3">
            Theme
          </Text>
          <XStack gap="$2">
            {COLOR_SCHEME_OPTIONS.map((option) => (
              <Button
                key={option.value}
                flex={1}
                size="$3"
                theme={colorSchemeOverride === option.value ? 'active' : undefined}
                onPress={() => setColorSchemeOverride(option.value)}>
                {option.label}
              </Button>
            ))}
          </XStack>
        </YStack>

        <YStack gap="$2">
          <Text fontWeight="600" fontSize="$3">
            Accent color
          </Text>
          <XStack flexWrap="wrap" gap="$2">
            {ACCENT_COLORS.map((color) => (
              <YStack
                key={color}
                alignItems="center"
                gap="$1"
                onPress={() => setAccentColor(color)}
                pressStyle={{ opacity: 0.7 }}>
                <YStack
                  width={36}
                  height={36}
                  borderRadius={18}
                  borderWidth={accentColor === color ? 3 : 0}
                  borderColor="$color12"
                  style={{ backgroundColor: ACCENT_TINT[color] }}
                />
                <Text fontSize="$1" color="$color10">
                  {ACCENT_LABELS[color]}
                </Text>
              </YStack>
            ))}
          </XStack>
        </YStack>
      </Card>
    </YStack>
  );
}
