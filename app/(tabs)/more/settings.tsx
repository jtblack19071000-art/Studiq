import Constants from 'expo-constants';
import { Button, H2, Paragraph, Text, YStack } from 'tamagui';

import { AuthForm } from '@/src/components/AuthForm';
import { Card } from '@/src/components/Card';
import { Paywall } from '@/src/components/Paywall';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/state/authStore';
import { useSubscriptionStore } from '@/src/state/subscriptionStore';

export default function SettingsScreen() {
  const session = useAuthStore((state) => state.session);
  const signOut = useAuthStore((state) => state.signOut);
  const tier = useSubscriptionStore((state) => state.tier);

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
