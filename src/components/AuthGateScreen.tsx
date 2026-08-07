import { Image, useWindowDimensions } from 'react-native';
import { ScrollView, Text, XStack, YStack } from 'tamagui';

import { AuthForm } from '@/src/components/AuthForm';
import { Icon, type IconName } from '@/src/components/Icon';
import { ACCENT_TINT, useThemeStore, type AccentColor } from '@/src/state/themeStore';

const FEATURES: { icon: IconName; label: string }[] = [
  { icon: 'book', label: 'Classes &\nschedule' },
  { icon: 'robot', label: 'AI study\ntools' },
  { icon: 'dollar', label: 'Budget &\ngoals' },
];

/** A soft blurred color disc — the layered building block of the abstract art panel. Blur is a
 * plain CSS property passed through Tamagui's style prop, which React Native silently ignores on
 * native (harmless — the discs just render solid there instead of soft). */
function Blob({ size, top, left, right, bottom, color, opacity, blur }: {
  size: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  color: string;
  opacity: number;
  blur: number;
}) {
  return (
    <YStack
      position="absolute"
      top={top}
      left={left}
      right={right}
      bottom={bottom}
      width={size}
      height={size}
      borderRadius={size}
      style={{ backgroundColor: color, opacity, filter: `blur(${blur}px)` }}
    />
  );
}

function LogoLockup({ size = 56, textSize = '$8', light = false }: { size?: number; textSize?: '$8' | '$6'; light?: boolean }) {
  return (
    <XStack alignItems="center" gap="$2.5">
      <Image
        source={require('../../assets/images/icon.png')}
        style={{ width: size, height: size, borderRadius: size * 0.23 }}
        resizeMode="cover"
      />
      <Text fontSize={textSize} fontWeight="800" color={light ? 'white' : '$color12'}>
        Studiq
      </Text>
    </XStack>
  );
}

function ArtPanel({ accentColor }: { accentColor: AccentColor }) {
  const tint = ACCENT_TINT[accentColor];
  return (
    <YStack flex={1} overflow="hidden" position="relative" style={{ backgroundColor: '#141B3D' }}>
      <Blob size={520} top={-160} left={-120} color={tint} opacity={0.85} blur={70} />
      <Blob size={420} top={80} right={-140} color="#7D5BD9" opacity={0.55} blur={80} />
      <Blob size={380} bottom={-140} left={60} color="#2BA6A4" opacity={0.45} blur={90} />
      <Blob size={260} bottom={40} right={20} color="white" opacity={0.08} blur={50} />

      <YStack position="absolute" top="$6" left="$6" zIndex={1}>
        <LogoLockup size={40} textSize="$6" light />
      </YStack>

      <YStack position="absolute" bottom="$8" left="$6" right="$6" gap="$4" zIndex={1} maxWidth={520}>
        <Text fontSize={56} lineHeight={58} fontWeight="900" color="white">
          Your whole{'\n'}college life, in{'\n'}one place.
        </Text>
        <Text color="rgba(255,255,255,0.8)" fontSize="$5" maxWidth={420}>
          Classes, schedule, budgeting, and AI study tools that turn a recorded lecture into a
          study guide — sign in so it all follows your account.
        </Text>
        <XStack gap="$6" paddingTop="$2">
          {FEATURES.map((feature) => (
            <YStack key={feature.label} alignItems="center" gap="$1.5" width={84}>
              <Icon name={feature.icon} size={26} color="white" />
              <Text color="white" fontSize="$2" fontWeight="600" textAlign="center" opacity={0.9}>
                {feature.label}
              </Text>
            </YStack>
          ))}
        </XStack>
      </YStack>
    </YStack>
  );
}

/**
 * Full-screen sign-in/sign-up wall shown whenever cloud sync is configured (EXPO_PUBLIC_SUPABASE_URL
 * + EXPO_PUBLIC_SUPABASE_ANON_KEY) and no one is signed in yet. This is what keeps each account's
 * classes/schedule/finance/etc. separate — see startCloudSyncForUser in src/lib/cloudSync.ts.
 *
 * Two layouts sharing the same AuthForm: a wide split-screen (form panel + an abstract art panel
 * carrying the headline/motto/feature icons) above ~900px, and a compact colored-hero-over-a-
 * form-sheet layout below that — a side-by-side split has no room to breathe on a phone screen.
 */
export function AuthGateScreen() {
  const accentColor = useThemeStore((state) => state.accentColor);
  const { width } = useWindowDimensions();

  if (width >= 900) {
    return (
      <XStack flex={1} backgroundColor="$background">
        <ScrollView flex={1} maxWidth={460} backgroundColor="$background" contentContainerStyle={{ flexGrow: 1 }}>
          <YStack flex={1} justifyContent="center" paddingHorizontal="$7" paddingVertical="$8" gap="$6">
            <LogoLockup />
            <AuthForm />
          </YStack>
        </ScrollView>
        <ArtPanel accentColor={accentColor} />
      </XStack>
    );
  }

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
        <Blob size={220} top={-70} left={-60} color="white" opacity={0.12} blur={30} />
        <Blob size={200} bottom={-80} right={-50} color="#141B3D" opacity={0.14} blur={40} />

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
            Your whole college life, in one place — sign in so it follows your account, not just
            this device.
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
