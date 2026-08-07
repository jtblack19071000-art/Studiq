import { addDays, eachDayOfInterval, format, isSameDay, startOfDay } from 'date-fns';
import { useEffect, useMemo, useRef } from 'react';
import { ScrollView } from 'react-native';
import { Text, YStack } from 'tamagui';

import type { EventOccurrence } from '@/src/lib/occurrences';
import { getOccurrencesInRange } from '@/src/lib/occurrences';
import { displayEventTitle, resolveEventColor } from '@/src/lib/eventColor';
import { layoutDayOccurrences } from '@/src/lib/weekGridLayout';
import type { ScheduleEvent, StudiqClass } from '@/src/types';

const HOUR_HEIGHT = 56;
const TIME_COL_WIDTH = 44;
const MIN_BLOCK_HEIGHT = 22;
const DEFAULT_SCROLL_HOUR = 7;

function formatHourLabel(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

function hourFloat(date: Date): number {
  return date.getHours() + date.getMinutes() / 60;
}

export function WeekGridCalendar({
  weekStart,
  events,
  classesById,
  onSelectOccurrence,
}: {
  weekStart: Date;
  events: ScheduleEvent[];
  classesById: Map<string, StudiqClass>;
  onSelectOccurrence: (occurrence: EventOccurrence) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const today = useMemo(() => startOfDay(new Date()), []);

  const days = useMemo(
    () => eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) }),
    [weekStart],
  );

  const occurrencesByDay = useMemo(() => {
    return days.map((day) => {
      const dayEnd = addDays(day, 1);
      const dayOccurrences = events
        .flatMap((event) => getOccurrencesInRange(event, day, dayEnd))
        .filter((occurrence) => isSameDay(occurrence.startsAt, day));
      return layoutDayOccurrences(dayOccurrences);
    });
  }, [days, events]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: DEFAULT_SCROLL_HOUR * HOUR_HEIGHT, animated: false });
  }, []);

  return (
    <YStack flex={1}>
      <DayHeaderRow days={days} today={today} />
      <ScrollView ref={scrollRef} style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <YStack flexDirection="row">
          <HourLabelColumn />
          <YStack flex={1} flexDirection="row">
            {days.map((day, index) => (
              <DayColumn
                key={day.toISOString()}
                isToday={isSameDay(day, today)}
                positioned={occurrencesByDay[index]}
                classesById={classesById}
                onSelectOccurrence={onSelectOccurrence}
              />
            ))}
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}

function DayHeaderRow({ days, today }: { days: Date[]; today: Date }) {
  return (
    <YStack flexDirection="row" borderBottomWidth={1} borderColor="$borderColor" paddingBottom="$2">
      <YStack width={TIME_COL_WIDTH} />
      {days.map((day) => {
        const isToday = isSameDay(day, today);
        return (
          <YStack key={day.toISOString()} flex={1} alignItems="center" gap="$1">
            <Text fontSize="$1" color="$color10">
              {format(day, 'EEE')}
            </Text>
            <YStack
              width={26}
              height={26}
              borderRadius={13}
              alignItems="center"
              justifyContent="center"
              backgroundColor={isToday ? '$blue9' : 'transparent'}>
              <Text fontSize="$3" fontWeight={isToday ? '700' : '400'} color={isToday ? 'white' : '$color12'}>
                {format(day, 'd')}
              </Text>
            </YStack>
          </YStack>
        );
      })}
    </YStack>
  );
}

function HourLabelColumn() {
  return (
    <YStack width={TIME_COL_WIDTH}>
      {Array.from({ length: 24 }, (_, hour) => (
        <YStack key={hour} height={HOUR_HEIGHT} alignItems="flex-end" paddingRight="$1.5">
          <Text fontSize="$1" color="$color9" style={{ transform: [{ translateY: -6 }] }}>
            {formatHourLabel(hour)}
          </Text>
        </YStack>
      ))}
    </YStack>
  );
}

function DayColumn({
  isToday,
  positioned,
  classesById,
  onSelectOccurrence,
}: {
  isToday: boolean;
  positioned: ReturnType<typeof layoutDayOccurrences>;
  classesById: Map<string, StudiqClass>;
  onSelectOccurrence: (occurrence: EventOccurrence) => void;
}) {
  const now = new Date();

  return (
    <YStack
      flex={1}
      height={24 * HOUR_HEIGHT}
      position="relative"
      borderLeftWidth={1}
      borderColor="$borderColor"
      backgroundColor={isToday ? '$blue2' : 'transparent'}>
      {Array.from({ length: 24 }, (_, hour) => (
        <YStack key={hour} height={HOUR_HEIGHT} borderTopWidth={1} borderColor="$borderColor" opacity={0.5} />
      ))}

      {isToday ? (
        <YStack
          position="absolute"
          left={0}
          right={0}
          top={hourFloat(now) * HOUR_HEIGHT}
          height={2}
          backgroundColor="$red9"
        />
      ) : null}

      {positioned.map(({ occurrence, column, columnCount }) => {
        const top = hourFloat(occurrence.startsAt) * HOUR_HEIGHT;
        const durationHours = (occurrence.endsAt.getTime() - occurrence.startsAt.getTime()) / (1000 * 60 * 60);
        const height = Math.max(MIN_BLOCK_HEIGHT, durationHours * HOUR_HEIGHT);
        const widthPercent = 100 / columnCount;
        const color = resolveEventColor(occurrence.event, classesById);

        return (
          <YStack
            key={`${occurrence.event.id}-${occurrence.startsAt.toISOString()}`}
            position="absolute"
            top={top}
            height={height - 2}
            left={`${column * widthPercent}%`}
            width={`${widthPercent}%`}
            paddingHorizontal={1}
            onPress={() => onSelectOccurrence(occurrence)}
            pressStyle={{ opacity: 0.7 }}>
            <YStack
              flex={1}
              borderRadius="$2"
              paddingHorizontal="$1.5"
              paddingVertical={2}
              overflow="hidden"
              style={{ backgroundColor: color }}>
              <Text
                color="white"
                fontSize={9}
                fontWeight="600"
                numberOfLines={height > 58 ? 3 : height > 32 ? 2 : 1}>
                {displayEventTitle(occurrence.event.title)}
              </Text>
              {height > 34 ? (
                <Text color="white" fontSize={9} opacity={0.9} numberOfLines={1}>
                  {format(occurrence.startsAt, 'h:mm a')}–{format(occurrence.endsAt, 'h:mm a')}
                </Text>
              ) : null}
              {height > 58 && occurrence.event.location ? (
                <Text color="white" fontSize={9} opacity={0.85} numberOfLines={1}>
                  {occurrence.event.location}
                </Text>
              ) : null}
            </YStack>
          </YStack>
        );
      })}
    </YStack>
  );
}
