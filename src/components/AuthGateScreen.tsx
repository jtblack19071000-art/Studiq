import { Image } from 'react-native';
import { ScrollView, Text, YStack } from 'tamagui';

import { AuthForm } from '@/src/components/AuthForm';
import { Icon, type IconName } from '@/src/components/Icon';
import { ACCENT_TINT, useThemeStore } from '@/src/state/themeStore';

const FEATURES: { icon: IconName; label: string }[] = [
  { icon: 'book', label: 'Classes &\nschedule' },
  { icon: 'robot', label: 'AI study\ntools' },
  { icon: 'dollar', label: 'Budget &\ngoals' },
];

/**
 * Full-screen sign-in/sign-up wall shown whenever cloud sync is configured (EXPO_PUBLIC_SUPABASE_URL
 * + EXPO_PUBLIC_SUPABASE_ANON_KEY) and no one is signed in yet. This is what keeps each account's
 * classes/schedule/finance/etc. separate — see startCloudSyncForUser in src/lib/cloudSync.ts.
 *
 * Laid out as a colored hero band (first-impression branding + a peek at what the app does) over
 * a compact form "sheet" — rather than one plain centered form stretched to fill the screen.
 */
export function AuthGateScreen() {
  const accentColor = useThemeStore((state) => state.accentColor);
  const tint = ACCENT_TINT[accentColor];

  return (
    <YStack flex={1} backgroundColor="$background">
      <YStack
        alignItems="center"
        gap="$3"
        paddingTop="$8"
        paddingBottom="$7"
        paddingHorizontal="$5"
        overflow="hidden"
        position="relative"
        style={{ backgroundColor: tint }}>
        <YStack
          position="absolute"
          top={-60}
          left={-50}
          width={180}
          height={180}
          borderRadius={999}
          style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
        />
        <YStack
          position="absolute"
          bottom={-70}
          right={-40}
          width={160}
          height={160}
          borderRadius={999}
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        />

        <Image
          source={require('../../assets/images/icon.png')}
          style={{ width: 64, height: 64, borderRadius: 15 }}
          resizeMode="cover"
        />
        <YStack alignItems="center" gap="$1" zIndex={1}>
          <Text fontSize="$9" fontWeight="800" color="white">
            Studiq
          </Text>
          <Text color="rgba(255,255,255,0.9)" textAlign="center" fontSize="$4" maxWidth={300}>
            The all-in-one college companion — sign in so it follows your account, not just this
            device.
          </Text>
        </YStack>

        <YStack flexDirection="row" gap="$5" paddingTop="$2" zIndex={1}>
          {FEATURES.map((feature) => (
            <YStack key={feature.label} alignItems="center" gap="$1" width={76}>
              <Icon name={feature.icon} size={26} color="white" />
              <Text color="white" fontSize="$1" fontWeight="600" textAlign="center" opacity={0.95}>
                {feature.label}
              </Text>
            </YStack>
          ))}
        </YStack>
      </YStack>

      <ScrollView flex={1} backgroundColor="$background" contentContainerStyle={{ flexGrow: 1 }}>
        <YStack
          backgroundColor="$background"
          borderTopLeftRadius="$8"
          borderTopRightRadius="$8"
          marginTop={-24}
          padding="$5"
          paddingTop="$6"
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: -3 }}
          shadowOpacity={0.08}
          shadowRadius={12}
          elevation={3}>
          <AuthForm />
        </YStack>
      </ScrollView>
    </YStack>
  );
}
