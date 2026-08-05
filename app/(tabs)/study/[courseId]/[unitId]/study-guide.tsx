import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Button, H1, Paragraph, Text, YStack } from 'tamagui';

import { Badge } from '@/src/components/Badge';
import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import { exportStudyGuideToPdf } from '@/src/lib/studyGuidePdf';
import { useStudyStore } from '@/src/state/studyStore';
import { ACCENT_SOFT_BG, ACCENT_TINT, useThemeStore } from '@/src/state/themeStore';
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
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  if (!questions || questions.length === 0) return null;

  function toggle(index: number) {
    setRevealed((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <YStack gap="$2">
      {questions.map((question, index) => (
        <Card key={index} onPress={() => toggle(index)} pressStyle={{ opacity: 0.8 }}>
          <Text fontWeight="600">
            {index + 1}. {question.question}
          </Text>
          {revealed.has(index) ? (
            <Paragraph color="$color10" fontSize="$3" paddingTop="$1">
              💡 {question.answer}
            </Paragraph>
          ) : (
            <Paragraph color="$color8" fontSize="$3" paddingTop="$1">
              Tap to reveal answer
            </Paragraph>
          )}
        </Card>
      ))}
    </YStack>
  );
}

function FlashcardList({ cards }: { cards: { front: string; back: string }[] | undefined }) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  if (!cards || cards.length === 0) return null;

  function toggle(index: number) {
    setFlipped((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <YStack gap="$2">
      {cards.map((card, index) => {
        const isFlipped = flipped.has(index);
        return (
          <Card
            key={index}
            onPress={() => toggle(index)}
            pressStyle={{ opacity: 0.8 }}
            accentColor={isFlipped ? '#4C9F4C' : '#7D5BD9'}>
            <Text fontWeight="700">{isFlipped ? card.back : card.front}</Text>
            <Text color="$color8" fontSize="$2" paddingTop="$1">
              {isFlipped ? '🔄 tap to see term' : '🃏 tap to flip'}
            </Text>
          </Card>
        );
      })}
    </YStack>
  );
}

export default function StudyGuideScreen() {
  const { unitId } = useLocalSearchParams<{ courseId: string; unitId: string }>();
  const unit = useStudyStore((state) => state.units.find((u) => u.id === unitId));
  const accentColor = useThemeStore((state) => state.accentColor);
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
          emoji={guide.status === 'generating' ? '✨' : guide.status === 'failed' ? '😕' : '📖'}
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
      <YStack
        borderRadius="$8"
        padding="$5"
        gap="$2"
        marginTop="$2"
        style={{ backgroundColor: ACCENT_SOFT_BG[accentColor] }}>
        <Badge label="✨ AI STUDY GUIDE" tone="info" />
        <H1 fontSize="$8" style={{ color: ACCENT_TINT[accentColor] }}>
          {unit.title}
        </H1>
        <Paragraph color="$color11">Everything from every lecture in this unit, in one place.</Paragraph>
      </YStack>

      <Button size="$4" theme="active" borderRadius="$10" onPress={handleExport} disabled={exporting}>
        {exporting ? 'Exporting…' : '📤 Export to PDF'}
      </Button>
      {exportError ? <Paragraph color="$red10">{exportError}</Paragraph> : null}

      <YStack gap="$2">
        <SectionHeader title="Study guide" emoji="📘" />
        <Card>
          <Paragraph>{guide.studyGuide}</Paragraph>
        </Card>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Review sheet" emoji="📝" />
        <Card>
          <Paragraph>{guide.reviewSheet}</Paragraph>
        </Card>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Chapter summary" emoji="🧾" />
        <Card>
          <Paragraph>{guide.chapterSummary}</Paragraph>
        </Card>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Key concepts" emoji="💡" />
        <BulletList items={guide.keyConcepts} />
      </YStack>

      {guide.vocabulary && guide.vocabulary.length > 0 ? (
        <YStack gap="$2">
          <SectionHeader title="Vocabulary" emoji="📚" />
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
        <SectionHeader title="Equations & formulas" emoji="➗" />
        <BulletList items={guide.equationsAndFormulas} />
      </YStack>

      {guide.flashcards && guide.flashcards.length > 0 ? (
        <YStack gap="$2">
          <SectionHeader title="Flashcards" emoji="🃏" />
          <FlashcardList cards={guide.flashcards} />
        </YStack>
      ) : null}

      <YStack gap="$2">
        <SectionHeader title="Practice quiz" emoji="❓" />
        <QuizList questions={guide.practiceQuiz} />
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Practice exam" emoji="🎯" />
        <QuizList questions={guide.practiceExam} />
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Likely exam topics" emoji="🔮" />
        <BulletList items={guide.likelyExamTopics} />
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Professor emphasized" emoji="⭐" />
        <BulletList items={guide.professorEmphasis} />
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Memory tricks & mnemonics" emoji="🧠" />
        <BulletList items={guide.mnemonics} />
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Review checklist" emoji="✅" />
        <BulletList items={guide.reviewChecklist} />
      </YStack>
    </Screen>
  );
}
