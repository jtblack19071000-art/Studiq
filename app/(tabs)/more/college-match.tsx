import { useState } from 'react';
import { Button, H2, Input, Paragraph, Text, XStack, YStack } from 'tamagui';

import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import { useCollegeMatchStore } from '@/src/state/collegeMatchStore';
import {
  schoolApplicationStatusLabels,
  type SchoolApplicationStatus,
  type SchoolSizePreference,
} from '@/src/types';

const STATUSES = Object.keys(schoolApplicationStatusLabels) as SchoolApplicationStatus[];

const SIZE_OPTIONS: { value: SchoolSizePreference; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'no_preference', label: 'No preference' },
];

export default function CollegeMatchScreen() {
  const preferences = useCollegeMatchStore((state) => state.preferences);
  const setPreferences = useCollegeMatchStore((state) => state.setPreferences);
  const schools = useCollegeMatchStore((state) => state.schools);
  const addSchool = useCollegeMatchStore((state) => state.addSchool);
  const updateSchoolStatus = useCollegeMatchStore((state) => state.updateSchoolStatus);
  const removeSchool = useCollegeMatchStore((state) => state.removeSchool);

  const [name, setName] = useState('');
  const [program, setProgram] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleAddSchool() {
    if (!name.trim()) {
      setError('Give the school a name.');
      return;
    }
    setError(null);
    addSchool({
      name: name.trim(),
      program: program.trim() || undefined,
      deadline: deadline.trim() || undefined,
    });
    setName('');
    setProgram('');
    setDeadline('');
  }

  return (
    <Screen>
      <YStack gap="$1" paddingTop="$2">
        <H2>College Match</H2>
        <Paragraph color="$color10">
          Track your preferences and the schools or programs you&apos;re considering.
        </Paragraph>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Your preferences" />
        <Card gap="$3">
          <Input
            placeholder="Intended major"
            value={preferences.intendedMajor ?? ''}
            onChangeText={(text) => setPreferences({ intendedMajor: text })}
          />
          <Input
            placeholder="Location preference, e.g. Northeast, close to home"
            value={preferences.locationPreference ?? ''}
            onChangeText={(text) => setPreferences({ locationPreference: text })}
          />
          <XStack flexWrap="wrap" gap="$2">
            {SIZE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                size="$2"
                theme={preferences.sizePreference === option.value ? 'active' : undefined}
                onPress={() => setPreferences({ sizePreference: option.value })}>
                {option.label}
              </Button>
            ))}
          </XStack>
          <Input
            placeholder="Budget notes, e.g. need aid, in-state only"
            value={preferences.budgetNotes ?? ''}
            onChangeText={(text) => setPreferences({ budgetNotes: text })}
          />
        </Card>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Add a school" />
        <Card gap="$3">
          <Input placeholder="School name" value={name} onChangeText={setName} />
          <Input placeholder="Program (optional)" value={program} onChangeText={setProgram} />
          <Input placeholder="Application deadline (optional)" value={deadline} onChangeText={setDeadline} />
          {error ? <Paragraph color="$red10">{error}</Paragraph> : null}
          <Button theme="active" onPress={handleAddSchool}>
            Add school
          </Button>
        </Card>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Saved schools" />
        {schools.length === 0 ? (
          <Card>
            <EmptyState message="No schools saved yet." />
          </Card>
        ) : (
          <YStack gap="$3">
            {schools.map((school) => (
              <Card key={school.id}>
                <XStack justifyContent="space-between" alignItems="flex-start">
                  <YStack flex={1}>
                    <Text fontWeight="700" fontSize="$5">
                      {school.name}
                    </Text>
                    <Paragraph color="$color10" fontSize="$3">
                      {[school.program, school.deadline ? `Due ${school.deadline}` : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </Paragraph>
                  </YStack>
                  <Button size="$2" chromeless onPress={() => removeSchool(school.id)}>
                    Remove
                  </Button>
                </XStack>
                <XStack flexWrap="wrap" gap="$2" paddingTop="$2">
                  {STATUSES.map((status) => (
                    <Button
                      key={status}
                      size="$2"
                      theme={school.status === status ? 'active' : undefined}
                      onPress={() => updateSchoolStatus(school.id, status)}>
                      {schoolApplicationStatusLabels[status]}
                    </Button>
                  ))}
                </XStack>
              </Card>
            ))}
          </YStack>
        )}
      </YStack>
    </Screen>
  );
}
