import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import { Link, router } from 'expo-router';
import { useMemo } from 'react';
import { Button, H1, Paragraph, Text, TextArea, XStack, YStack } from 'tamagui';

import { AgendaItem } from '@/src/components/AgendaItem';
import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { Hero } from '@/src/components/Hero';
import { Icon, type IconName } from '@/src/components/Icon';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import type { EventOccurrence } from '@/src/lib/occurrences';
import { getOccurrencesInRange } from '@/src/lib/occurrences';
import { useClassesStore } from '@/src/state/classesStore';
import { useNotesStore } from '@/src/state/notesStore';
import { useScheduleStore } from '@/src/state/scheduleStore';
import { ACCENT_TINT, useThemeStore } from '@/src/state/themeStore';

function greeting(): { text: string; icon: IconName } {
  const hour = new Date().getHours();
  if (hour < 5) return { text: 'Up late', icon: 'moon' };
  if (hour < 12) return { text: 'Good morning', icon: 'sunrise' };
  if (hour < 17) return { text: 'Good afternoon', icon: 'sun' };
  return { text: 'Good evening', icon: 'sunset' };
}

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

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfToday() {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
}

export default function HomeScreen() {
  const accentColor = useThemeStore((state) => state.accentColor);
  const events = useScheduleStore((state) => state.events);
  const assignments = useClassesStore((state) => state.assignments);
  const exams = useClassesStore((state) => state.exams);
  const classes = useClassesStore((state) => state.classes);
  const activeTerm = useClassesStore((state) => state.activeTerm);
  const classesById = useMemo(() => new Map(classes.map((studiqClass) => [studiqClass.id, studiqClass])), [classes]);
  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const note = useNotesStore((state) => state.noteForDate(todayKey));
  const setNote = useNotesStore((state) => state.setNoteForDate);

  // Keep archived-semester classes off the daily timeline too — see startNewSemester.
  const visibleEvents = useMemo(() => {
    if (activeTerm === null) return events;
    return events.filter((event) => !event.classId || classesById.get(event.classId)?.term === activeTerm);
  }, [events, activeTerm, classesById]);

  const todaysOccurrences = useMemo(() => {
    const rangeStart = startOfToday();
    const rangeEnd = endOfToday();
    return visibleEvents
      .flatMap((event) => getOccurrencesInRange(event, rangeStart, rangeEnd))
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  }, [visibleEvents]);

  // The Schedule tab's week view only shows Mon–Fri now (see WeekGridCalendar), so this is the
  // one place weekend commitments — work, research, anything set to repeat on a Saturday or
  // Sunday via Quick Add — stay visible without digging into Day view.
  const weekendOccurrences = useMemo(() => {
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    const saturday = addDays(monday, 5);
    const rangeEnd = addDays(monday, 7);
    return visibleEvents
      .flatMap((event) => getOccurrencesInRange(event, saturday, rangeEnd))
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  }, [visibleEvents]);

  const upcomingAssignments = useMemo(() => {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return assignments
      .filter((assignment) => {
        const due = new Date(assignment.dueAt);
        return due >= now && due <= in7Days && assignment.status !== 'graded';
      })
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  }, [assignments]);

  const upcomingExams = useMemo(() => {
    const now = new Date();
    const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    return exams
      .filter((exam) => new Date(exam.date) >= now && new Date(exam.date) <= in14Days)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [exams]);

  const eventCount = todaysOccurrences.length;
  const dueSoonCount = upcomingAssignments.length + upcomingExams.length;

  return (
    <Screen>
      <Hero logo gap="$1">
        <XStack alignItems="center" gap="$2">
          <Icon name={greeting().icon} size={18} color={ACCENT_TINT[accentColor]} />
          <Text fontWeight="700" fontSize="$5" style={{ color: ACCENT_TINT[accentColor] }}>
            {greeting().text}
          </Text>
        </XStack>
        <H1 fontSize="$9">{format(new Date(), 'EEEE, MMM d')}</H1>
        <Paragraph color="$color11" fontSize="$4">
          {eventCount === 0 ? 'Nothing on the calendar today.' : `${eventCount} thing${eventCount === 1 ? '' : 's'} on today`}
          {dueSoonCount > 0 ? ` · ${dueSoonCount} due soon` : ''}
        </Paragraph>
      </Hero>

      <YStack gap="$1.5">
        <Link href="/modal" asChild>
          <Button size="$4" theme="active" borderRadius="$10" icon={<Icon name="plus" size={16} color="white" />}>
            Quick add
          </Button>
        </Link>
        <Paragraph fontSize="$2" color="$color10" textAlign="center">
          Add anything that isn&apos;t a class — work, research, appointments, and more.
        </Paragraph>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Timeline" icon="calendar" />
        <Card>
          {todaysOccurrences.length === 0 ? (
            <EmptyState icon="leaf" message="Nothing scheduled today." />
          ) : (
            todaysOccurrences.map((occurrence, index) => (
              <AgendaItem
                key={`${occurrence.event.id}-${index}`}
                occurrence={occurrence}
                classesById={classesById}
                onPress={() => openEventDetail(occurrence)}
              />
            ))
          )}
        </Card>
      </YStack>

      <YStack gap="$2">
        <XStack alignItems="center" justifyContent="space-between">
          <SectionHeader title="This weekend" icon="sparkle" />
          <Button
            size="$2"
            chromeless
            onPress={() => router.push({ pathname: '/modal', params: { day: 'sat' } })}
            icon={<Icon name="plus" size={14} color={ACCENT_TINT[accentColor]} />}>
            Add
          </Button>
        </XStack>
        <Card>
          {weekendOccurrences.length === 0 ? (
            <EmptyState icon="leaf" message="Nothing on the calendar this weekend." />
          ) : (
            weekendOccurrences.map((occurrence, index) => {
              const showDayLabel =
                index === 0 || !isSameDay(occurrence.startsAt, weekendOccurrences[index - 1].startsAt);
              return (
                <YStack key={`${occurrence.event.id}-${index}`}>
                  {showDayLabel ? (
                    <Text fontWeight="700" fontSize="$2" color="$color9" paddingTop={index === 0 ? 0 : '$2'}>
                      {format(occurrence.startsAt, 'EEEE').toUpperCase()}
                    </Text>
                  ) : null}
                  <AgendaItem occurrence={occurrence} classesById={classesById} onPress={() => openEventDetail(occurrence)} />
                </YStack>
              );
            })
          )}
        </Card>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Upcoming assignments" icon="pin" />
        <Card>
          {upcomingAssignments.length === 0 ? (
            <EmptyState icon="confetti" message="No assignments due in the next 7 days." />
          ) : (
            upcomingAssignments.map((assignment) => {
              const studiqClass = classes.find((c) => c.id === assignment.classId);
              return (
                <YStack key={assignment.id} paddingVertical="$2">
                  <Text fontWeight="600">{assignment.title}</Text>
                  <Paragraph color="$color10" fontSize="$3">
                    {studiqClass?.code ?? 'Class'} · Due {format(new Date(assignment.dueAt), 'EEE MMM d, h:mm a')}
                    {assignment.source === 'syllabus' ? ' · From syllabus' : ''}
                  </Paragraph>
                </YStack>
              );
            })
          )}
        </Card>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Upcoming exams" icon="flask" />
        <Card>
          {upcomingExams.length === 0 ? (
            <EmptyState icon="smile" message="No exams in the next 14 days." />
          ) : (
            upcomingExams.map((exam) => {
              const studiqClass = classes.find((c) => c.id === exam.classId);
              return (
                <YStack key={exam.id} paddingVertical="$2">
                  <Text fontWeight="600">{exam.title}</Text>
                  <Paragraph color="$color10" fontSize="$3">
                    {studiqClass?.code ?? 'Class'} · {format(new Date(exam.date), 'EEE MMM d, h:mm a')}
                  </Paragraph>
                </YStack>
              );
            })
          )}
        </Card>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Daily note" icon="note" />
        <Card>
          <TextArea
            placeholder="Anything worth remembering about today..."
            minHeight={80}
            value={note?.body ?? ''}
            onChangeText={(text) => setNote(todayKey, text)}
            borderWidth={0}
            backgroundColor="transparent"
            padding={0}
          />
        </Card>
      </YStack>
    </Screen>
  );
}
