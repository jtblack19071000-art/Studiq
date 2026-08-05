import { useState } from 'react';
import { Button, H2, Input, Paragraph, Text, XStack, YStack } from 'tamagui';

import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import { useCampusResourcesStore } from '@/src/state/campusResourcesStore';
import { ACCENT_SOFT_BG, ACCENT_TINT, useThemeStore } from '@/src/state/themeStore';
import { resourceCategoryLabels, type ResourceCategory } from '@/src/types';

const CATEGORIES = Object.keys(resourceCategoryLabels) as ResourceCategory[];

export default function CampusResourcesScreen() {
  const resources = useCampusResourcesStore((state) => state.resources);
  const addResource = useCampusResourcesStore((state) => state.addResource);
  const removeResource = useCampusResourcesStore((state) => state.removeResource);
  const accentColor = useThemeStore((state) => state.accentColor);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('other');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleAdd() {
    if (!name.trim()) {
      setError('Give the resource a name.');
      return;
    }
    setError(null);
    addResource({
      name: name.trim(),
      category,
      contact: contact.trim() || undefined,
      location: location.trim() || undefined,
    });
    setName('');
    setContact('');
    setLocation('');
  }

  return (
    <Screen>
      <YStack gap="$1" paddingTop="$2">
        <H2>🧭 Campus Resources</H2>
        <Paragraph color="$color10">
          Your personal directory — add the offices and services your campus offers.
        </Paragraph>
      </YStack>

      <YStack
        alignItems="center"
        gap="$1"
        borderRadius="$8"
        paddingVertical="$5"
        style={{ backgroundColor: ACCENT_SOFT_BG[accentColor] }}>
        <Text fontSize={36}>📇</Text>
        <Text fontWeight="800" fontSize="$6" style={{ color: ACCENT_TINT[accentColor] }}>
          {resources.length} resource{resources.length === 1 ? '' : 's'} saved
        </Text>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Add resource" emoji="➕" />
        <Card gap="$3">
          <Input placeholder="Name, e.g. Writing Center" value={name} onChangeText={setName} />
          <XStack flexWrap="wrap" gap="$2">
            {CATEGORIES.map((option) => (
              <Button
                key={option}
                size="$2"
                theme={category === option ? 'active' : undefined}
                onPress={() => setCategory(option)}>
                {resourceCategoryLabels[option]}
              </Button>
            ))}
          </XStack>
          <Input placeholder="Contact (phone, email, or website)" value={contact} onChangeText={setContact} />
          <Input placeholder="Location (optional)" value={location} onChangeText={setLocation} />
          {error ? <Paragraph color="$red10">{error}</Paragraph> : null}
          <Button theme="active" onPress={handleAdd}>
            Add resource
          </Button>
        </Card>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Directory" emoji="📇" />
        {resources.length === 0 ? (
          <Card>
            <EmptyState emoji="🧭" message="No resources added yet." />
          </Card>
        ) : (
          <YStack gap="$3">
            {resources.map((resource) => (
              <Card key={resource.id}>
                <XStack justifyContent="space-between" alignItems="flex-start">
                  <YStack flex={1}>
                    <Text fontWeight="700" fontSize="$5">
                      {resource.name}
                    </Text>
                    <Paragraph color="$color10" fontSize="$3">
                      {resourceCategoryLabels[resource.category]}
                      {resource.location ? ` · ${resource.location}` : ''}
                    </Paragraph>
                    {resource.contact ? (
                      <Paragraph color="$color10" fontSize="$3">
                        {resource.contact}
                      </Paragraph>
                    ) : null}
                    {resource.notes ? <Paragraph fontSize="$3">{resource.notes}</Paragraph> : null}
                  </YStack>
                  <Button size="$2" chromeless onPress={() => removeResource(resource.id)}>
                    Remove
                  </Button>
                </XStack>
              </Card>
            ))}
          </YStack>
        )}
      </YStack>
    </Screen>
  );
}
