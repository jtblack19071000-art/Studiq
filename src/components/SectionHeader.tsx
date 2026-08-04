import type { ReactNode } from 'react';
import { H4, Text, XStack } from 'tamagui';

export function SectionHeader({
  title,
  emoji,
  action,
}: {
  title: string;
  emoji?: string;
  action?: ReactNode;
}) {
  return (
    <XStack justifyContent="space-between" alignItems="center">
      <XStack alignItems="center" gap="$2">
        {emoji ? <Text fontSize="$6">{emoji}</Text> : null}
        <H4>{title}</H4>
      </XStack>
      {action}
    </XStack>
  );
}
