import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Button, H2, Input, Paragraph, Text, XStack, YStack } from 'tamagui';

import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { Screen } from '@/src/components/Screen';
import { useStudyStore } from '@/src/state/studyStore';

export default function CourseUnitsScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const course = useStudyStore((state) => state.courses.find((c) => c.id === courseId));
  const allUnits = useStudyStore((state) => state.units);
  const lectures = useStudyStore((state) => state.lectures);
  const addUnit = useStudyStore((state) => state.addUnit);

  const units = useMemo(
    () => allUnits.filter((unit) => unit.courseId === courseId),
    [allUnits, courseId],
  );

  const [newUnitTitle, setNewUnitTitle] = useState('');

  if (!course) {
    return (
      <Screen>
        <EmptyState message="Course not found." />
      </Screen>
    );
  }

  function handleAddUnit() {
    if (!newUnitTitle.trim()) return;
    addUnit({ courseId: course!.id, title: newUnitTitle.trim() });
    setNewUnitTitle('');
  }

  return (
    <Screen>
      <YStack gap="$1" paddingTop="$2">
        <H2>{course.title}</H2>
      </YStack>

      <XStack gap="$2">
        <Input
          flex={1}
          placeholder="New unit name, e.g. Unit 2 — Thermodynamics"
          value={newUnitTitle}
          onChangeText={setNewUnitTitle}
        />
        <Button theme="active" onPress={handleAddUnit}>
          Add
        </Button>
      </XStack>

      {units.length === 0 ? (
        <EmptyState message="No units yet. Create one above to start recording lectures." />
      ) : (
        <YStack gap="$3">
          {units.map((unit) => {
            const lectureCount = lectures.filter((lecture) => lecture.unitId === unit.id).length;
            return (
              <Card
                key={unit.id}
                onPress={() => router.push(`/study/${course.id}/${unit.id}`)}
                pressStyle={{ opacity: 0.7 }}>
                <Text fontWeight="700" fontSize="$5">
                  {unit.title}
                </Text>
                <Paragraph color="$color10">
                  {lectureCount} lecture{lectureCount === 1 ? '' : 's'} · Study guide:{' '}
                  {unit.studyGuide.status.replace('_', ' ')}
                </Paragraph>
              </Card>
            );
          })}
        </YStack>
      )}
    </Screen>
  );
}
