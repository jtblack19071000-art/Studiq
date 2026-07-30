import type { ReactNode } from 'react';
import { ScrollView, YStack } from 'tamagui';

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const content = (
    <YStack flex={1} backgroundColor="$background" paddingHorizontal="$4" paddingTop="$3" gap="$4">
      {children}
    </YStack>
  );

  if (!scroll) {
    return content;
  }

  return (
    <ScrollView flex={1} backgroundColor="$background" contentContainerStyle={{ paddingBottom: 40 }}>
      {content}
    </ScrollView>
  );
}
