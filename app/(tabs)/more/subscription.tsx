import { useState } from 'react';
import { Button, H1, H2, Paragraph, Text, YStack } from 'tamagui';

import { Badge } from '@/src/components/Badge';
import { Card } from '@/src/components/Card';
import { Hero } from '@/src/components/Hero';
import { Paywall } from '@/src/components/Paywall';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import { manageSubscription } from '@/src/lib/purchases';
import { useSubscriptionStore } from '@/src/state/subscriptionStore';
import { ACCENT_TINT, useThemeStore } from '@/src/state/themeStore';

export default function SubscriptionScreen() {
  const tier = useSubscriptionStore((state) => state.tier);
  const accentColor = useThemeStore((state) => state.accentColor);
  const [managing, setManaging] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleManage() {
    setManaging(true);
    setMessage(null);
    const result = await manageSubscription();
    if (!result.handled && result.message) setMessage(result.message);
    setManaging(false);
  }

  return (
    <Screen>
      <Hero logo alignItems="center" gap="$2">
        <Text fontSize={40}>{tier === 'premium' ? '💎' : '🆓'}</Text>
        <H1 fontSize="$8" style={{ color: ACCENT_TINT[accentColor] }}>
          {tier === 'premium' ? 'Premium' : 'Free plan'}
        </H1>
        <Badge label={tier === 'premium' ? 'Active' : 'No AI Study Mode yet'} tone={tier === 'premium' ? 'success' : 'neutral'} />
      </Hero>

      {tier === 'premium' ? (
        <YStack gap="$2">
          <SectionHeader title="Your plan" emoji="💎" />
          <Card gap="$3">
            <Text fontWeight="600">You have unlimited AI Study Mode</Text>
            <Paragraph color="$color10" fontSize="$3">
              Lecture recording, transcription, per-lecture AI notes/flashcards/quizzes, and Unit
              Study Guides are all unlocked.
            </Paragraph>
            <Button size="$4" borderRadius="$10" onPress={handleManage} disabled={managing}>
              {managing ? 'Opening…' : '⚙️ Manage or cancel subscription'}
            </Button>
            {message ? (
              <Paragraph color="$color10" fontSize="$3">
                {message}
              </Paragraph>
            ) : null}
          </Card>
        </YStack>
      ) : (
        <YStack gap="$2">
          <SectionHeader title="Upgrade" emoji="✨" />
          <Card>
            <Paywall />
          </Card>
        </YStack>
      )}

      <YStack gap="$2">
        <SectionHeader title="What's free vs. Premium" emoji="🆚" />
        <Card gap="$2">
          <H2 fontSize="$4">🆓 Free, always</H2>
          <Paragraph color="$color10" fontSize="$3">
            Classes, schedule, GPA tracker, finance, goals, career hub, campus resources, and
            College Match — unlimited, no account required for local use.
          </Paragraph>
          <H2 fontSize="$4" paddingTop="$2">
            💎 Premium
          </H2>
          <Paragraph color="$color10" fontSize="$3">
            Everything AI-powered in the Study tab: lecture recording, transcription, per-lecture
            materials, Unit Study Guides, syllabus import, and PDF export.
          </Paragraph>
        </Card>
      </YStack>
    </Screen>
  );
}
