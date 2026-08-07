import { useMemo } from 'react';
import { Button, H2, H3, Input, Paragraph, Text, XStack, YStack } from 'tamagui';

import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { Hero } from '@/src/components/Hero';
import { Icon } from '@/src/components/Icon';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import { calculateGpa, groupClassesByTerm, LETTER_GRADES } from '@/src/lib/gpa';
import { useClassesStore } from '@/src/state/classesStore';
import { ACCENT_TINT, useThemeStore } from '@/src/state/themeStore';
import type { LetterGrade } from '@/src/types';

export default function GpaScreen() {
  const classes = useClassesStore((state) => state.classes);
  const updateClass = useClassesStore((state) => state.updateClass);
  const accentColor = useThemeStore((state) => state.accentColor);

  const overall = useMemo(() => calculateGpa(classes), [classes]);
  const termGroups = useMemo(() => groupClassesByTerm(classes), [classes]);

  return (
    <Screen>
      <YStack gap="$1" paddingTop="$2">
        <XStack alignItems="center" gap="$2">
          <Icon name="graduation-cap" size={22} color="#3B6FE0" />
          <H2>GPA Tracker</H2>
        </XStack>
      </YStack>

      <Hero logo alignItems="center" paddingVertical="$6" gap="$1">
        <Text fontSize="$11" fontWeight="800" style={{ color: ACCENT_TINT[accentColor] }}>
          {overall.gpa !== null ? overall.gpa.toFixed(2) : '—'}
        </Text>
        <Paragraph color="$color11">
          Cumulative GPA · {overall.totalCreditHours} credit hour{overall.totalCreditHours === 1 ? '' : 's'}
        </Paragraph>
      </Hero>

      {classes.length === 0 ? (
        <EmptyState icon="graduation-cap" message="Add classes from the Classes tab to start tracking your GPA." />
      ) : (
        Array.from(termGroups.entries()).map(([term, termClasses]) => {
          const termGpa = calculateGpa(termClasses);
          return (
            <YStack key={term} gap="$2">
              <SectionHeader
                title={term}
                action={
                  <Text color="$color10" fontSize="$3">
                    {termGpa.gpa !== null ? `GPA ${termGpa.gpa.toFixed(2)}` : 'No grades yet'}
                  </Text>
                }
              />
              <YStack gap="$3">
                {termClasses.map((studiqClass) => (
                  <Card key={studiqClass.id} borderLeftWidth={4} style={{ borderLeftColor: studiqClass.color }}>
                    <Text fontWeight="700" fontSize="$5">
                      {studiqClass.name}
                    </Text>
                    <Paragraph color="$color10" fontSize="$3">
                      {studiqClass.code}
                    </Paragraph>

                    <XStack gap="$3" alignItems="center" paddingTop="$2">
                      <YStack gap="$1">
                        <Text color="$color10" fontSize="$2">
                          Credit hours
                        </Text>
                        <Input
                          width={70}
                          keyboardType="numeric"
                          value={studiqClass.creditHours?.toString() ?? ''}
                          onChangeText={(text) => {
                            const parsed = Number(text);
                            updateClass(studiqClass.id, {
                              creditHours: text.trim() === '' || Number.isNaN(parsed) ? undefined : parsed,
                            });
                          }}
                          placeholder="0"
                        />
                      </YStack>
                    </XStack>

                    <YStack gap="$1.5" paddingTop="$2">
                      <Text color="$color10" fontSize="$2">
                        Final grade
                      </Text>
                      <XStack flexWrap="wrap" gap="$1.5">
                        {LETTER_GRADES.map((grade) => (
                          <Button
                            key={grade}
                            size="$2"
                            theme={studiqClass.finalGrade === grade ? 'active' : undefined}
                            onPress={() =>
                              updateClass(studiqClass.id, {
                                finalGrade: studiqClass.finalGrade === grade ? undefined : (grade as LetterGrade),
                              })
                            }>
                            {grade}
                          </Button>
                        ))}
                      </XStack>
                    </YStack>
                  </Card>
                ))}
              </YStack>
            </YStack>
          );
        })
      )}

      <YStack gap="$2">
        <SectionHeader title="About this tracker" />
        <Card>
          <H3 fontSize="$4">Standard 4.0 scale</H3>
          <Paragraph color="$color10" fontSize="$3">
            GPA is credit-hour weighted (A=4.0, A-=3.7, B+=3.3, …, F=0.0). Only classes with both
            credit hours and a final grade set count toward the calculation.
          </Paragraph>
        </Card>
      </YStack>
    </Screen>
  );
}
