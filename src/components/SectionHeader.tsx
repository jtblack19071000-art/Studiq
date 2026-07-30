import type { ReactNode } from 'react';
import { H4, XStack } from 'tamagui';

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <XStack justifyContent="space-between" alignItems="center">
      <H4>{title}</H4>
      {action}
    </XStack>
  );
}
