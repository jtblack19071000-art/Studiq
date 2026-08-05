import { useState } from 'react';
import { Button, H2, Input, Paragraph, Text, XStack, YStack } from 'tamagui';

import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import { useCareerStore } from '@/src/state/careerStore';
import { ACCENT_SOFT_BG, ACCENT_TINT, useThemeStore } from '@/src/state/themeStore';
import { applicationStatusLabels, type ApplicationStatus } from '@/src/types';

const STATUSES = Object.keys(applicationStatusLabels) as ApplicationStatus[];

export default function CareerScreen() {
  const applications = useCareerStore((state) => state.applications);
  const addApplication = useCareerStore((state) => state.addApplication);
  const updateApplicationStatus = useCareerStore((state) => state.updateApplicationStatus);
  const removeApplication = useCareerStore((state) => state.removeApplication);
  const accentColor = useThemeStore((state) => state.accentColor);
  const activeCount = applications.filter((a) => a.status !== 'rejected' && a.status !== 'offer').length;
  const offerCount = applications.filter((a) => a.status === 'offer').length;

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleAdd() {
    if (!company.trim() || !role.trim()) {
      setError('Add both a company and a role.');
      return;
    }
    setError(null);
    addApplication({ company: company.trim(), role: role.trim() });
    setCompany('');
    setRole('');
  }

  return (
    <Screen>
      <YStack gap="$1" paddingTop="$2">
        <H2>💼 Career Hub</H2>
        <Paragraph color="$color10">Track internship and job applications from saved to offer.</Paragraph>
      </YStack>

      <XStack
        gap="$2"
        borderRadius="$8"
        padding="$5"
        style={{ backgroundColor: ACCENT_SOFT_BG[accentColor] }}>
        <YStack alignItems="center" flex={1}>
          <Text fontWeight="800" fontSize="$8" style={{ color: ACCENT_TINT[accentColor] }}>
            {applications.length}
          </Text>
          <Text color="$color10" fontSize="$2">
            📋 Total
          </Text>
        </YStack>
        <YStack alignItems="center" flex={1}>
          <Text fontWeight="800" fontSize="$8" style={{ color: ACCENT_TINT[accentColor] }}>
            {activeCount}
          </Text>
          <Text color="$color10" fontSize="$2">
            🚀 Active
          </Text>
        </YStack>
        <YStack alignItems="center" flex={1}>
          <Text fontWeight="800" fontSize="$8" style={{ color: ACCENT_TINT[accentColor] }}>
            {offerCount}
          </Text>
          <Text color="$color10" fontSize="$2">
            🎉 Offers
          </Text>
        </YStack>
      </XStack>

      <YStack gap="$2">
        <SectionHeader title="Add application" emoji="➕" />
        <Card gap="$3">
          <Input placeholder="Company" value={company} onChangeText={setCompany} />
          <Input placeholder="Role" value={role} onChangeText={setRole} />
          {error ? <Paragraph color="$red10">{error}</Paragraph> : null}
          <Button theme="active" onPress={handleAdd}>
            Add application
          </Button>
        </Card>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Applications" emoji="📋" />
        {applications.length === 0 ? (
          <Card>
            <EmptyState emoji="💼" message="No applications tracked yet." />
          </Card>
        ) : (
          <YStack gap="$3">
            {applications.map((application) => (
              <Card key={application.id}>
                <XStack justifyContent="space-between" alignItems="flex-start">
                  <YStack flex={1}>
                    <Text fontWeight="700" fontSize="$5">
                      {application.role}
                    </Text>
                    <Paragraph color="$color10" fontSize="$3">
                      {application.company}
                    </Paragraph>
                  </YStack>
                  <Button size="$2" chromeless onPress={() => removeApplication(application.id)}>
                    Remove
                  </Button>
                </XStack>
                <XStack flexWrap="wrap" gap="$2" paddingTop="$2">
                  {STATUSES.map((status) => (
                    <Button
                      key={status}
                      size="$2"
                      theme={application.status === status ? 'active' : undefined}
                      onPress={() => updateApplicationStatus(application.id, status)}>
                      {applicationStatusLabels[status]}
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
