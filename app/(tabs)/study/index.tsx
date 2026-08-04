import { router } from 'expo-router';
import { H1, Paragraph, Text, YStack } from 'tamagui';

import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { Screen } from '@/src/components/Screen';
import { useClassesStore } from '@/src/state/classesStore';
import { useStudyStore } from '@/src/state/studyStore';

export default function StudyScreen() {
  const courses = useStudyStore((state) => state.courses);
  const units = useStudyStore((state) => state.units);
  const classes = useClassesStore((state) => state.classes);

  return (
    <Screen>
      <YStack gap="$1" paddingTop="$2">
        <H1 fontSize="$9">🎙️ Study</H1>
        <Paragraph color="$color10">
          Record lectures by unit, then generate a study guide from everything in that unit.
        </Paragraph>
      </YStack>

      {courses.length === 0 ? (
        <EmptyState emoji="📚" message="Open a class and tap 'Open Study workspace' to get started." />
      ) : (
        <YStack gap="$3">
          {courses.map((course) => {
            const studiqClass = classes.find((c) => c.id === course.classId);
            const unitCount = units.filter((unit) => unit.courseId === course.id).length;
            return (
              <Card
                key={course.id}
                onPress={() => router.push(`/study/${course.id}`)}
                pressStyle={{ opacity: 0.7, scale: 0.99 }}
                accentColor={studiqClass?.color ?? '#8A8F98'}>
                <Text fontWeight="700" fontSize="$6">
                  {course.title}
                </Text>
                <Paragraph color="$color10">
                  📗 {unitCount} unit{unitCount === 1 ? '' : 's'}
                </Paragraph>
              </Card>
            );
          })}
        </YStack>
      )}
    </Screen>
  );
}
