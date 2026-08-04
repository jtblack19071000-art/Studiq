import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { Button, H3, Input, Label, Paragraph, XStack, YStack } from 'tamagui';

import { createId } from '@/src/lib/id';
import { parseTimeToday } from '@/src/lib/time';
import { useScheduleStore } from '@/src/state/scheduleStore';
import { EVENT_COLOR_SWATCHES, eventCategoryLabels, type EventCategory } from '@/src/types';

const CATEGORIES = Object.keys(eventCategoryLabels) as EventCategory[];

const REMINDER_OPTIONS: { label: string; minutesBefore: number | null }[] = [
  { label: 'None', minutesBefore: null },
  { label: '5 min before', minutesBefore: 5 },
  { label: '10 min before', minutesBefore: 10 },
  { label: '30 min before', minutesBefore: 30 },
  { label: '1 hour before', minutesBefore: 60 },
  { label: '1 day before', minutesBefore: 60 * 24 },
];

export default function QuickAddModal() {
  const addEvent = useScheduleStore((state) => state.addEvent);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('personal');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [color, setColor] = useState<string | undefined>(undefined);
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(10);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    if (!title.trim()) {
      setError('Give it a title.');
      return;
    }
    const startsAt = parseTimeToday(startTime);
    const endsAt = parseTimeToday(endTime);
    if (!startsAt || !endsAt) {
      setError('Enter start and end time as HH:mm, e.g. 14:30.');
      return;
    }
    if (endsAt <= startsAt) {
      setError('End time must be after start time.');
      return;
    }

    addEvent({
      title: title.trim(),
      category,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      location: location.trim() || undefined,
      color,
      reminders: reminderMinutes === null ? [] : [{ id: createId(), minutesBefore: reminderMinutes }],
    });

    if (Platform.OS === 'web') {
      router.back();
    } else {
      Alert.alert('Added', `${title.trim()} was added to today's schedule.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  }

  return (
    <YStack flex={1} backgroundColor="$background" padding="$4" gap="$4">
      <H3>Quick add</H3>

      <YStack gap="$2">
        <Label>Title</Label>
        <Input value={title} onChangeText={setTitle} placeholder="e.g. Study group" />
      </YStack>

      <YStack gap="$2">
        <Label>Category</Label>
        <XStack flexWrap="wrap" gap="$2">
          {CATEGORIES.map((option) => (
            <Button
              key={option}
              size="$3"
              theme={category === option ? 'active' : undefined}
              onPress={() => setCategory(option)}>
              {eventCategoryLabels[option]}
            </Button>
          ))}
        </XStack>
      </YStack>

      <XStack gap="$3">
        <YStack flex={1} gap="$2">
          <Label>Start (HH:mm)</Label>
          <Input value={startTime} onChangeText={setStartTime} placeholder="14:00" keyboardType="numbers-and-punctuation" />
        </YStack>
        <YStack flex={1} gap="$2">
          <Label>End (HH:mm)</Label>
          <Input value={endTime} onChangeText={setEndTime} placeholder="15:00" keyboardType="numbers-and-punctuation" />
        </YStack>
      </XStack>

      <YStack gap="$2">
        <Label>Location (optional)</Label>
        <Input value={location} onChangeText={setLocation} placeholder="e.g. Library room 3B" />
      </YStack>

      <YStack gap="$2">
        <Label>Color (optional — defaults to the category color)</Label>
        <XStack flexWrap="wrap" gap="$2">
          {EVENT_COLOR_SWATCHES.map((swatch) => (
            <YStack
              key={swatch}
              width={32}
              height={32}
              borderRadius={16}
              borderWidth={color === swatch ? 3 : 0}
              borderColor="$color12"
              onPress={() => setColor(color === swatch ? undefined : swatch)}
              pressStyle={{ opacity: 0.7 }}
              style={{ backgroundColor: swatch }}
            />
          ))}
        </XStack>
      </YStack>

      <YStack gap="$2">
        <Label>Reminder</Label>
        <XStack flexWrap="wrap" gap="$2">
          {REMINDER_OPTIONS.map((option) => (
            <Button
              key={option.label}
              size="$3"
              theme={reminderMinutes === option.minutesBefore ? 'active' : undefined}
              onPress={() => setReminderMinutes(option.minutesBefore)}>
              {option.label}
            </Button>
          ))}
        </XStack>
      </YStack>

      {error ? <Paragraph color="$red10">{error}</Paragraph> : null}

      <Button size="$4" theme="active" onPress={handleSave}>
        Add to today
      </Button>
    </YStack>
  );
}
