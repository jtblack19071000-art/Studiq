import { useMemo, useState } from 'react';
import { Button, H2, Input, Paragraph, Text, XStack, YStack } from 'tamagui';

import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { Hero } from '@/src/components/Hero';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import { useGoalsStore } from '@/src/state/goalsStore';
import { ACCENT_TINT, useThemeStore } from '@/src/state/themeStore';
import { goalCategoryLabels, type Goal, type GoalCategory, type GoalStatus } from '@/src/types';

const CATEGORIES = Object.keys(goalCategoryLabels) as GoalCategory[];
const STATUSES: { value: GoalStatus; label: string }[] = [
  { value: 'not_started', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

function GoalCard({ goal }: { goal: Goal }) {
  const updateGoalStatus = useGoalsStore((state) => state.updateGoalStatus);
  const removeGoal = useGoalsStore((state) => state.removeGoal);

  return (
    <Card accentColor={goal.status === 'completed' ? '#4C9F4C' : '#8A8F98'}>
      <XStack justifyContent="space-between" alignItems="flex-start">
        <YStack flex={1}>
          <Text fontWeight="700" fontSize="$5">
            {goal.title}
          </Text>
          <Paragraph color="$color10" fontSize="$3">
            {goalCategoryLabels[goal.category]}
            {goal.targetTimeframe ? ` · ${goal.targetTimeframe}` : ''}
          </Paragraph>
        </YStack>
        <Button size="$2" chromeless onPress={() => removeGoal(goal.id)}>
          Remove
        </Button>
      </XStack>
      <XStack flexWrap="wrap" gap="$2" paddingTop="$2">
        {STATUSES.map((option) => (
          <Button
            key={option.value}
            size="$2"
            theme={goal.status === option.value ? 'active' : undefined}
            onPress={() => updateGoalStatus(goal.id, option.value)}>
            {option.label}
          </Button>
        ))}
      </XStack>
    </Card>
  );
}

export default function GoalsScreen() {
  const goals = useGoalsStore((state) => state.goals);
  const addGoal = useGoalsStore((state) => state.addGoal);
  const accentColor = useThemeStore((state) => state.accentColor);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>('academic');
  const [targetTimeframe, setTargetTimeframe] = useState('');
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(
    () => ({
      in_progress: goals.filter((g) => g.status === 'in_progress'),
      not_started: goals.filter((g) => g.status === 'not_started'),
      completed: goals.filter((g) => g.status === 'completed'),
    }),
    [goals],
  );

  function handleAdd() {
    if (!title.trim()) {
      setError('Give the goal a title.');
      return;
    }
    setError(null);
    addGoal({ title: title.trim(), category, targetTimeframe: targetTimeframe.trim() || undefined });
    setTitle('');
    setTargetTimeframe('');
  }

  return (
    <Screen>
      <YStack gap="$1" paddingTop="$2">
        <H2>🎯 Goals</H2>
      </YStack>

      <Hero logo flexDirection="row" gap="$2">
        <YStack alignItems="center" flex={1}>
          <Text fontWeight="800" fontSize="$8" style={{ color: ACCENT_TINT[accentColor] }}>
            {grouped.in_progress.length}
          </Text>
          <Text color="$color10" fontSize="$2">
            🚀 In progress
          </Text>
        </YStack>
        <YStack alignItems="center" flex={1}>
          <Text fontWeight="800" fontSize="$8" style={{ color: ACCENT_TINT[accentColor] }}>
            {grouped.not_started.length}
          </Text>
          <Text color="$color10" fontSize="$2">
            🗓️ Not started
          </Text>
        </YStack>
        <YStack alignItems="center" flex={1}>
          <Text fontWeight="800" fontSize="$8" style={{ color: ACCENT_TINT[accentColor] }}>
            {grouped.completed.length}
          </Text>
          <Text color="$color10" fontSize="$2">
            ✅ Completed
          </Text>
        </YStack>
      </Hero>

      <YStack gap="$2">
        <SectionHeader title="Add goal" emoji="➕" />
        <Card gap="$3">
          <Input placeholder="What do you want to accomplish?" value={title} onChangeText={setTitle} />
          <Input
            placeholder="Target timeframe (optional), e.g. by finals"
            value={targetTimeframe}
            onChangeText={setTargetTimeframe}
          />
          <XStack flexWrap="wrap" gap="$2">
            {CATEGORIES.map((option) => (
              <Button
                key={option}
                size="$2"
                theme={category === option ? 'active' : undefined}
                onPress={() => setCategory(option)}>
                {goalCategoryLabels[option]}
              </Button>
            ))}
          </XStack>
          {error ? <Paragraph color="$red10">{error}</Paragraph> : null}
          <Button theme="active" onPress={handleAdd}>
            Add goal
          </Button>
        </Card>
      </YStack>

      {goals.length === 0 ? (
        <EmptyState emoji="🎯" message="No goals yet." />
      ) : (
        <>
          <YStack gap="$2">
            <SectionHeader title="In progress" emoji="🚀" />
            {grouped.in_progress.length === 0 ? (
              <Card>
                <EmptyState message="Nothing in progress." />
              </Card>
            ) : (
              <YStack gap="$3">
                {grouped.in_progress.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </YStack>
            )}
          </YStack>

          <YStack gap="$2">
            <SectionHeader title="Not started" emoji="🗓️" />
            {grouped.not_started.length === 0 ? (
              <Card>
                <EmptyState message="Nothing here." />
              </Card>
            ) : (
              <YStack gap="$3">
                {grouped.not_started.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </YStack>
            )}
          </YStack>

          <YStack gap="$2">
            <SectionHeader title="Completed" emoji="✅" />
            {grouped.completed.length === 0 ? (
              <Card>
                <EmptyState message="Nothing completed yet." />
              </Card>
            ) : (
              <YStack gap="$3">
                {grouped.completed.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </YStack>
            )}
          </YStack>
        </>
      )}
    </Screen>
  );
}
