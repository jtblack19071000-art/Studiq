import { Paragraph, Text, YStack } from 'tamagui';

export function EmptyState({ message, emoji = '✨' }: { message: string; emoji?: string }) {
  return (
    <YStack paddingVertical="$5" alignItems="center" gap="$2">
      <Text fontSize="$8">{emoji}</Text>
      <Paragraph color="$color10" textAlign="center" maxWidth={280}>
        {message}
      </Paragraph>
    </YStack>
  );
}
