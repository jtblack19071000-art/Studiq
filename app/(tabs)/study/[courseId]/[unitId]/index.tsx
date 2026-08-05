import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { Button, H2, Paragraph, Text, XStack, YStack } from 'tamagui';

import { Badge, type BadgeTone } from '@/src/components/Badge';
import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { PremiumGate } from '@/src/components/PremiumGate';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import { generateUnitStudyGuide, StudyAiError } from '@/src/lib/studyAi';
import { useStudyStore } from '@/src/state/studyStore';
import { useSubscriptionStore } from '@/src/state/subscriptionStore';
import type { Lecture } from '@/src/types';

function statusInfo(lecture: Lecture): { label: string; tone: BadgeTone } {
  if (lecture.transcriptionStatus === 'pending') return { label: 'queued', tone: 'neutral' };
  if (lecture.transcriptionStatus === 'transcribing') return { label: 'transcribing…', tone: 'info' };
  if (lecture.transcriptionStatus === 'failed') return { label: 'transcription failed', tone: 'danger' };
  if (lecture.generationStatus === 'generating') return { label: 'generating materials…', tone: 'info' };
  if (lecture.generationStatus === 'failed') return { label: 'generation failed', tone: 'danger' };
  if (lecture.generationStatus === 'ready') return { label: 'ready', tone: 'success' };
  return { label: 'transcribed', tone: 'neutral' };
}

export default function UnitDetailScreen() {
  const { courseId, unitId } = useLocalSearchParams<{ courseId: string; unitId: string }>();
  const unit = useStudyStore((state) => state.units.find((u) => u.id === unitId));
  const allLectures = useStudyStore((state) => state.lectures);
  const updateUnitStudyGuide = useStudyStore((state) => state.updateUnitStudyGuide);
  const removeLecture = useStudyStore((state) => state.removeLecture);
  const isPremium = useSubscriptionStore((state) => state.tier === 'premium');
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

  function handleDeleteLecture(lecture: Lecture) {
    function performDelete() {
      removeLecture(lecture.id);
    }

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${lecture.title}"? This can't be undone.`)) {
        performDelete();
      }
      return;
    }

    Alert.alert('Delete lecture?', `"${lecture.title}" and its transcript/materials will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: performDelete },
    ]);
  }

  return (
    <Screen>
      <YStack gap="$1" paddingTop="$2">
        <H2>{unit.title}</H2>
      </YStack>

      {unit.studyGuide.status === 'ready' ? (
        <Button size="$4" theme="active" borderRadius="$10" onPress={() => router.push(`/study/${courseId}/${unitId}/study-guide`)}>
          📖 View Study Guide
        </Button>
      ) : !isPremium ? (
        <PremiumGate>{null}</PremiumGate>
      ) : (
        <Button size="$4" theme="active" borderRadius="$10" onPress={handleGenerateStudyGuide} disabled={isGeneratingStudyGuide}>
          {isGeneratingStudyGuide ? '✨ Generating…' : '✨ Generate Unit Study Guide'}
        </Button>
      )}
      {studyGuideError ? <Paragraph color="$red10">{studyGuideError}</Paragraph> : null}

      <YStack gap="$2">
        <SectionHeader
          title="Lectures"
          emoji="🎙️"
          action={
            <Button size="$3" theme="active" borderRadius="$10" onPress={() => router.push(`/study/${courseId}/${unitId}/record`)}>
              + Record
            </Button>
          }
        />
        {lectures.length === 0 ? (
          <Card>
            <EmptyState emoji="🎧" message="No lectures recorded in this unit yet." />
          </Card>
        ) : (
          <YStack gap="$3">
            {lectures.map((lecture) => {
              const status = statusInfo(lecture);
              return (
                <Card key={lecture.id} gap="$2">
                  <XStack
                    justifyContent="space-between"
                    alignItems="flex-start"
                    onPress={() => router.push(`/study/${courseId}/${unitId}/lecture/${lecture.id}`)}
                    pressStyle={{ opacity: 0.7 }}>
                    <YStack flex={1} gap="$1.5">
                      <Text fontWeight="700" fontSize="$5">
                        {lecture.title}
                      </Text>
                      <Paragraph color="$color10" fontSize="$3">
                        {format(new Date(lecture.recordedAt), 'EEE MMM d, h:mm a')}
                      </Paragraph>
                      {lecture.generatedSummary ? (
                        <Paragraph fontSize="$3">{lecture.generatedSummary}</Paragraph>
                      ) : null}
                    </YStack>
                    <Badge label={status.label} tone={status.tone} />
                  </XStack>
                  <XStack justifyContent="flex-end">
                    <Button size="$2" chromeless onPress={() => handleDeleteLecture(lecture)}>
                      🗑️ Delete
                    </Button>
                  </XStack>
                </Card>
              );
            })}
          </YStack>
        )}
      </YStack>
    </Screen>
  );
}
