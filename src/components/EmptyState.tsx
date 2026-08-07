import { Paragraph, YStack } from 'tamagui';

import { Icon, type IconName } from '@/src/components/Icon';

export function EmptyState({ message, icon = 'sparkle' }: { message: string; icon?: IconName }) {
  return (
    <YStack paddingVertical="$5" alignItems="center" gap="$2">
      <Icon name={icon} size={32} color="#8A8F98" />
      <Paragraph color="$color10" textAlign="center" maxWidth={280}>
        {message}
      </Paragraph>
    </YStack>
  );
}
