import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Button, H2, Paragraph, Text, YStack } from 'tamagui';

import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import { exportStudyGuideToPdf } from '@/src/lib/studyGuidePdf';
import { useStudyStore } from '@/src/state/studyStore';
import type { QuizQuestion } from '@/src/types';

function BulletList({ items }: { items: string[] | undefined }) {
  if (!items || items.length === 0) return null;
  return (
    <Card>
      {items.map((item, index) => (
        <Text key={index}>• {item}</Text>
      ))}
    </Card>
  );
}

function QuizList({ questions }: { questions: QuizQuestion[] | undefined }) {
  if (!questions || questions.length === 0) return null;
  return (
    <Card>
      {questions.map((question, index) => (
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
  );
}

export default function StudyGuideScreen() {
  const { unitId } = useLocalSearchParams<{ courseId: string; unitId: string }>();
  const unit = useStudyStore((state) => state.units.find((u) => u.id === unitId));
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  if (!unit) {
    return (
      <Screen>
        <EmptyState message="Unit not found." />
      </Screen>
    );
  }

  const guide = unit.studyGuide;

  if (guide.status !== 'ready') {
    return (
      <Screen>
        <EmptyState
          message={
            guide.status === 'generating'
              ? 'Generating the study guide…'
              : guide.status === 'failed'
                ? `Generation failed${guide.error ? `: ${guide.error}` : '.'}`
                : 'No study guide generated yet.'
          }
        />
      </Screen>
    );
  }

  async function handleExport() {
    setExporting(true);
    setExportError(null);
    try {
      await exportStudyGuideToPdf(unit!.title, guide);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Could not export PDF.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <Screen>
      <YStack gap="$1" paddingTop="$2">
        <H2>{unit.title}</H2>
        <Paragraph color="$color10">Unit study guide</Paragraph>
      </YStack>

      <Button size="$4" theme="active" onPress={handleExport} disabled={exporting}>
        {exporting ? 'Exporting…' : 'Export to PDF'}
      </Button>
      {exportError ? <Paragraph color="$red10">{exportError}</Paragraph> : null}

      <YStack gap="$2">
        <SectionHeader title="Study guide" />
        <Card>
          <Paragraph>{guide.studyGuide}</Paragraph>
        </Card>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Review sheet" />
        <Card>
          <Paragraph>{guide.reviewSheet}</Paragraph>
        </Card>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Chapter summary" />
        <Card>
          <Paragraph>{guide.chapterSummary}</Paragraph>
        </Card>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Key concepts" />
        <BulletList items={guide.keyConcepts} />
      </YStack>

      {guide.vocabulary && guide.vocabulary.length > 0 ? (
        <YStack gap="$2">
          <SectionHeader title="Vocabulary" />
          <Card>
            {guide.vocabulary.map((entry, index) => (
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

      <YStack gap="$2">
        <SectionHeader title="Equations & formulas" />
        <BulletList items={guide.equationsAndFormulas} />
      </YStack>

      {guide.flashcards && guide.flashcards.length > 0 ? (
        <YStack gap="$2">
          <SectionHeader title="Flashcards" />
          <Card>
            {guide.flashcards.map((card, index) => (
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

      <YStack gap="$2">
        <SectionHeader title="Practice quiz" />
        <QuizList questions={guide.practiceQuiz} />
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Practice exam" />
        <QuizList questions={guide.practiceExam} />
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Likely exam topics" />
        <BulletList items={guide.likelyExamTopics} />
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Professor emphasized" />
        <BulletList items={guide.professorEmphasis} />
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Memory tricks & mnemonics" />
        <BulletList items={guide.mnemonics} />
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Review checklist" />
        <BulletList items={guide.reviewChecklist} />
      </YStack>
    </Screen>
  );
}
