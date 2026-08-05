import { useState } from 'react';
import { Button, H2, Input, Paragraph, Text, XStack, YStack } from 'tamagui';

import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { Hero } from '@/src/components/Hero';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import { generateCollegeMatchGuidance, CollegeMatchAiError, type CollegeMatchGuidance } from '@/src/lib/collegeMatchAi';
import { useCollegeMatchStore } from '@/src/state/collegeMatchStore';
import { ACCENT_TINT, useThemeStore } from '@/src/state/themeStore';
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
  const accentColor = useThemeStore((state) => state.accentColor);

  const [name, setName] = useState('');
  const [program, setProgram] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [guidance, setGuidance] = useState<CollegeMatchGuidance | null>(null);
  const [guidanceLoading, setGuidanceLoading] = useState(false);
  const [guidanceError, setGuidanceError] = useState<string | null>(null);

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

  async function handleGetGuidance() {
    setGuidanceError(null);
    setGuidanceLoading(true);
    try {
      const result = await generateCollegeMatchGuidance(preferences, schools);
      setGuidance(result);
    } catch (err) {
      setGuidanceError(err instanceof CollegeMatchAiError ? err.message : 'Could not get guidance.');
    } finally {
      setGuidanceLoading(false);
    }
  }

  return (
    <Screen>
      <YStack gap="$1" paddingTop="$2">
        <H2>🏫 College Match</H2>
        <Paragraph color="$color10">
          An AI-guided best-fit quiz — not a database match, since there isn&apos;t one, but honest
          reasoning over your own preferences. Free for everyone, prospective students included.
        </Paragraph>
      </YStack>

      <Hero logo alignItems="center" gap="$1" paddingVertical="$5">
        <Text fontSize={36}>🧭</Text>
        <Text fontWeight="800" fontSize="$6" style={{ color: ACCENT_TINT[accentColor] }}>
          {schools.length} school{schools.length === 1 ? '' : 's'} saved
        </Text>
        <Paragraph color="$color10" fontSize="$3">
          Always free — no account or Premium required.
        </Paragraph>
      </Hero>

      <YStack gap="$4">
        <YStack gap="$2">
          <SectionHeader title="Your preferences" emoji="🧑‍🎓" />
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
          <SectionHeader title="Add a school" emoji="➕" />
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
          <SectionHeader title="Saved schools" emoji="🏫" />
          {schools.length === 0 ? (
            <Card>
              <EmptyState emoji="🏫" message="No schools saved yet." />
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

        <YStack gap="$2">
          <SectionHeader title="AI best-fit guidance" emoji="✨" />
          <Button theme="active" onPress={handleGetGuidance} disabled={guidanceLoading}>
            {guidanceLoading ? 'Thinking…' : 'Get AI guidance'}
          </Button>
          {guidanceError ? <Paragraph color="$red10">{guidanceError}</Paragraph> : null}
          {guidance ? (
            <YStack gap="$3">
              <Card>
                <Paragraph>{guidance.fitSummary}</Paragraph>
              </Card>
              {guidance.thingsToLookFor.length > 0 ? (
                <Card>
                  <Text fontWeight="600">Things to look for</Text>
                  {guidance.thingsToLookFor.map((item, index) => (
                    <Text key={index}>• {item}</Text>
                  ))}
                </Card>
              ) : null}
              {guidance.questionsToAsk.length > 0 ? (
                <Card>
                  <Text fontWeight="600">Questions to ask</Text>
                  {guidance.questionsToAsk.map((item, index) => (
                    <Text key={index}>• {item}</Text>
                  ))}
                </Card>
              ) : null}
              {guidance.perSchoolNotes.length > 0 ? (
                <Card>
                  <Text fontWeight="600">Per-school notes</Text>
                  {guidance.perSchoolNotes.map((entry, index) => (
                    <YStack key={index} paddingVertical="$1.5">
                      <Text fontWeight="600">{entry.school}</Text>
                      <Paragraph color="$color10" fontSize="$3">
                        {entry.note}
                      </Paragraph>
                    </YStack>
                  ))}
                </Card>
              ) : null}
            </YStack>
          ) : null}
        </YStack>
      </YStack>
    </Screen>
  );
}
