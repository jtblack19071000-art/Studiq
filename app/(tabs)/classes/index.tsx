import { router } from 'expo-router';
import { H2, Paragraph, Text, YStack } from 'tamagui';

import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { Screen } from '@/src/components/Screen';
import { useClassesStore } from '@/src/state/classesStore';

export default function ClassesScreen() {
  const classes = useClassesStore((state) => state.classes);

  return (
    <Screen>
      <YStack gap="$1" paddingTop="$2">
        <H2>Classes</H2>
      </YStack>

      {classes.length === 0 ? (
        <EmptyState message="No classes yet. Import a syllabus or add one manually." />
      ) : (
        <YStack gap="$3">
          {classes.map((studiqClass) => (
            <Card
              key={studiqClass.id}
              onPress={() => router.push(`/classes/${studiqClass.id}`)}
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
          ))}
        </YStack>
      )}
    </Screen>
  );
}
