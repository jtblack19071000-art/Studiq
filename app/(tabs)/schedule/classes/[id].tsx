import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Button, H2, Paragraph, Text, XStack, YStack } from 'tamagui';

import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { Icon } from '@/src/components/Icon';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import { useClassesStore } from '@/src/state/classesStore';
import { useStudyStore } from '@/src/state/studyStore';

export default function ClassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const studiqClass = useClassesStore((state) => state.classById(id));
  const allAssignments = useClassesStore((state) => state.assignments);
  const allExams = useClassesStore((state) => state.exams);
  const allAnnouncements = useClassesStore((state) => state.announcements);
  const studyCourse = useStudyStore((state) => state.courseByClassId(id));
  const addCourse = useStudyStore((state) => state.addCourse);

  const assignments = useMemo(
    () => allAssignments.filter((assignment) => assignment.classId === id),
    [allAssignments, id],
  );
  const exams = useMemo(() => allExams.filter((exam) => exam.classId === id), [allExams, id]);
  const announcements = useMemo(
    () => allAnnouncements.filter((announcement) => announcement.classId === id),
    [allAnnouncements, id],
  );

  if (!studiqClass) {
    return (
      <Screen>
        <EmptyState message="Class not found." />
      </Screen>
    );
  }

  function goToStudyWorkspace() {
    if (studyCourse) {
      router.push(`/study/${studyCourse.id}`);
      return;
    }
    const created = addCourse({ classId: studiqClass!.id, title: studiqClass!.name });
    router.push(`/study/${created.id}`);
  }

  return (
    <Screen>
      <YStack
        gap="$1"
        paddingTop="$4"
        paddingBottom="$4"
        paddingHorizontal="$4"
        marginHorizontal="$-4"
        style={{ backgroundColor: `${studiqClass.color}1A` }}>
        <H2>{studiqClass.name}</H2>
        <Paragraph color="$color10">
          {studiqClass.code} · {studiqClass.term}
        </Paragraph>
      </YStack>

      <XStack gap="$3">
        <Button
          flex={1}
          size="$4"
          theme="active"
          borderRadius="$10"
          onPress={goToStudyWorkspace}
          icon={<Icon name="mic" size={16} color="white" />}>
          Open Study workspace
        </Button>
        <Button
          size="$4"
          borderRadius="$10"
          onPress={() => router.push(`/schedule/classes/${studiqClass.id}/edit`)}
          icon={<Icon name="edit" size={16} color="#8A8F98" />}>
          Edit
        </Button>
      </XStack>

      <YStack gap="$2">
        <SectionHeader title="Professor" icon="graduation-cap" />
        <Card>
          <Text fontWeight="600">{studiqClass.professor.name}</Text>
          {studiqClass.professor.email ? (
            <Paragraph color="$color10">{studiqClass.professor.email}</Paragraph>
          ) : null}
          {studiqClass.professor.officeLocation ? (
            <Paragraph color="$color10">Office: {studiqClass.professor.officeLocation}</Paragraph>
          ) : null}
          {studiqClass.professor.officeHours ? (
            <Paragraph color="$color10">Office hours: {studiqClass.professor.officeHours}</Paragraph>
          ) : null}
          {studiqClass.classroom ? (
            <Paragraph color="$color10">Classroom: {studiqClass.classroom}</Paragraph>
          ) : null}
        </Card>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Assignments" icon="pin" />
        <Card>
          {assignments.length === 0 ? (
            <EmptyState message="No assignments yet." />
          ) : (
            assignments.map((assignment) => (
              <YStack key={assignment.id} paddingVertical="$2">
                <Text fontWeight="600">{assignment.title}</Text>
                <Paragraph color="$color10" fontSize="$3">
                  Due {format(new Date(assignment.dueAt), 'EEE MMM d, h:mm a')} ·{' '}
                  {assignment.status.replace('_', ' ')}
                  {assignment.source === 'syllabus' ? ' · From syllabus' : ''}
                </Paragraph>
              </YStack>
            ))
          )}
        </Card>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Exams" icon="flask" />
        <Card>
          {exams.length === 0 ? (
            <EmptyState message="No exams scheduled." />
          ) : (
            exams.map((exam) => (
              <YStack key={exam.id} paddingVertical="$2">
                <Text fontWeight="600">{exam.title}</Text>
                <Paragraph color="$color10" fontSize="$3">
                  {format(new Date(exam.date), 'EEE MMM d, h:mm a')}
                  {exam.location ? ` · ${exam.location}` : ''}
                </Paragraph>
              </YStack>
            ))
          )}
        </Card>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Announcements" icon="megaphone" />
        <Card>
          {announcements.length === 0 ? (
            <EmptyState message="No announcements." />
          ) : (
            announcements.map((announcement) => (
              <YStack key={announcement.id} paddingVertical="$2">
                <Text fontWeight="600">{announcement.title}</Text>
                <Paragraph color="$color10" fontSize="$3">
                  {announcement.body}
                </Paragraph>
              </YStack>
            ))
          )}
        </Card>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Files & Grades" icon="folder" />
        <Card>
          <EmptyState message="Files and grade tracking are coming soon." />
        </Card>
      </YStack>
    </Screen>
  );
}
