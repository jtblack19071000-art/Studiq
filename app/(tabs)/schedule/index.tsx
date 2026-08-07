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
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { Button, H2, Input, Paragraph, Text, XStack, YStack } from 'tamagui';

import { AgendaItem } from '@/src/components/AgendaItem';
import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { Icon } from '@/src/components/Icon';
import { Screen } from '@/src/components/Screen';
import { WeekGridCalendar } from '@/src/components/WeekGridCalendar';
import { groupClassesByTerm } from '@/src/lib/gpa';
import type { EventOccurrence } from '@/src/lib/occurrences';
import { getOccurrencesInRange } from '@/src/lib/occurrences';
import { useClassesStore } from '@/src/state/classesStore';
import { useScheduleStore } from '@/src/state/scheduleStore';
import { eventCategoryColors, type ScheduleEvent, type StudiqClass } from '@/src/types';

type TabMode = 'calendar' | 'classes';
type ViewMode = 'day' | 'week' | 'month';

function openEventDetail(occurrence: EventOccurrence) {
  router.push({
    pathname: '/event-detail',
    params: {
      eventId: occurrence.event.id,
      startsAt: occurrence.startsAt.toISOString(),
      endsAt: occurrence.endsAt.toISOString(),
    },
  });
}

export default function ScheduleScreen() {
  const events = useScheduleStore((state) => state.events);
  const classes = useClassesStore((state) => state.classes);
  const activeTerm = useClassesStore((state) => state.activeTerm);
  const startNewSemester = useClassesStore((state) => state.startNewSemester);
  const classesById = useMemo(() => new Map(classes.map((studiqClass) => [studiqClass.id, studiqClass])), [classes]);

  // A class-linked event only shows on the live calendar while its class belongs to the active
  // semester — see startNewSemester. Non-class events (personal, work, …) are never archived.
  // activeTerm === null means no semester has been started yet, so nothing is filtered.
  const visibleEvents = useMemo(() => {
    if (activeTerm === null) return events;
    return events.filter((event) => {
      if (!event.classId) return true;
      return classesById.get(event.classId)?.term === activeTerm;
    });
  }, [events, activeTerm, classesById]);

  const [tabMode, setTabMode] = useState<TabMode>('calendar');
  const [viewMode, setViewMode] = useState<ViewMode>('week');
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

  const scroll = tabMode === 'classes' || (tabMode === 'calendar' && viewMode !== 'week' && viewMode !== 'month');

  return (
    <Screen scroll={scroll}>
      <YStack gap="$1" paddingTop="$2">
        <XStack alignItems="center" gap="$2">
          <Icon name="calendar" size={22} color="#3B6FE0" />
          <H2>Schedule</H2>
        </XStack>
      </YStack>

      <XStack gap="$2">
        {(['calendar', 'classes'] as TabMode[]).map((mode) => (
          <Button
            key={mode}
            flex={1}
            size="$3"
            theme={tabMode === mode ? 'active' : undefined}
            onPress={() => setTabMode(mode)}>
            {mode === 'calendar' ? 'Calendar' : 'Classes'}
          </Button>
        ))}
      </XStack>

      {tabMode === 'calendar' ? (
        <>
          <XStack gap="$2">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <Button
                key={mode}
                flex={1}
                size="$2"
                chromeless={viewMode !== mode}
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

          {viewMode === 'day' && (
            <DayView
              date={selectedDate}
              events={visibleEvents}
              classesById={classesById}
              onSelectOccurrence={openEventDetail}
            />
          )}
          {viewMode === 'week' && (
            <WeekGridCalendar
              weekStart={startOfWeek(selectedDate, { weekStartsOn: 1 })}
              events={visibleEvents}
              classesById={classesById}
              onSelectOccurrence={openEventDetail}
            />
          )}
          {viewMode === 'month' && (
            <MonthView
              date={selectedDate}
              events={visibleEvents}
              onSelectDay={(day) => {
                setSelectedDate(day);
                setViewMode('day');
              }}
            />
          )}
        </>
      ) : (
        <ClassesList classes={classes} activeTerm={activeTerm} onStartNewSemester={startNewSemester} />
      )}
    </Screen>
  );
}

function formatHeader(date: Date, viewMode: ViewMode) {
  if (viewMode === 'day') return format(date, 'EEEE, MMM d');
  if (viewMode === 'week') {
    // Week view itself only renders Mon–Fri now (see WeekGridCalendar) — match the header to it.
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = addDays(start, 4);
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`;
  }
  return format(date, 'MMMM yyyy');
}

function DayView({
  date,
  events,
  classesById,
  onSelectOccurrence,
}: {
  date: Date;
  events: ScheduleEvent[];
  classesById: Map<string, StudiqClass>;
  onSelectOccurrence: (occurrence: EventOccurrence) => void;
}) {
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
          <AgendaItem
            key={`${occurrence.event.id}-${index}`}
            occurrence={occurrence}
            classesById={classesById}
            onPress={() => onSelectOccurrence(occurrence)}
          />
        ))
      )}
    </Card>
  );
}

function MonthView({
  date,
  events,
  onSelectDay,
}: {
  date: Date;
  events: ScheduleEvent[];
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

function ClassesList({
  classes,
  activeTerm,
  onStartNewSemester,
}: {
  classes: ReturnType<typeof useClassesStore.getState>['classes'];
  activeTerm: string | null;
  onStartNewSemester: (term: string) => void;
}) {
  const [startingSemester, setStartingSemester] = useState(false);
  const [semesterName, setSemesterName] = useState('');

  const termGroups = useMemo(() => groupClassesByTerm(classes), [classes]);
  // Until "New semester" has been pressed at least once, activeTerm is null and every class is
  // current — there's nothing to archive yet. Without this guard, `term !== null` is true for
  // every term string, so every class would list under both "current" and "archived" at once.
  const otherTerms = useMemo(() => {
    if (activeTerm === null) return [];
    return Array.from(termGroups.keys()).filter((term) => term !== activeTerm);
  }, [termGroups, activeTerm]);
  const currentClasses = activeTerm === null ? classes : (termGroups.get(activeTerm) ?? []);

  function confirmNewSemester() {
    const trimmed = semesterName.trim();
    if (!trimmed) return;
    onStartNewSemester(trimmed);
    setSemesterName('');
    setStartingSemester(false);
  }

  return (
    <YStack gap="$3">
      <XStack gap="$2">
        <Button
          flex={1}
          size="$4"
          theme="active"
          borderRadius="$10"
          onPress={() => router.push('/schedule/classes/new')}
          icon={<Icon name="plus" size={16} color="white" />}>
          Add class
        </Button>
        <Button
          flex={1}
          size="$4"
          borderRadius="$10"
          onPress={() => router.push('/schedule/classes/import')}
          icon={<Icon name="upload" size={16} color="#8A8F98" />}>
          Import syllabus
        </Button>
      </XStack>

      <Card gap="$2">
        <XStack justifyContent="space-between" alignItems="center">
          <YStack flex={1}>
            <Text fontWeight="700" fontSize="$3" color="$color10">
              CURRENT SEMESTER
            </Text>
            <Text fontWeight="700" fontSize="$5">
              {activeTerm ?? 'All classes (no semester started)'}
            </Text>
          </YStack>
          {!startingSemester ? (
            <Button size="$3" borderRadius="$10" onPress={() => setStartingSemester(true)}>
              New semester
            </Button>
          ) : null}
        </XStack>
        {startingSemester ? (
          <YStack gap="$2" paddingTop="$1">
            <Paragraph color="$color10" fontSize="$3">
              Starting a new semester moves every current class off the calendar — they stay fully
              available here under Classes, grouped by term.
            </Paragraph>
            <Input
              placeholder="e.g. Spring 2027"
              value={semesterName}
              onChangeText={setSemesterName}
              autoFocus={Platform.OS === 'web'}
            />
            <XStack gap="$2">
              <Button flex={1} theme="active" disabled={!semesterName.trim()} onPress={confirmNewSemester}>
                Start semester
              </Button>
              <Button
                flex={1}
                chromeless
                onPress={() => {
                  setStartingSemester(false);
                  setSemesterName('');
                }}>
                Cancel
              </Button>
            </XStack>
          </YStack>
        ) : null}
      </Card>

      {classes.length === 0 ? (
        <EmptyState message="No classes yet. Add your first one above — it'll show up on your Schedule too if you set a meeting time." />
      ) : (
        <>
          {currentClasses.length === 0 ? (
            <EmptyState message="No classes in the current semester yet. Add one above." />
          ) : (
            <YStack gap="$3">
              {currentClasses.map((studiqClass) => (
                <ClassCard key={studiqClass.id} studiqClass={studiqClass} />
              ))}
            </YStack>
          )}

          {otherTerms.map((term) => (
            <YStack key={term} gap="$2" paddingTop="$2">
              <Text fontWeight="700" fontSize="$3" color="$color10">
                ARCHIVED · {term.toUpperCase()}
              </Text>
              <YStack gap="$3">
                {termGroups.get(term)!.map((studiqClass) => (
                  <ClassCard key={studiqClass.id} studiqClass={studiqClass} />
                ))}
              </YStack>
            </YStack>
          ))}
        </>
      )}
    </YStack>
  );
}

function ClassCard({ studiqClass }: { studiqClass: StudiqClass }) {
  return (
    <Card
      onPress={() => router.push(`/schedule/classes/${studiqClass.id}`)}
      pressStyle={{ opacity: 0.7 }}
      borderLeftWidth={4}
      style={{ borderLeftColor: studiqClass.color }}>
      <Text fontWeight="700" fontSize="$5">
        {studiqClass.name}
      </Text>
      <Paragraph color="$color10">
        {studiqClass.code} · {studiqClass.term}
      </Paragraph>
      <Paragraph color="$color10" fontSize="$3">
        {studiqClass.professor.name}
        {studiqClass.classroom ? ` · ${studiqClass.classroom}` : ''}
      </Paragraph>
    </Card>
  );
}
