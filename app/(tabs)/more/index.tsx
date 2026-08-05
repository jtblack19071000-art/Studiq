import { router } from 'expo-router';
import { H1, Text, XStack, YStack } from 'tamagui';

import { Card } from '@/src/components/Card';
import { Screen } from '@/src/components/Screen';

const MENU_ITEMS: { href: string; label: string; emoji: string; color: string }[] = [
  { href: '/more/profile', label: 'Profile', emoji: '🧑‍🎓', color: '#3B6FE0' },
  { href: '/more/gpa', label: 'GPA Tracker', emoji: '🎓', color: '#3B6FE0' },
  { href: '/more/finance', label: 'Finance', emoji: '💸', color: '#4C9F4C' },
  { href: '/more/goals', label: 'Goals', emoji: '🎯', color: '#D9862B' },
  { href: '/more/career', label: 'Career Hub', emoji: '💼', color: '#7D5BD9' },
  { href: '/more/college-match', label: 'College Match', emoji: '🏫', color: '#C4478C' },
  { href: '/more/campus-resources', label: 'Campus Resources', emoji: '🧭', color: '#2BA6A4' },
  { href: '/more/subscription', label: 'Subscription', emoji: '💎', color: '#E0B93B' },
  { href: '/more/settings', label: 'Settings', emoji: '⚙️', color: '#8A8F98' },
];

export default function MoreScreen() {
  return (
    <Screen>
      <YStack gap="$1" paddingTop="$2">
        <H1 fontSize="$9">⋯ More</H1>
      </YStack>

      <YStack gap="$3">
        {MENU_ITEMS.map((item) => (
          <Card
            key={item.href}
            onPress={() => router.push(item.href as never)}
            pressStyle={{ opacity: 0.7, scale: 0.99 }}
            accentColor={item.color}>
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" gap="$3">
                <Text fontSize="$7">{item.emoji}</Text>
                <Text fontWeight="700" fontSize="$5">
                  {item.label}
                </Text>
              </XStack>
              <Text color="$color8" fontSize="$6">
                ›
              </Text>
            </XStack>
          </Card>
        ))}
      </YStack>
    </Screen>
  );
}
