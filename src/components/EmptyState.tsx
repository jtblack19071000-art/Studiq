import { Paragraph, YStack } from 'tamagui';

export function EmptyState({ message }: { message: string }) {
  return (
    <YStack paddingVertical="$4" alignItems="center">
      <Paragraph color="$color10">{message}</Paragraph>
    </YStack>
  );
}
