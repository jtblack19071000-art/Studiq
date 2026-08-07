import { router } from 'expo-router';
import { H1, Paragraph, Text, XStack, YStack } from 'tamagui';

import { Card } from '@/src/components/Card';
import { Hero } from '@/src/components/Hero';
import { Icon, type IconName } from '@/src/components/Icon';
import { Screen } from '@/src/components/Screen';

const MENU_ITEMS: { href: string; label: string; icon: IconName; color: string }[] = [
  { href: '/more/profile', label: 'Profile', icon: 'graduation-cap', color: '#3B6FE0' },
  { href: '/more/gpa', label: 'GPA Tracker', icon: 'graduation-cap', color: '#3B6FE0' },
  { href: '/more/finance', label: 'Finance', icon: 'dollar', color: '#4C9F4C' },
  { href: '/more/goals', label: 'Goals', icon: 'target', color: '#D9862B' },
  { href: '/more/career', label: 'Career Hub', icon: 'briefcase', color: '#7D5BD9' },
  { href: '/more/college-match', label: 'College Match', icon: 'building', color: '#C4478C' },
  { href: '/more/campus-resources', label: 'Campus Resources', icon: 'compass', color: '#2BA6A4' },
  { href: '/more/subscription', label: 'Subscription', icon: 'diamond', color: '#E0B93B' },
  { href: '/more/settings', label: 'Settings', icon: 'settings', color: '#8A8F98' },
];

export default function MoreScreen() {
  return (
    <Screen>
      <Hero logo gap="$1">
        <XStack alignItems="center" gap="$2">
          <Icon name="more" size={20} color="white" />
          <H1 fontSize="$9">More</H1>
        </XStack>
        <Paragraph color="$color11" fontSize="$4">
          Your profile, plan, and everything outside the daily grind.
        </Paragraph>
      </Hero>

      <YStack gap="$3">
        {MENU_ITEMS.map((item) => (
          <Card
            key={item.href}
            onPress={() => router.push(item.href as never)}
            pressStyle={{ opacity: 0.7, scale: 0.99 }}
            accentColor={item.color}>
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" gap="$3">
                <Icon name={item.icon} size={22} color={item.color} />
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
