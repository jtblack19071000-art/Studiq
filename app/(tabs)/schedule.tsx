import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { useMemo, useState } from 'react';
import { Button, H2, Text, XStack, YStack } from 'tamagui';

import { AgendaItem } from '@/src/components/AgendaItem';
import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { Screen } from '@/src/components/Screen';
import { getOccurrencesInRange } from '@/src/lib/occurrences';
import { useScheduleStore } from '@/src/state/scheduleStore';
import { eventCategoryColors } from '@/src/types';

type ViewMode = 'day' | 'week' | 'month';

export default function ScheduleScreen() {
  const events = useScheduleStore((state) => state.events);
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));

  function goToDay(direction: 1 | -1) {
    setSelectedDate((current) =>
      viewMode === 'day'
        ? addDays(current, direction)
        : viewMode === 'week'
          ? addWeeks(current, direction)
          : addMonths(current, direction),
    );
  }

  return (
    <Screen scroll={viewMode !== 'month'}>
      <YStack gap="$1" paddingTop="$2">
        <H2>Schedule</H2>
      </YStack>

      <XStack gap="$2">
        {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
          <Button
            key={mode}
            flex={1}
            size="$3"
            theme={viewMode === mode ? 'active' : undefined}
            onPress={() => setViewMode(mode)}>
            {mode[0].toUpperCase() + mode.slice(1)}
          </Button>
        ))}
      </XStack>

      <XStack alignItems="center" justifyContent="space-between">
        <Button size="$3" chromeless onPress={() => goToDay(-1)}>
          ‹
        </Button>
        <Text fontWeight="600" fontSize="$5">
          {formatHeader(selectedDate, viewMode)}
        </Text>
        <Button size="$3" chromeless onPress={() => goToDay(1)}>
          ›
        </Button>
      </XStack>

      {viewMode === 'day' && <DayView date={selectedDate} events={events} />}
      {viewMode === 'week' && <WeekView date={selectedDate} events={events} />}
      {viewMode === 'month' && (
        <MonthView
          date={selectedDate}
          events={events}
          onSelectDay={(day) => {
            setSelectedDate(day);
            setViewMode('day');
          }}
        />
      )}
    </Screen>
  );
}

function formatHeader(date: Date, viewMode: ViewMode) {
  if (viewMode === 'day') return format(date, 'EEEE, MMM d');
  if (viewMode === 'week') {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`;
  }
  return format(date, 'MMMM yyyy');
}

function DayView({ date, events }: { date: Date; events: ReturnType<typeof useScheduleStore.getState>['events'] }) {
  const occurrences = useMemo(() => {
    const rangeStart = startOfDay(date);
    const rangeEnd = addDays(rangeStart, 1);
    return events
      .flatMap((event) => getOccurrencesInRange(event, rangeStart, rangeEnd))
      .filter((occurrence) => isSameDay(occurrence.startsAt, date))
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  }, [date, events]);

  return (
    <Card>
      {occurrences.length === 0 ? (
        <EmptyState message="Nothing scheduled." />
      ) : (
        occurrences.map((occurrence, index) => (
          <AgendaItem key={`${occurrence.event.id}-${index}`} occurrence={occurrence} />
        ))
      )}
    </Card>
  );
}

function WeekView({ date, events }: { date: Date; events: ReturnType<typeof useScheduleStore.getState>['events'] }) {
  const days = useMemo(() => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [date]);

  return (
    <YStack gap="$3">
      {days.map((day) => {
        const rangeEnd = addDays(day, 1);
        const occurrences = events
          .flatMap((event) => getOccurrencesInRange(event, day, rangeEnd))
          .filter((occurrence) => isSameDay(occurrence.startsAt, day))
          .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

        return (
          <YStack key={day.toISOString()} gap="$1.5">
            <Text fontWeight="600" color="$color10" fontSize="$3">
              {format(day, 'EEE, MMM d')}
            </Text>
            <Card>
              {occurrences.length === 0 ? (
                <EmptyState message="Nothing scheduled." />
              ) : (
                occurrences.map((occurrence, index) => (
                  <AgendaItem key={`${occurrence.event.id}-${index}`} occurrence={occurrence} />
                ))
              )}
            </Card>
          </YStack>
        );
      })}
    </YStack>
  );
}

function MonthView({
  date,
  events,
  onSelectDay,
}: {
  date: Date;
  events: ReturnType<typeof useScheduleStore.getState>['events'];
  onSelectDay: (day: Date) => void;
}) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [date]);

  const dayHasEvents = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const day of days) {
      const rangeEnd = addDays(day, 1);
      const has = events.some(
        (event) => getOccurrencesInRange(event, day, rangeEnd).filter((o) => isSameDay(o.startsAt, day)).length > 0,
      );
      map.set(day.toDateString(), has);
    }
    return map;
  }, [days, events]);

  return (
    <YStack gap="$2">
      <XStack>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, index) => (
          <YStack key={`${label}-${index}`} flex={1} alignItems="center">
            <Text color="$color10" fontSize="$2">
              {label}
            </Text>
          </YStack>
        ))}
      </XStack>
      <XStack flexWrap="wrap">
        {days.map((day) => {
          const inMonth = isSameMonth(day, date);
          const isToday = isSameDay(day, new Date());
          const hasEvents = dayHasEvents.get(day.toDateString());
          return (
            <YStack
              key={day.toISOString()}
              width={`${100 / 7}%`}
              aspectRatio={1}
              alignItems="center"
              justifyContent="center"
              onPress={() => onSelectDay(day)}
              pressStyle={{ opacity: 0.6 }}>
              <YStack
                width={34}
                height={34}
                borderRadius={17}
                alignItems="center"
                justifyContent="center"
                backgroundColor={isToday ? '$blue9' : 'transparent'}>
                <Text color={inMonth ? (isToday ? 'white' : '$color12') : '$color8'} fontSize="$3">
                  {format(day, 'd')}
                </Text>
              </YStack>
              <YStack
                width={4}
                height={4}
                borderRadius={2}
                marginTop={2}
                style={{ backgroundColor: hasEvents ? eventCategoryColors.class : 'transparent' }}
              />
            </YStack>
          );
        })}
      </XStack>
    </YStack>
  );
}
