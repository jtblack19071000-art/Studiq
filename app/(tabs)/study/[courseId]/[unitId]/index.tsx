import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Button, H2, Paragraph, Text, XStack, YStack } from 'tamagui';

import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { PlatinumGate } from '@/src/components/PlatinumGate';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import { generateUnitStudyGuide, StudyAiError } from '@/src/lib/studyAi';
import { useStudyStore } from '@/src/state/studyStore';
import { useSubscriptionStore } from '@/src/state/subscriptionStore';

function statusLabel(transcriptionStatus: string, generationStatus: string): string {
  if (transcriptionStatus === 'pending') return 'queued';
  if (transcriptionStatus === 'transcribing') return 'transcribing…';
  if (transcriptionStatus === 'failed') return 'transcription failed';
  if (generationStatus === 'generating') return 'generating materials…';
  if (generationStatus === 'failed') return 'generation failed';
  if (generationStatus === 'ready') return 'ready';
  return 'transcribed';
}

export default function UnitDetailScreen() {
  const { courseId, unitId } = useLocalSearchParams<{ courseId: string; unitId: string }>();
  const unit = useStudyStore((state) => state.units.find((u) => u.id === unitId));
  const allLectures = useStudyStore((state) => state.lectures);
  const updateUnitStudyGuide = useStudyStore((state) => state.updateUnitStudyGuide);
  const isPlatinum = useSubscriptionStore((state) => state.tier === 'platinum');
  const [studyGuideError, setStudyGuideError] = useState<string | null>(null);

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

  const isGeneratingStudyGuide = unit.studyGuide.status === 'generating';

  async function handleGenerateStudyGuide() {
    setStudyGuideError(null);
    updateUnitStudyGuide(unitId!, { status: 'generating' });
    try {
      const result = await generateUnitStudyGuide(
        unit!.title,
        lectures.map((lecture) => ({ title: lecture.title, transcript: lecture.transcript ?? '' })),
      );
      updateUnitStudyGuide(unitId!, { ...result, status: 'ready', generatedAt: new Date().toISOString() });
      router.push(`/study/${courseId}/${unitId}/study-guide`);
    } catch (error) {
      const message = error instanceof StudyAiError ? error.message : 'Could not generate the study guide.';
      updateUnitStudyGuide(unitId!, { status: 'failed', error: message });
      setStudyGuideError(message);
    }
  }

  return (
    <Screen>
      <YStack gap="$1" paddingTop="$2">
        <H2>{unit.title}</H2>
      </YStack>

      {unit.studyGuide.status === 'ready' ? (
        <Button size="$4" theme="active" onPress={() => router.push(`/study/${courseId}/${unitId}/study-guide`)}>
          View Study Guide
        </Button>
      ) : !isPlatinum ? (
        <PlatinumGate>{null}</PlatinumGate>
      ) : (
        <Button size="$4" theme="active" onPress={handleGenerateStudyGuide} disabled={isGeneratingStudyGuide}>
          {isGeneratingStudyGuide ? 'Generating…' : 'Generate Unit Study Guide'}
        </Button>
      )}
      {studyGuideError ? <Paragraph color="$red10">{studyGuideError}</Paragraph> : null}

      <YStack gap="$2">
        <SectionHeader
          title="Lectures"
          action={
            <Button size="$3" onPress={() => router.push(`/study/${courseId}/${unitId}/record`)}>
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
              <Card
                key={lecture.id}
                onPress={() => router.push(`/study/${courseId}/${unitId}/lecture/${lecture.id}`)}
                pressStyle={{ opacity: 0.7 }}>
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontWeight="700" fontSize="$5">
                    {lecture.title}
                  </Text>
                  <Text color="$color10" fontSize="$2">
                    {statusLabel(lecture.transcriptionStatus, lecture.generationStatus)}
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
