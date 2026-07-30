import { format } from 'date-fns';
import { Paragraph, Text, XStack, YStack } from 'tamagui';

import type { EventOccurrence } from '@/src/lib/occurrences';
import { eventCategoryColors } from '@/src/types';

export function AgendaItem({ occurrence, onPress }: { occurrence: EventOccurrence; onPress?: () => void }) {
  const { event, startsAt, endsAt } = occurrence;

  return (
    <XStack
      gap="$3"
      alignItems="flex-start"
      paddingVertical="$2.5"
      onPress={onPress}
      pressStyle={onPress ? { opacity: 0.6 } : undefined}>
      <YStack
        width={4}
        borderRadius="$10"
        alignSelf="stretch"
        style={{ backgroundColor: eventCategoryColors[event.category] }}
      />
      <YStack flex={1} gap="$1">
        <Text fontWeight="600" fontSize="$5">
          {event.title}
        </Text>
        <Paragraph color="$color10" fontSize="$3">
          {format(startsAt, 'h:mm a')} – {format(endsAt, 'h:mm a')}
          {event.location ? ` · ${event.location}` : ''}
        </Paragraph>
      </YStack>
    </XStack>
  );
}
