import { addDays, eachDayOfInterval, format, isSameDay, startOfDay } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { Text, YStack } from 'tamagui';

import { displayEventTitle, resolveEventColor } from '@/src/lib/eventColor';
import type { EventOccurrence } from '@/src/lib/occurrences';
import { getOccurrencesInRange } from '@/src/lib/occurrences';
import { layoutDayOccurrences } from '@/src/lib/weekGridLayout';
import { buildTimeRows, clampHourHeight, DEFAULT_HOUR_HEIGHT, minutesToOffset, type TimeRow } from '@/src/lib/weekGridZoom';
import type { ScheduleEvent, StudiqClass } from '@/src/types';

const TIME_COL_WIDTH = 50;
const MIN_BLOCK_HEIGHT = 22;
const DEFAULT_SCROLL_HOUR = 7;

function minutesFromMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
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

  // Pinch-to-zoom: the gesture runs entirely on the UI thread via reanimated shared values (not
  // React refs/state, which the gesture callbacks can't safely read mid-render), and only hops
  // back to JS — via runOnJS — to commit the final clamped height for this render. The farther
  // zoomed in (the taller an hour renders), the finer the left-hand time labels get; see
  // minuteIntervalForHourHeight in weekGridZoom.ts.
  const [hourHeight, setHourHeight] = useState(DEFAULT_HOUR_HEIGHT);
  const hourHeightShared = useSharedValue(DEFAULT_HOUR_HEIGHT);
  const gestureStartShared = useSharedValue(DEFAULT_HOUR_HEIGHT);

  const commitHourHeight = useCallback((next: number) => {
    setHourHeight(next);
  }, []);

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .onStart(() => {
          // Assigning `.value` is reanimated's documented API for a shared value, not a React
          // state mutation — the lint rule doesn't know the difference between the two.
          // eslint-disable-next-line react-hooks/immutability
          gestureStartShared.value = hourHeightShared.value;
        })
        .onUpdate((event) => {
          const next = clampHourHeight(gestureStartShared.value * event.scale);
          // eslint-disable-next-line react-hooks/immutability
          hourHeightShared.value = next;
          runOnJS(commitHourHeight)(next);
        }),
    [gestureStartShared, hourHeightShared, commitHourHeight],
  );

  // weekStart is always a Monday (see startOfWeek(selectedDate, {weekStartsOn:1}) in the caller),
  // so +4 days is Friday — a Mon–Fri work week, not the full 7 days. Weekend events (work,
  // research, ...) still exist and still fire reminders; they just show on Day view and the
  // Home tab's "This weekend" section instead of cluttering this grid every single week.
  const days = useMemo(
    () => eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 4) }),
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

  const rows = useMemo(() => buildTimeRows(hourHeight), [hourHeight]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: DEFAULT_SCROLL_HOUR * DEFAULT_HOUR_HEIGHT, animated: false });
    // Only on mount — re-scrolling to a fixed hour every time the user zooms would fight their
    // pinch gesture, which is naturally centered on whatever they're already looking at.
     
  }, []);

  return (
    <YStack flex={1}>
      <DayHeaderRow days={days} today={today} />
      <GestureDetector gesture={pinchGesture}>
        <ScrollView ref={scrollRef} style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <YStack flexDirection="row">
            <HourLabelColumn rows={rows} />
            <YStack flex={1} flexDirection="row">
              {days.map((day, index) => (
                <DayColumn
                  key={day.toISOString()}
                  isToday={isSameDay(day, today)}
                  positioned={occurrencesByDay[index]}
                  classesById={classesById}
                  onSelectOccurrence={onSelectOccurrence}
                  rows={rows}
                  hourHeight={hourHeight}
                />
              ))}
            </YStack>
          </YStack>
        </ScrollView>
      </GestureDetector>
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

function HourLabelColumn({ rows }: { rows: TimeRow[] }) {
  return (
    <YStack width={TIME_COL_WIDTH}>
      {rows.map((row) => (
        <YStack key={row.minutes} height={row.height} alignItems="flex-end" paddingRight="$1.5">
          <Text fontSize="$1" color="$color9" style={{ transform: [{ translateY: -6 }] }}>
            {row.label}
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
  rows,
  hourHeight,
}: {
  isToday: boolean;
  positioned: ReturnType<typeof layoutDayOccurrences>;
  classesById: Map<string, StudiqClass>;
  onSelectOccurrence: (occurrence: EventOccurrence) => void;
  rows: TimeRow[];
  hourHeight: number;
}) {
  const now = new Date();

  return (
    <YStack
      flex={1}
      height={24 * hourHeight}
      position="relative"
      borderLeftWidth={1}
      borderColor="$borderColor"
      backgroundColor={isToday ? '$blue2' : 'transparent'}>
      {rows.map((row) => (
        <YStack key={row.minutes} height={row.height} borderTopWidth={1} borderColor="$borderColor" opacity={0.5} />
      ))}

      {isToday ? (
        <YStack
          position="absolute"
          left={0}
          right={0}
          top={minutesToOffset(minutesFromMidnight(now), hourHeight)}
          height={2}
          backgroundColor="$red9"
        />
      ) : null}

      {positioned.map(({ occurrence, column, columnCount }) => {
        const top = minutesToOffset(minutesFromMidnight(occurrence.startsAt), hourHeight);
        const durationHours = (occurrence.endsAt.getTime() - occurrence.startsAt.getTime()) / (1000 * 60 * 60);
        const height = Math.max(MIN_BLOCK_HEIGHT, durationHours * hourHeight);
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
