import { format } from 'date-fns';
import { Link } from 'expo-router';
import { useMemo } from 'react';
import { Button, H2, Paragraph, Text, TextArea, YStack } from 'tamagui';

import { AgendaItem } from '@/src/components/AgendaItem';
import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import { getOccurrencesInRange } from '@/src/lib/occurrences';
import { useClassesStore } from '@/src/state/classesStore';
import { useNotesStore } from '@/src/state/notesStore';
import { useScheduleStore } from '@/src/state/scheduleStore';

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
  const events = useScheduleStore((state) => state.events);
  const assignments = useClassesStore((state) => state.assignments);
  const exams = useClassesStore((state) => state.exams);
  const classes = useClassesStore((state) => state.classes);
  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const note = useNotesStore((state) => state.noteForDate(todayKey));
  const setNote = useNotesStore((state) => state.setNoteForDate);

  const todaysOccurrences = useMemo(() => {
    const rangeStart = startOfToday();
    const rangeEnd = endOfToday();
    return events
      .flatMap((event) => getOccurrencesInRange(event, rangeStart, rangeEnd))
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  }, [events]);

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

  return (
    <Screen>
      <YStack gap="$1" paddingTop="$2">
        <Paragraph color="$color10">{format(new Date(), 'EEEE, MMMM d')}</Paragraph>
        <H2>Today</H2>
      </YStack>

      <Link href="/modal" asChild>
        <Button size="$4" theme="active">
          + Quick add
        </Button>
      </Link>

      <YStack gap="$2">
        <SectionHeader title="Timeline" />
        <Card>
          {todaysOccurrences.length === 0 ? (
            <EmptyState message="Nothing scheduled today." />
          ) : (
            todaysOccurrences.map((occurrence, index) => (
              <AgendaItem key={`${occurrence.event.id}-${index}`} occurrence={occurrence} />
            ))
          )}
        </Card>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Upcoming assignments" />
        <Card>
          {upcomingAssignments.length === 0 ? (
            <EmptyState message="No assignments due in the next 7 days." />
          ) : (
            upcomingAssignments.map((assignment) => {
              const studiqClass = classes.find((c) => c.id === assignment.classId);
              return (
                <YStack key={assignment.id} paddingVertical="$2">
                  <Text fontWeight="600">{assignment.title}</Text>
                  <Paragraph color="$color10" fontSize="$3">
                    {studiqClass?.code ?? 'Class'} · Due {format(new Date(assignment.dueAt), 'EEE MMM d, h:mm a')}
                  </Paragraph>
                </YStack>
              );
            })
          )}
        </Card>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Upcoming exams" />
        <Card>
          {upcomingExams.length === 0 ? (
            <EmptyState message="No exams in the next 14 days." />
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
        <SectionHeader title="Daily note" />
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
