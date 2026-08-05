import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { Button, H2, Input, Paragraph, Text, XStack, YStack } from 'tamagui';

import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { PremiumGate } from '@/src/components/PremiumGate';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import { generateLectureMaterials, StudyAiError } from '@/src/lib/studyAi';
import { useStudyStore } from '@/src/state/studyStore';
import { useSubscriptionStore } from '@/src/state/subscriptionStore';

export default function LectureDetailScreen() {
  const { courseId, unitId, lectureId } = useLocalSearchParams<{
    courseId: string;
    unitId: string;
    lectureId: string;
  }>();
  const lecture = useStudyStore((state) => state.lectures.find((l) => l.id === lectureId));
  const updateLecture = useStudyStore((state) => state.updateLecture);
  const removeLecture = useStudyStore((state) => state.removeLecture);
  const isPremium = useSubscriptionStore((state) => state.tier === 'premium');
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  if (!lecture) {
    return (
      <Screen>
        <EmptyState message="Lecture not found." />
      </Screen>
    );
  }

  function handleStartRename() {
    setTitleDraft(lecture!.title);
    setIsRenaming(true);
  }

  function handleSaveRename() {
    if (titleDraft.trim()) {
      updateLecture(lectureId!, { title: titleDraft.trim() });
    }
    setIsRenaming(false);
  }

  function handleDelete() {
    function performDelete() {
      removeLecture(lecture!.id);
      router.replace(`/study/${courseId}/${unitId}`);
    }

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${lecture!.title}"? This can't be undone.`)) {
        performDelete();
      }
      return;
    }

    Alert.alert('Delete lecture?', `"${lecture!.title}" and its transcript/materials will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: performDelete },
    ]);
  }

  async function handleGenerateMaterials() {
    if (!lecture!.transcript) return;
    setGenerateError(null);
    updateLecture(lectureId!, { generationStatus: 'generating' });
    try {
      const materials = await generateLectureMaterials(lecture!.transcript);
      updateLecture(lectureId!, { generationStatus: 'ready', ...materials });
    } catch (error) {
      const message = error instanceof StudyAiError ? error.message : 'Could not generate materials.';
      updateLecture(lectureId!, { generationStatus: 'failed', generationError: message });
      setGenerateError(message);
    }
  }

  return (
    <Screen>
      <YStack gap="$2" paddingTop="$2">
        {isRenaming ? (
          <XStack gap="$2" alignItems="center">
            <Input flex={1} value={titleDraft} onChangeText={setTitleDraft} autoFocus />
            <Button size="$3" theme="active" onPress={handleSaveRename}>
              Save
            </Button>
            <Button size="$3" chromeless onPress={() => setIsRenaming(false)}>
              Cancel
            </Button>
          </XStack>
        ) : (
          <H2>{lecture.title}</H2>
        )}
        <Paragraph color="$color10">
          {format(new Date(lecture.recordedAt), 'EEE MMM d, h:mm a')}
          {lecture.durationSeconds > 0
            ? ` · ${Math.floor(lecture.durationSeconds / 60)}:${(lecture.durationSeconds % 60).toString().padStart(2, '0')}`
            : ''}
        </Paragraph>
        {!isRenaming ? (
          <XStack gap="$3">
            <Button size="$3" onPress={handleStartRename}>
              ✏️ Rename
            </Button>
            <Button size="$3" theme="red" onPress={handleDelete}>
              🗑️ Delete
            </Button>
          </XStack>
        ) : null}
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Transcript" />
        <Card>
          {lecture.transcriptionStatus === 'pending' || lecture.transcriptionStatus === 'transcribing' ? (
            <EmptyState message="Transcribing…" />
          ) : lecture.transcriptionStatus === 'failed' ? (
            <Paragraph color="$red10">
              Transcription failed{lecture.transcriptionError ? `: ${lecture.transcriptionError}` : '.'}
            </Paragraph>
          ) : (
            <Paragraph>{lecture.transcript}</Paragraph>
          )}
        </Card>
      </YStack>

      {lecture.transcriptionStatus === 'transcribed' && lecture.generationStatus !== 'ready' ? (
        <YStack gap="$2">
          {lecture.generationStatus === 'generating' ? (
            <Card>
              <EmptyState message="Generating study materials…" />
            </Card>
          ) : !isPremium ? (
            <PremiumGate>{null}</PremiumGate>
          ) : (
            <Button size="$4" theme="active" onPress={handleGenerateMaterials}>
              {lecture.generationStatus === 'failed' ? 'Retry generating materials' : 'Generate materials'}
            </Button>
          )}
          {generateError ? <Paragraph color="$red10">{generateError}</Paragraph> : null}
        </YStack>
      ) : null}

      {lecture.generationStatus === 'ready' ? (
        <>
          <YStack gap="$2">
            <SectionHeader title="Summary" />
            <Card>
              <Paragraph>{lecture.generatedSummary}</Paragraph>
            </Card>
          </YStack>

          <YStack gap="$2">
            <SectionHeader title="Notes" />
            <Card>
              <Paragraph>{lecture.generatedNotes}</Paragraph>
            </Card>
          </YStack>

          {lecture.professorEmphasis && lecture.professorEmphasis.length > 0 ? (
            <YStack gap="$2">
              <SectionHeader title="Professor emphasized" />
              <Card>
                {lecture.professorEmphasis.map((point, index) => (
                  <Text key={index}>• {point}</Text>
                ))}
              </Card>
            </YStack>
          ) : null}

          {lecture.detectedAssignments && lecture.detectedAssignments.length > 0 ? (
            <YStack gap="$2">
              <SectionHeader title="Detected assignments" />
              <Card>
                {lecture.detectedAssignments.map((item, index) => (
                  <Text key={index}>• {item}</Text>
                ))}
              </Card>
            </YStack>
          ) : null}

          {lecture.vocabulary && lecture.vocabulary.length > 0 ? (
            <YStack gap="$2">
              <SectionHeader title="Vocabulary" />
              <Card>
                {lecture.vocabulary.map((entry, index) => (
                  <YStack key={index} paddingVertical="$1.5">
                    <Text fontWeight="600">{entry.term}</Text>
                    <Paragraph color="$color10" fontSize="$3">
                      {entry.definition}
                    </Paragraph>
                  </YStack>
                ))}
              </Card>
            </YStack>
          ) : null}

          {lecture.formulas && lecture.formulas.length > 0 ? (
            <YStack gap="$2">
              <SectionHeader title="Formulas" />
              <Card>
                {lecture.formulas.map((formula, index) => (
                  <Text key={index}>• {formula}</Text>
                ))}
              </Card>
            </YStack>
          ) : null}

          {lecture.conceptExplanations && lecture.conceptExplanations.length > 0 ? (
            <YStack gap="$2">
              <SectionHeader title="Concepts explained" />
              <Card>
                {lecture.conceptExplanations.map((entry, index) => (
                  <YStack key={index} paddingVertical="$1.5">
                    <Text fontWeight="600">{entry.concept}</Text>
                    <Paragraph color="$color10" fontSize="$3">
                      {entry.explanation}
                    </Paragraph>
                  </YStack>
                ))}
              </Card>
            </YStack>
          ) : null}

          {lecture.flashcards && lecture.flashcards.length > 0 ? (
            <YStack gap="$2">
              <SectionHeader title="Flashcards" />
              <Card>
                {lecture.flashcards.map((card, index) => (
                  <YStack key={index} paddingVertical="$1.5">
                    <Text fontWeight="600">{card.front}</Text>
                    <Paragraph color="$color10" fontSize="$3">
                      {card.back}
                    </Paragraph>
                  </YStack>
                ))}
              </Card>
            </YStack>
          ) : null}

          {lecture.quiz && lecture.quiz.length > 0 ? (
            <YStack gap="$2">
              <SectionHeader title="Practice quiz" />
              <Card>
                {lecture.quiz.map((question, index) => (
                  <YStack key={index} paddingVertical="$1.5">
                    <Text fontWeight="600">
                      {index + 1}. {question.question}
                    </Text>
                    <Paragraph color="$color10" fontSize="$3">
                      Answer: {question.answer}
                    </Paragraph>
                  </YStack>
                ))}
              </Card>
            </YStack>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}
