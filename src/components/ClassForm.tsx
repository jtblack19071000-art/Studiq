import { useState } from 'react';
import { Button, H3, Input, Label, Paragraph, Text, XStack, YStack } from 'tamagui';

import { parseTimeToday } from '@/src/lib/time';
import { EVENT_COLOR_SWATCHES } from '@/src/types';
import type { StudiqClass } from '@/src/types';

/** 0=Monday..6=Sunday, matching RecurrenceRule.byWeekday. */
const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export interface ClassMeetingTime {
  byWeekday: number[];
  /** "HH:mm" in local time. */
  startTime: string;
  /** "HH:mm" in local time. */
  endTime: string;
}

export interface ClassFormResult {
  classInput: Omit<StudiqClass, 'id'>;
  /** null means "no fixed meeting time" — any previously-linked schedule event should be removed. */
  meeting: ClassMeetingTime | null;
}

interface ClassFormProps {
  initialClass?: StudiqClass;
  initialMeeting?: ClassMeetingTime;
  submitLabel: string;
  onSubmit: (result: ClassFormResult) => void;
}

export function ClassForm({ initialClass, initialMeeting, submitLabel, onSubmit }: ClassFormProps) {
  const [name, setName] = useState(initialClass?.name ?? '');
  const [code, setCode] = useState(initialClass?.code ?? '');
  const [term, setTerm] = useState(initialClass?.term ?? '');
  const [color, setColor] = useState(initialClass?.color ?? EVENT_COLOR_SWATCHES[0]);
  const [creditHours, setCreditHours] = useState(initialClass?.creditHours?.toString() ?? '');
  const [professorName, setProfessorName] = useState(initialClass?.professor.name ?? '');
  const [professorEmail, setProfessorEmail] = useState(initialClass?.professor.email ?? '');
  const [officeLocation, setOfficeLocation] = useState(initialClass?.professor.officeLocation ?? '');
  const [officeHours, setOfficeHours] = useState(initialClass?.professor.officeHours ?? '');
  const [classroom, setClassroom] = useState(initialClass?.classroom ?? '');
  const [byWeekday, setByWeekday] = useState<number[]>(initialMeeting?.byWeekday ?? []);
  const [startTime, setStartTime] = useState(initialMeeting?.startTime ?? '');
  const [endTime, setEndTime] = useState(initialMeeting?.endTime ?? '');
  const [error, setError] = useState<string | null>(null);

  function toggleWeekday(day: number) {
    setByWeekday((current) => (current.includes(day) ? current.filter((d) => d !== day) : [...current, day].sort()));
  }

  function handleSubmit() {
    if (!name.trim()) {
      setError('Give the class a name.');
      return;
    }
    if (!term.trim()) {
      setError('Enter a term, e.g. "Fall 2026".');
      return;
    }

    let meeting: ClassMeetingTime | null = null;
    if (byWeekday.length > 0 || startTime.trim() || endTime.trim()) {
      if (byWeekday.length === 0) {
        setError('Pick at least one meeting day, or clear the meeting time fields entirely.');
        return;
      }
      const parsedStart = parseTimeToday(startTime);
      const parsedEnd = parseTimeToday(endTime);
      if (!parsedStart || !parsedEnd) {
        setError('Enter meeting start and end time as HH:mm, e.g. 09:00.');
        return;
      }
      if (parsedEnd <= parsedStart) {
        setError('Meeting end time must be after the start time.');
        return;
      }
      meeting = { byWeekday, startTime: startTime.trim(), endTime: endTime.trim() };
    }

    setError(null);
    const parsedCreditHours = Number(creditHours);
    onSubmit({
      classInput: {
        name: name.trim(),
        code: code.trim(),
        color,
        term: term.trim(),
        classroom: classroom.trim() || undefined,
        creditHours: creditHours.trim() === '' || Number.isNaN(parsedCreditHours) ? undefined : parsedCreditHours,
        professor: {
          name: professorName.trim() || 'TBD',
          email: professorEmail.trim() || undefined,
          officeLocation: officeLocation.trim() || undefined,
          officeHours: officeHours.trim() || undefined,
        },
        finalGrade: initialClass?.finalGrade,
        studyCourseId: initialClass?.studyCourseId,
      },
      meeting,
    });
  }

  return (
    <YStack gap="$4">
      <YStack gap="$2">
        <Label>Class name</Label>
        <Input value={name} onChangeText={setName} placeholder="e.g. Organic Chemistry II" />
      </YStack>

      <XStack gap="$3">
        <YStack flex={1} gap="$2">
          <Label>Course code</Label>
          <Input value={code} onChangeText={setCode} placeholder="e.g. CHEM 232" />
        </YStack>
        <YStack flex={1} gap="$2">
          <Label>Term</Label>
          <Input value={term} onChangeText={setTerm} placeholder="e.g. Fall 2026" />
        </YStack>
      </XStack>

      <XStack gap="$3">
        <YStack flex={1} gap="$2">
          <Label>Classroom</Label>
          <Input value={classroom} onChangeText={setClassroom} placeholder="e.g. Chem Bldg 118" />
        </YStack>
        <YStack width={90} gap="$2">
          <Label>Credit hrs</Label>
          <Input value={creditHours} onChangeText={setCreditHours} keyboardType="numeric" placeholder="3" />
        </YStack>
      </XStack>

      <YStack gap="$2">
        <Label>Color</Label>
        <XStack flexWrap="wrap" gap="$2">
          {EVENT_COLOR_SWATCHES.map((swatch) => (
            <YStack
              key={swatch}
              width={32}
              height={32}
              borderRadius={16}
              borderWidth={color === swatch ? 3 : 0}
              borderColor="$color12"
              onPress={() => setColor(swatch)}
              pressStyle={{ opacity: 0.7 }}
              style={{ backgroundColor: swatch }}
            />
          ))}
        </XStack>
      </YStack>

      <YStack gap="$3">
        <H3 fontSize="$5">Professor</H3>
        <YStack gap="$2">
          <Label>Name</Label>
          <Input value={professorName} onChangeText={setProfessorName} placeholder="e.g. Dr. Amara Lindqvist" />
        </YStack>
        <YStack gap="$2">
          <Label>Email (optional)</Label>
          <Input
            value={professorEmail}
            onChangeText={setProfessorEmail}
            placeholder="e.g. lindqvist@university.edu"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </YStack>
        <XStack gap="$3">
          <YStack flex={1} gap="$2">
            <Label>Office (optional)</Label>
            <Input value={officeLocation} onChangeText={setOfficeLocation} placeholder="e.g. Chem Bldg 214" />
          </YStack>
          <YStack flex={1} gap="$2">
            <Label>Office hours (optional)</Label>
            <Input value={officeHours} onChangeText={setOfficeHours} placeholder="e.g. Tue/Thu 2–3:30 PM" />
          </YStack>
        </XStack>
      </YStack>

      <YStack gap="$3">
        <H3 fontSize="$5">Meeting time</H3>
        <Paragraph color="$color10" fontSize="$3">
          Set this once and it automatically shows up on your Schedule every week this term. Leave it blank for
          classes with no fixed meeting time.
        </Paragraph>
        <XStack flexWrap="wrap" gap="$2">
          {WEEKDAY_LABELS.map((label, index) => (
            <Button
              key={label}
              size="$3"
              width={54}
              theme={byWeekday.includes(index) ? 'active' : undefined}
              onPress={() => toggleWeekday(index)}>
              {label}
            </Button>
          ))}
        </XStack>
        <XStack gap="$3">
          <YStack flex={1} gap="$2">
            <Label>Start (HH:mm)</Label>
            <Input value={startTime} onChangeText={setStartTime} placeholder="09:00" keyboardType="numbers-and-punctuation" />
          </YStack>
          <YStack flex={1} gap="$2">
            <Label>End (HH:mm)</Label>
            <Input value={endTime} onChangeText={setEndTime} placeholder="09:50" keyboardType="numbers-and-punctuation" />
          </YStack>
        </XStack>
      </YStack>

      {error ? <Text color="$red10">{error}</Text> : null}

      <Button size="$4" theme="active" onPress={handleSubmit}>
        {submitLabel}
      </Button>
    </YStack>
  );
}
