import { addDays, startOfDay, startOfWeek } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, ScrollView } from 'react-native';
import { Button, H3, Input, Label, Paragraph, Text, XStack, YStack } from 'tamagui';

import { Icon } from '@/src/components/Icon';
import { SelectableChip } from '@/src/components/SelectableChip';
import { createId } from '@/src/lib/id';
import { anchorMeetingTimes, combineDateAndTime } from '@/src/lib/time';
import { useScheduleStore } from '@/src/state/scheduleStore';
import { ACCENT_SOFT_BG, ACCENT_TINT, useThemeStore } from '@/src/state/themeStore';
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

/** 0=Monday..6=Sunday, matching RecurrenceRule.byWeekday. */
const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type DayOption = 'today' | 'tomorrow' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
const DAY_OPTIONS: { key: DayOption; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

export default function QuickAddModal() {
  const { day: initialDay } = useLocalSearchParams<{ day?: DayOption }>();
  const addEvent = useScheduleStore((state) => state.addEvent);
  const accentColor = useThemeStore((state) => state.accentColor);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('personal');
  const [dayOption, setDayOption] = useState<DayOption>(
    initialDay && DAY_OPTIONS.some((option) => option.key === initialDay) ? initialDay : 'today',
  );
  const [repeatsWeekly, setRepeatsWeekly] = useState(false);
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [color, setColor] = useState<string | undefined>(undefined);
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(10);
  const [error, setError] = useState<string | null>(null);

  const dayDates = useMemo(() => {
    const today = startOfDay(new Date());
    const monday = startOfWeek(today, { weekStartsOn: 1 });
    const dates: Record<DayOption, Date> = {
      today,
      tomorrow: addDays(today, 1),
      mon: monday,
      tue: addDays(monday, 1),
      wed: addDays(monday, 2),
      thu: addDays(monday, 3),
      fri: addDays(monday, 4),
      sat: addDays(monday, 5),
      sun: addDays(monday, 6),
    };
    return dates;
  }, []);

  function toggleRepeatDay(day: number) {
    setRepeatDays((current) => (current.includes(day) ? current.filter((d) => d !== day) : [...current, day].sort()));
  }

  function handleSave() {
    if (!title.trim()) {
      setError('Give it a title.');
      return;
    }

    if (repeatsWeekly) {
      if (repeatDays.length === 0) {
        setError('Pick at least one day it repeats on.');
        return;
      }
      const times = anchorMeetingTimes(startTime, endTime);
      if (!times) {
        setError('Enter start and end time like 2:30 PM.');
        return;
      }
      if (times.endsAt <= times.startsAt) {
        setError('End time must be after start time.');
        return;
      }
      addEvent({
        title: title.trim(),
        category,
        startsAt: times.startsAt.toISOString(),
        endsAt: times.endsAt.toISOString(),
        location: location.trim() || undefined,
        color,
        recurrence: { frequency: 'WEEKLY', byWeekday: repeatDays },
        reminders: reminderMinutes === null ? [] : [{ id: createId(), minutesBefore: reminderMinutes }],
      });
    } else {
      const startsAt = combineDateAndTime(dayDates[dayOption], startTime);
      const endsAt = combineDateAndTime(dayDates[dayOption], endTime);
      if (!startsAt || !endsAt) {
        setError('Enter start and end time like 2:30 PM.');
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
    }

    if (Platform.OS === 'web') {
      router.back();
    } else {
      Alert.alert('Added', `${title.trim()} was added to your schedule.`, [{ text: 'OK', onPress: () => router.back() }]);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <YStack flex={1} backgroundColor="$background" padding="$4" gap="$4">
        <YStack
          alignItems="center"
          gap="$1"
          borderRadius="$8"
          paddingVertical="$4"
          style={{ backgroundColor: ACCENT_SOFT_BG[accentColor] }}>
          <Icon name="bolt" size={26} color={ACCENT_TINT[accentColor]} />
          <H3 style={{ color: ACCENT_TINT[accentColor] }}>Quick add</H3>
        </YStack>

        <YStack gap="$2">
          <Label>Title</Label>
          <Input value={title} onChangeText={setTitle} placeholder="e.g. Study group" />
        </YStack>

        <YStack gap="$2">
          <Label>Category</Label>
          <XStack flexWrap="wrap" gap="$2">
            {CATEGORIES.map((option) => (
              <SelectableChip key={option} size="$3" selected={category === option} onPress={() => setCategory(option)}>
                {eventCategoryLabels[option]}
              </SelectableChip>
            ))}
          </XStack>
        </YStack>

        <YStack gap="$2">
          <Label>Repeats weekly?</Label>
          <XStack gap="$2">
            <SelectableChip size="$3" flex={1} selected={!repeatsWeekly} onPress={() => setRepeatsWeekly(false)}>
              One time
            </SelectableChip>
            <SelectableChip size="$3" flex={1} selected={repeatsWeekly} onPress={() => setRepeatsWeekly(true)}>
              Every week
            </SelectableChip>
          </XStack>
        </YStack>

        {repeatsWeekly ? (
          <YStack gap="$2">
            <Label>Repeats on</Label>
            <XStack flexWrap="wrap" gap="$2">
              {WEEKDAY_LABELS.map((label, index) => {
                const selected = repeatDays.includes(index);
                return (
                  <YStack
                    key={label}
                    minWidth={52}
                    paddingHorizontal="$3"
                    paddingVertical="$2.5"
                    borderRadius="$4"
                    alignItems="center"
                    justifyContent="center"
                    borderWidth={2}
                    borderColor="$borderColor"
                    onPress={() => toggleRepeatDay(index)}
                    pressStyle={{ opacity: 0.7 }}
                    style={selected ? { backgroundColor: `${ACCENT_TINT[accentColor]}33`, borderColor: ACCENT_TINT[accentColor] } : undefined}>
                    <Text fontWeight={selected ? '700' : '400'} color={selected ? '$color12' : '$color10'}>
                      {label}
                    </Text>
                  </YStack>
                );
              })}
            </XStack>
          </YStack>
        ) : (
          <YStack gap="$2">
            <Label>Which day</Label>
            <XStack flexWrap="wrap" gap="$2">
              {DAY_OPTIONS.map((option) => (
                <SelectableChip key={option.key} size="$3" selected={dayOption === option.key} onPress={() => setDayOption(option.key)}>
                  {option.label}
                </SelectableChip>
              ))}
            </XStack>
          </YStack>
        )}

        <XStack gap="$3">
          <YStack flex={1} gap="$2">
            <Label>Start time</Label>
            <Input value={startTime} onChangeText={setStartTime} placeholder="2:00 PM" autoCapitalize="characters" />
          </YStack>
          <YStack flex={1} gap="$2">
            <Label>End time</Label>
            <Input value={endTime} onChangeText={setEndTime} placeholder="3:00 PM" autoCapitalize="characters" />
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
              <SelectableChip
                key={option.label}
                size="$3"
                selected={reminderMinutes === option.minutesBefore}
                onPress={() => setReminderMinutes(option.minutesBefore)}>
                {option.label}
              </SelectableChip>
            ))}
          </XStack>
        </YStack>

        {error ? <Paragraph color="$red10">{error}</Paragraph> : null}

        <Button size="$4" theme="active" onPress={handleSave}>
          Add to schedule
        </Button>
      </YStack>
    </ScrollView>
  );
}
