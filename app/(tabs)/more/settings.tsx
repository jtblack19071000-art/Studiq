import Constants from 'expo-constants';
import { H2, Paragraph, Text, YStack } from 'tamagui';

import { Card } from '@/src/components/Card';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import { supabase } from '@/src/lib/supabase';

export default function SettingsScreen() {
  return (
    <Screen>
      <YStack gap="$1" paddingTop="$2">
        <H2>Settings</H2>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Account & sync" />
        <Card>
          <Text fontWeight="600">Cloud sync</Text>
          <Paragraph color="$color10" fontSize="$3">
            {supabase
              ? 'Connected to Supabase.'
              : 'Not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable cloud sync — until then, everything is stored locally on this device.'}
          </Paragraph>
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
