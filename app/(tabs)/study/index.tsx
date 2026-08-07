import { router } from 'expo-router';
import { H1, Paragraph, Text, XStack, YStack } from 'tamagui';

import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { Hero } from '@/src/components/Hero';
import { Icon } from '@/src/components/Icon';
import { Screen } from '@/src/components/Screen';
import { useClassesStore } from '@/src/state/classesStore';
import { useStudyStore } from '@/src/state/studyStore';
import { ACCENT_TINT, useThemeStore } from '@/src/state/themeStore';

export default function StudyScreen() {
  const courses = useStudyStore((state) => state.courses);
  const units = useStudyStore((state) => state.units);
  const classes = useClassesStore((state) => state.classes);
  const accentColor = useThemeStore((state) => state.accentColor);

  return (
    <Screen>
      <YStack gap="$1" paddingTop="$2">
        <XStack alignItems="center" gap="$2">
          <Icon name="mic" size={26} color={ACCENT_TINT[accentColor]} />
          <H1 fontSize="$9">Study</H1>
        </XStack>
        <Paragraph color="$color10">
          Record lectures by unit, then generate a study guide from everything in that unit.
        </Paragraph>
      </YStack>

      {courses.length > 0 ? (
        <Hero logo alignItems="center" gap="$1" paddingVertical="$5">
          <Icon name="sparkle" size={30} color={ACCENT_TINT[accentColor]} />
          <Text fontWeight="800" fontSize="$6" style={{ color: ACCENT_TINT[accentColor] }}>
            {courses.length} course{courses.length === 1 ? '' : 's'} · {units.length} unit{units.length === 1 ? '' : 's'}
          </Text>
        </Hero>
      ) : null}

      {courses.length === 0 ? (
        <EmptyState icon="book" message="Open a class and tap 'Open Study workspace' to get started." />
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
                <XStack alignItems="center" gap="$1.5">
                  <Icon name="book" size={14} color="#8A8F98" />
                  <Paragraph color="$color10">
                    {unitCount} unit{unitCount === 1 ? '' : 's'}
                  </Paragraph>
                </XStack>
              </Card>
            );
          })}
        </YStack>
      )}
    </Screen>
  );
}
