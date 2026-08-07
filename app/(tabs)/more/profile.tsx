import { useState } from 'react';
import { Button, H1, H2, Input, Label, Paragraph, Text, XStack, YStack } from 'tamagui';

import { Badge } from '@/src/components/Badge';
import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { Hero } from '@/src/components/Hero';
import { Icon } from '@/src/components/Icon';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import { confirmAsync } from '@/src/lib/confirm';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/state/authStore';
import { useSubscriptionStore } from '@/src/state/subscriptionStore';
import { ACCENT_TINT, useThemeStore } from '@/src/state/themeStore';

export default function ProfileScreen() {
  const session = useAuthStore((state) => state.session);
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const signOut = useAuthStore((state) => state.signOut);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const authError = useAuthStore((state) => state.error);
  const tier = useSubscriptionStore((state) => state.tier);
  const accentColor = useThemeStore((state) => state.accentColor);

  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [collegeDraft, setCollegeDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!supabase) {
    return (
      <Screen>
        <YStack gap="$1" paddingTop="$2">
          <XStack alignItems="center" gap="$2">
            <Icon name="graduation-cap" size={22} color="#3B6FE0" />
            <H2>Profile</H2>
          </XStack>
        </YStack>
        <Card>
          <Paragraph color="$color10">
            Profiles need a Studiq account. Set EXPO_PUBLIC_SUPABASE_URL and
            EXPO_PUBLIC_SUPABASE_ANON_KEY to enable sign-in.
          </Paragraph>
        </Card>
      </Screen>
    );
  }

  if (!session || !user) {
    return (
      <Screen>
        <YStack gap="$1" paddingTop="$2">
          <XStack alignItems="center" gap="$2">
            <Icon name="graduation-cap" size={22} color="#3B6FE0" />
            <H2>Profile</H2>
          </XStack>
        </YStack>
        <Card>
          <EmptyState icon="lock" message="Sign in to see your profile." />
        </Card>
      </Screen>
    );
  }

  const storedName = (user.user_metadata?.display_name as string | undefined) || null;
  const storedCollege = (user.user_metadata?.college as string | undefined) || null;
  const initial = (storedName ?? user.email ?? '?').charAt(0).toUpperCase();

  function startEditing() {
    setNameDraft(storedName ?? '');
    setCollegeDraft(storedCollege ?? '');
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    await updateProfile({ displayName: nameDraft.trim(), college: collegeDraft.trim() });
    setSaving(false);
    if (!useAuthStore.getState().error) setEditing(false);
  }

  async function handleDeleteAccount() {
    const confirmed = await confirmAsync(
      'Delete account?',
      'This permanently deletes your account and everything in it — classes, schedule, grades, finances, and your subscription. This cannot be undone.',
    );
    if (!confirmed) return;
    setDeleting(true);
    await deleteAccount();
    setDeleting(false);
  }

  return (
    <Screen>
      <Hero logo alignItems="center" gap="$2">
        <YStack
          width={72}
          height={72}
          borderRadius={36}
          alignItems="center"
          justifyContent="center"
          style={{ backgroundColor: ACCENT_TINT[accentColor] }}>
          <Text fontSize="$8" fontWeight="700" color="white">
            {initial}
          </Text>
        </YStack>
        <H1 fontSize="$8" style={{ color: ACCENT_TINT[accentColor] }}>
          {storedName ?? 'Studiq student'}
        </H1>
        <Badge label={tier === 'premium' ? 'Premium' : 'Free plan'} tone={tier === 'premium' ? 'success' : 'neutral'} />
      </Hero>

      <YStack gap="$2">
        <SectionHeader
          title="Your info"
          icon="info"
          action={
            !editing ? (
              <Button size="$2" onPress={startEditing} icon={<Icon name="edit" size={13} color="#8A8F98" />}>
                Edit
              </Button>
            ) : null
          }
        />
        <Card gap="$3">
          {editing ? (
            <>
              <YStack gap="$1">
                <Label fontSize="$2">Name</Label>
                <Input value={nameDraft} onChangeText={setNameDraft} placeholder="Your name" />
              </YStack>
              <YStack gap="$1">
                <Label fontSize="$2">College attending</Label>
                <Input value={collegeDraft} onChangeText={setCollegeDraft} placeholder="e.g. State University" />
              </YStack>
              {authError ? <Text color="$red10">{authError}</Text> : null}
              <XStack gap="$2">
                <Button flex={1} theme="active" onPress={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>
                <Button flex={1} chromeless onPress={() => setEditing(false)} disabled={saving}>
                  Cancel
                </Button>
              </XStack>
            </>
          ) : (
            <>
              <YStack>
                <Text color="$color10" fontSize="$2">
                  Name
                </Text>
                <Text fontWeight="600">{storedName ?? 'Not set'}</Text>
              </YStack>
              <YStack>
                <Text color="$color10" fontSize="$2">
                  Email
                </Text>
                <Text fontWeight="600">{user.email ?? user.phone ?? 'Not set'}</Text>
              </YStack>
              <YStack>
                <Text color="$color10" fontSize="$2">
                  College attending
                </Text>
                <Text fontWeight="600">{storedCollege ?? 'Not set'}</Text>
              </YStack>
            </>
          )}
        </Card>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Account" icon="key" />
        <Card gap="$2">
          <Button size="$4" onPress={signOut}>
            Sign out
          </Button>
          <Button size="$4" theme="red" disabled={deleting} onPress={handleDeleteAccount}>
            {deleting ? 'Deleting…' : 'Delete account'}
          </Button>
        </Card>
      </YStack>
    </Screen>
  );
}
