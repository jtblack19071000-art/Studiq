import { format } from 'date-fns';
import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Platform } from 'react-native';
import { Button, H2, Paragraph, Text, XStack, YStack } from 'tamagui';

import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import { useStudyStore } from '@/src/state/studyStore';

function notify(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function UnitDetailScreen() {
  const { unitId } = useLocalSearchParams<{ courseId: string; unitId: string }>();
  const unit = useStudyStore((state) => state.units.find((u) => u.id === unitId));
  const allLectures = useStudyStore((state) => state.lectures);
  const addLecture = useStudyStore((state) => state.addLecture);

  const lectures = useMemo(
    () => allLectures.filter((lecture) => lecture.unitId === unitId),
    [allLectures, unitId],
  );

  if (!unit) {
    return (
      <Screen>
        <EmptyState message="Unit not found." />
      </Screen>
    );
  }

  function handleRecordLecture() {
    // Recording + on-device capture lands in Phase 2; this creates the lecture shell so the
    // Unit → Lecture data flow is testable end to end ahead of the audio pipeline.
    addLecture({
      unitId: unit!.id,
      title: `Lecture ${lectures.length + 1}`,
      recordedAt: new Date().toISOString(),
      durationSeconds: 0,
    });
    notify('Lecture created', 'Recording and transcription are coming in Phase 2. This lecture is a placeholder you can revisit once that lands.');
  }

  function handleGenerateStudyGuide() {
    notify(
      'Coming in Phase 2',
      'Unit study guide generation (summary, flashcards, practice exam, and the rest) runs on the recorded lectures once the AI pipeline is wired up.',
    );
  }

  return (
    <Screen>
      <YStack gap="$1" paddingTop="$2">
        <H2>{unit.title}</H2>
      </YStack>

      <Button size="$4" theme="active" onPress={handleGenerateStudyGuide}>
        Generate Unit Study Guide
      </Button>

      <YStack gap="$2">
        <SectionHeader
          title="Lectures"
          action={
            <Button size="$3" onPress={handleRecordLecture}>
              + Record
            </Button>
          }
        />
        {lectures.length === 0 ? (
          <Card>
            <EmptyState message="No lectures recorded in this unit yet." />
          </Card>
        ) : (
          <YStack gap="$3">
            {lectures.map((lecture) => (
              <Card key={lecture.id}>
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontWeight="700" fontSize="$5">
                    {lecture.title}
                  </Text>
                  <Text color="$color10" fontSize="$2">
                    {lecture.transcriptionStatus}
                  </Text>
                </XStack>
                <Paragraph color="$color10" fontSize="$3">
                  {format(new Date(lecture.recordedAt), 'EEE MMM d, h:mm a')}
                </Paragraph>
                {lecture.generatedSummary ? (
                  <Paragraph fontSize="$3">{lecture.generatedSummary}</Paragraph>
                ) : null}
              </Card>
            ))}
          </YStack>
        )}
      </YStack>
    </Screen>
  );
}
