import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, H3, Paragraph, Text, XStack, YStack } from 'tamagui';

import { resolveEventColor, withAlpha } from '@/src/lib/eventColor';
import { useClassesStore } from '@/src/state/classesStore';
import { useScheduleStore } from '@/src/state/scheduleStore';
import { EVENT_COLOR_SWATCHES, eventCategoryLabels } from '@/src/types';

export default function EventDetailModal() {
  const { eventId, startsAt, endsAt } = useLocalSearchParams<{
    eventId: string;
    startsAt: string;
    endsAt: string;
  }>();
  const event = useScheduleStore((state) => state.events.find((e) => e.id === eventId));
  const updateEvent = useScheduleStore((state) => state.updateEvent);
  const classes = useClassesStore((state) => state.classes);
  const studiqClass = event?.classId ? classes.find((c) => c.id === event.classId) : undefined;

  if (!event) {
    return (
      <YStack flex={1} backgroundColor="$background" padding="$4" gap="$4">
        <Paragraph color="$color10">This event could not be found.</Paragraph>
        <Button size="$4" onPress={() => router.back()}>
          Close
        </Button>
      </YStack>
    );
  }

  const classesById = new Map(studiqClass ? [[studiqClass.id, studiqClass]] : []);
  const currentColor = resolveEventColor(event, classesById);

  function setColor(swatch: string) {
    updateEvent(event!.id, { color: event!.color === swatch ? undefined : swatch });
  }

  return (
    <YStack flex={1} backgroundColor="$background" padding="$4" gap="$4">
      <XStack
        gap="$3"
        alignItems="flex-start"
        borderRadius="$8"
        padding="$4"
        style={{ backgroundColor: withAlpha(currentColor, 0.14) }}>
        <YStack width={6} borderRadius="$10" alignSelf="stretch" style={{ backgroundColor: currentColor }} />
        <YStack flex={1} gap="$1">
          <H3 style={{ color: currentColor }}>{event.title}</H3>
          <Paragraph color="$color10">
            {format(new Date(startsAt), 'EEEE, MMM d · h:mm a')} – {format(new Date(endsAt), 'h:mm a')}
          </Paragraph>
          <Paragraph color="$color10" fontSize="$3">
            {eventCategoryLabels[event.category]}
            {event.location ? ` · ${event.location}` : ''}
          </Paragraph>
        </YStack>
      </XStack>

      {studiqClass ? (
        <YStack gap="$2" backgroundColor="$color2" borderRadius="$6" padding="$3.5" borderWidth={1} borderColor="$borderColor">
          <Text fontWeight="700" fontSize="$5">
            {studiqClass.name}
          </Text>
          <Text fontWeight="600">{studiqClass.professor.name}</Text>
          {studiqClass.professor.email ? (
            <Paragraph color="$color10" fontSize="$3">
              {studiqClass.professor.email}
            </Paragraph>
          ) : null}
          {studiqClass.classroom ? (
            <Paragraph color="$color10" fontSize="$3">
              Room: {studiqClass.classroom}
            </Paragraph>
          ) : null}
          {studiqClass.professor.officeLocation ? (
            <Paragraph color="$color10" fontSize="$3">
              Office: {studiqClass.professor.officeLocation}
            </Paragraph>
          ) : null}
          {studiqClass.professor.officeHours ? (
            <Paragraph color="$color10" fontSize="$3">
              Office hours: {studiqClass.professor.officeHours}
            </Paragraph>
          ) : null}
          <Button
            size="$3"
            theme="active"
            onPress={() => router.push(`/schedule/classes/${studiqClass.id}`)}>
            View class
          </Button>
        </YStack>
      ) : null}

      {event.notes ? (
        <YStack gap="$1">
          <Text fontWeight="600" fontSize="$3">
            Notes
          </Text>
          <Paragraph color="$color10">{event.notes}</Paragraph>
        </YStack>
      ) : null}

      <YStack gap="$2">
        <Text fontWeight="600" fontSize="$3">
          Color
        </Text>
        <XStack flexWrap="wrap" gap="$2">
          {EVENT_COLOR_SWATCHES.map((swatch) => (
            <YStack
              key={swatch}
              width={36}
              height={36}
              borderRadius={18}
              alignItems="center"
              justifyContent="center"
              borderWidth={event.color === swatch ? 3 : 0}
              borderColor="$color12"
              onPress={() => setColor(swatch)}
              pressStyle={{ opacity: 0.7 }}
              style={{ backgroundColor: swatch }}
            />
          ))}
        </XStack>
      </YStack>

      <Button size="$4" theme="active" onPress={() => router.back()}>
        Done
      </Button>
    </YStack>
  );
}
