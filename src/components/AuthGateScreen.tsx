import { H1, Paragraph, Text, YStack } from 'tamagui';

import { AuthForm } from '@/src/components/AuthForm';
import { ACCENT_SOFT_BG, ACCENT_TINT, useThemeStore } from '@/src/state/themeStore';

/**
 * Full-screen sign-in/sign-up wall shown whenever cloud sync is configured (EXPO_PUBLIC_SUPABASE_URL
 * + EXPO_PUBLIC_SUPABASE_ANON_KEY) and no one is signed in yet. This is what keeps each account's
 * classes/schedule/finance/etc. separate — see startCloudSyncForUser in src/lib/cloudSync.ts.
 */
export function AuthGateScreen() {
  const accentColor = useThemeStore((state) => state.accentColor);

  return (
    <YStack flex={1} backgroundColor="$background" justifyContent="center" padding="$5" gap="$6">
      <YStack alignItems="center" gap="$2">
        <YStack
          width={72}
          height={72}
          borderRadius="$8"
          alignItems="center"
          justifyContent="center"
          style={{ backgroundColor: ACCENT_SOFT_BG[accentColor] }}>
          <Text fontSize={36}>🎓</Text>
        </YStack>
        <H1 fontSize="$9" style={{ color: ACCENT_TINT[accentColor] }}>
          Studiq
        </H1>
        <Paragraph color="$color10" textAlign="center" maxWidth={320}>
          Your classes, schedule, and study tools — sign in so they follow your account, not just
          this device.
        </Paragraph>
      </YStack>

      <AuthForm />
    </YStack>
  );
}
