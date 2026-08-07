import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Button, H2, H3, Input, Label, Paragraph, Text, XStack, YStack } from 'tamagui';

import { Card } from '@/src/components/Card';
import { Icon, type IconName } from '@/src/components/Icon';
import { PremiumGate } from '@/src/components/PremiumGate';
import { Screen } from '@/src/components/Screen';
import { createId } from '@/src/lib/id';
import { importSyllabus, SyllabusAiError, type SyllabusImportResult, type SyllabusItem } from '@/src/lib/syllabusAi';
import { parseFlexibleDate, parseTimeToday } from '@/src/lib/time';
import { useClassesStore } from '@/src/state/classesStore';
import { useScheduleStore } from '@/src/state/scheduleStore';
import { EVENT_COLOR_SWATCHES, type ExamType } from '@/src/types';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type ItemKind = 'assignment' | 'exam' | 'reading' | 'project';

interface ReviewItem {
  id: string;
  kind: ItemKind;
  title: string;
  dateText: string;
  included: boolean;
}

const KIND_INFO: Record<ItemKind, { icon: IconName; label: string }> = {
  assignment: { icon: 'pin', label: 'Assignment' },
  exam: { icon: 'flask', label: 'Exam' },
  reading: { icon: 'book-open', label: 'Reading' },
  project: { icon: 'tool', label: 'Project' },
};

function itemsFromResult(result: SyllabusImportResult): ReviewItem[] {
  function convert(kind: ItemKind, items: SyllabusItem[]): ReviewItem[] {
    return items.map((item) => ({
      id: createId(),
      kind,
      title: item.title,
      dateText: item.dateLabel ?? '',
      included: true,
    }));
  }
  return [
    ...convert('exam', result.exams),
    ...convert('assignment', result.assignments),
    ...convert('project', result.projects),
    ...convert('reading', result.readings),
  ];
}

function examTypeFromTitle(title: string): ExamType {
  const lower = title.toLowerCase();
  if (lower.includes('final')) return 'final';
  if (lower.includes('midterm')) return 'midterm';
  if (lower.includes('quiz')) return 'quiz';
  return 'other';
}

export default function ImportSyllabusScreen() {
  return (
    <Screen>
      <YStack gap="$1" paddingTop="$2">
        <XStack alignItems="flex-start" gap="$2">
          <Icon name="upload" size={22} color="#3B6FE0" />
          <H2>Import syllabus</H2>
        </XStack>
        <Paragraph color="$color10">
          Upload a PDF or photo of your syllabus — AI reads it and builds the class, assignments,
          and exams for you.
        </Paragraph>
      </YStack>
      <PremiumGate>
        <ImportFlow />
      </PremiumGate>
    </Screen>
  );
}

function ImportFlow() {
  const addClass = useClassesStore((state) => state.addClass);
  const addAssignment = useClassesStore((state) => state.addAssignment);
  const addExam = useClassesStore((state) => state.addExam);
  const addEvent = useScheduleStore((state) => state.addEvent);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SyllabusImportResult | null>(null);
  const [items, setItems] = useState<ReviewItem[]>([]);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [term, setTerm] = useState('');
  const [professorName, setProfessorName] = useState('');
  const [classroom, setClassroom] = useState('');
  const [color, setColor] = useState(EVENT_COLOR_SWATCHES[0]);
  const [byWeekday, setByWeekday] = useState<number[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  async function handlePickFile() {
    setError(null);
    const picked = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      multiple: false,
    });
    if (picked.canceled || !picked.assets?.[0]) return;

    const asset = picked.assets[0];
    setLoading(true);
    try {
      const imported = await importSyllabus(asset.uri, asset.name, asset.mimeType ?? 'application/pdf');
      setResult(imported);
      setItems(itemsFromResult(imported));
      setName(imported.className ?? '');
      setCode(imported.courseCode ?? '');
      setTerm(imported.term ?? '');
      setProfessorName(imported.professorName ?? '');
      setClassroom(imported.classroom ?? '');
      setStartTime(imported.meetingStartTime ?? '');
      setEndTime(imported.meetingEndTime ?? '');
      if (imported.meetingDays) {
        setByWeekday(imported.meetingDays.map((day) => WEEKDAY_LABELS.indexOf(day)).filter((index) => index >= 0));
      }
    } catch (err) {
      setError(err instanceof SyllabusAiError ? err.message : 'Could not read that syllabus.');
    } finally {
      setLoading(false);
    }
  }

  function toggleWeekday(day: number) {
    setByWeekday((current) => (current.includes(day) ? current.filter((d) => d !== day) : [...current, day].sort()));
  }

  function toggleItem(id: string) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, included: !item.included } : item)));
  }

  function updateItem(id: string, patch: Partial<Pick<ReviewItem, 'title' | 'dateText'>>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function handleImport() {
    if (!name.trim()) {
      setError('Give the class a name before importing.');
      return;
    }
    setError(null);

    const createdClass = addClass({
      name: name.trim(),
      code: code.trim(),
      color,
      term: term.trim() || 'This term',
      classroom: classroom.trim() || undefined,
      professor: { name: professorName.trim() || 'TBD' },
    });

    if (byWeekday.length > 0) {
      const parsedStart = parseTimeToday(startTime);
      const parsedEnd = parseTimeToday(endTime);
      if (parsedStart && parsedEnd && parsedEnd > parsedStart) {
        addEvent({
          title: createdClass.name,
          category: 'class',
          classId: createdClass.id,
          startsAt: parsedStart.toISOString(),
          endsAt: parsedEnd.toISOString(),
          location: createdClass.classroom,
          recurrence: { frequency: 'WEEKLY', byWeekday },
          reminders: [{ id: createId(), minutesBefore: 10 }],
        });
      }
    }

    let skipped = 0;
    for (const item of items) {
      if (!item.included) continue;
      const date = parseFlexibleDate(item.dateText, item.kind === 'exam' ? 10 : 23);
      if (!date) {
        skipped += 1;
        continue;
      }
      if (item.kind === 'exam') {
        addExam({ classId: createdClass.id, title: item.title, type: examTypeFromTitle(item.title), date: date.toISOString() });
      } else {
        const prefix = item.kind === 'reading' ? 'Reading: ' : item.kind === 'project' ? 'Project: ' : '';
        addAssignment({
          classId: createdClass.id,
          title: `${prefix}${item.title}`,
          dueAt: date.toISOString(),
          status: 'not_started',
        });
      }
    }

    if (skipped > 0) {
      setError(`Imported the class, but ${skipped} item${skipped === 1 ? '' : 's'} had no clear date — add ${skipped === 1 ? 'it' : 'them'} manually.`);
    }

    router.replace(`/schedule/classes/${createdClass.id}`);
  }

  if (!result) {
    return (
      <YStack gap="$3">
        <Card gap="$3" alignItems="center" paddingVertical="$6">
          <Icon name="upload" size={40} color="#3B6FE0" />
          <Button size="$4" theme="active" borderRadius="$10" onPress={handlePickFile} disabled={loading}>
            {loading ? 'Reading syllabus…' : 'Select syllabus (PDF or photo)'}
          </Button>
        </Card>
        {error ? <Text color="$red10">{error}</Text> : null}
      </YStack>
    );
  }

  return (
    <YStack gap="$4">
      <Card gap="$3">
        <H3 fontSize="$5">Class details</H3>
        <Input value={name} onChangeText={setName} placeholder="Class name" />
        <XStack gap="$3">
          <Input flex={1} value={code} onChangeText={setCode} placeholder="Course code" />
          <Input flex={1} value={term} onChangeText={setTerm} placeholder="Term" />
        </XStack>
        <XStack gap="$3">
          <Input flex={1} value={professorName} onChangeText={setProfessorName} placeholder="Professor" />
          <Input flex={1} value={classroom} onChangeText={setClassroom} placeholder="Classroom" />
        </XStack>
        <XStack flexWrap="wrap" gap="$2">
          {EVENT_COLOR_SWATCHES.map((swatch) => (
            <YStack
              key={swatch}
              width={28}
              height={28}
              borderRadius={14}
              borderWidth={color === swatch ? 3 : 0}
              borderColor="$color12"
              onPress={() => setColor(swatch)}
              pressStyle={{ opacity: 0.7 }}
              style={{ backgroundColor: swatch }}
            />
          ))}
        </XStack>
      </Card>

      <Card gap="$3">
        <H3 fontSize="$5">Meeting time (optional)</H3>
        <XStack flexWrap="wrap" gap="$2">
          {WEEKDAY_LABELS.map((label, index) => {
            const selected = byWeekday.includes(index);
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
                onPress={() => toggleWeekday(index)}
                pressStyle={{ opacity: 0.7 }}
                style={selected ? { backgroundColor: `${color}33`, borderColor: color } : undefined}>
                <Text fontWeight={selected ? '700' : '400'} color={selected ? '$color12' : '$color10'}>
                  {label}
                </Text>
              </YStack>
            );
          })}
        </XStack>
        <XStack gap="$3">
          <Input flex={1} value={startTime} onChangeText={setStartTime} placeholder="Start, e.g. 1:30 PM" />
          <Input flex={1} value={endTime} onChangeText={setEndTime} placeholder="End, e.g. 2:20 PM" />
        </XStack>
      </Card>

      <YStack gap="$2">
        <H3 fontSize="$5">
          Found {items.length} item{items.length === 1 ? '' : 's'} — uncheck anything you don&apos;t want
        </H3>
        {items.map((item) => (
          <Card key={item.id} gap="$2" opacity={item.included ? 1 : 0.5}>
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" gap="$1.5">
                <Icon name={KIND_INFO[item.kind].icon} size={13} color="#8A8F98" />
                <Text fontSize="$2" color="$color10">
                  {KIND_INFO[item.kind].label}
                </Text>
              </XStack>
              <Button
                size="$2"
                chromeless
                onPress={() => toggleItem(item.id)}
                icon={item.included ? <Icon name="check" size={13} color="#4C9F4C" /> : undefined}>
                {item.included ? 'Included' : 'Excluded'}
              </Button>
            </XStack>
            <Input value={item.title} onChangeText={(text) => updateItem(item.id, { title: text })} />
            <YStack gap="$1">
              <Label fontSize="$2">Date</Label>
              <Input
                value={item.dateText}
                onChangeText={(text) => updateItem(item.id, { dateText: text })}
                placeholder="e.g. Feb 14, 2026 — blank items are skipped"
              />
            </YStack>
          </Card>
        ))}
      </YStack>

      {error ? <Text color="$red10">{error}</Text> : null}

      <Button
        size="$4"
        theme="active"
        borderRadius="$10"
        onPress={handleImport}
        icon={<Icon name="plus" size={16} color="white" />}>
        Import class
      </Button>
    </YStack>
  );
}
