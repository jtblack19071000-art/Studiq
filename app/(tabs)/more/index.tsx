import { router } from 'expo-router';
import { H2, Text, XStack, YStack } from 'tamagui';

import { Card } from '@/src/components/Card';
import { Screen } from '@/src/components/Screen';

const MENU_ITEMS: { href: string; label: string }[] = [
  { href: '/more/gpa', label: 'GPA Tracker' },
  { href: '/more/finance', label: 'Finance' },
  { href: '/more/goals', label: 'Goals' },
  { href: '/more/career', label: 'Career Hub' },
  { href: '/more/college-match', label: 'College Match' },
  { href: '/more/campus-resources', label: 'Campus Resources' },
  { href: '/more/settings', label: 'Settings' },
];

export default function MoreScreen() {
  return (
    <Screen>
      <YStack gap="$1" paddingTop="$2">
        <H2>More</H2>
      </YStack>

      <YStack gap="$2">
        {MENU_ITEMS.map((item) => (
          <Card
            key={item.href}
            onPress={() => router.push(item.href as never)}
            pressStyle={{ opacity: 0.7 }}>
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontWeight="600" fontSize="$5">
                {item.label}
              </Text>
              <Text color="$color8">›</Text>
            </XStack>
          </Card>
        ))}
      </YStack>
    </Screen>
  );
}
