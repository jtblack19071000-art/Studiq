import { useState } from 'react';
import { Button, H3, Paragraph, Text, YStack } from 'tamagui';

import { isPurchasesConfigured } from '@/src/lib/purchases';
import { useSubscriptionStore } from '@/src/state/subscriptionStore';

const PLATINUM_FEATURES = [
  'Record lectures and get automatic transcription',
  'AI-generated notes, vocabulary, flashcards, and quizzes per lecture',
  'Generate a full Unit Study Guide from all your lectures',
  'Export study guides to PDF',
  'AI-guided College Match best-fit quiz',
];

export function Paywall() {
  const offer = useSubscriptionStore((state) => state.offer);
  const purchase = useSubscriptionStore((state) => state.purchase);
  const restore = useSubscriptionStore((state) => state.restore);
  const refreshing = useSubscriptionStore((state) => state.refreshing);

  const [busy, setBusy] = useState<'purchase' | 'restore' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePurchase() {
    setError(null);
    setBusy('purchase');
    try {
      await purchase();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed.');
    } finally {
      setBusy(null);
    }
  }

  async function handleRestore() {
    setError(null);
    setBusy('restore');
    try {
      await restore();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Restore failed.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <YStack gap="$3">
      <H3>Studiq Platinum</H3>
      <Text fontSize="$8" fontWeight="700">
        {offer?.priceString ?? '$3'}
        <Text fontSize="$4" color="$color10">
          {' '}
          / month
        </Text>
      </Text>
      <YStack gap="$1.5">
        {PLATINUM_FEATURES.map((feature) => (
          <Text key={feature}>• {feature}</Text>
        ))}
      </YStack>

      {!isPurchasesConfigured ? (
        <Paragraph color="$color10" fontSize="$3">
          Subscriptions aren&apos;t configured yet on this build — set EXPO_PUBLIC_REVENUECAT_API_KEY
          (and configure the Platinum entitlement/offering in the RevenueCat dashboard) to enable
          purchasing.
        </Paragraph>
      ) : (
        <>
          <Button theme="active" onPress={handlePurchase} disabled={busy !== null || refreshing}>
            {busy === 'purchase' ? 'Processing…' : `Subscribe for ${offer?.priceString ?? '$3'}/month`}
          </Button>
          <Button chromeless onPress={handleRestore} disabled={busy !== null || refreshing}>
            {busy === 'restore' ? 'Restoring…' : 'Restore purchases'}
          </Button>
        </>
      )}
      {error ? <Paragraph color="$red10">{error}</Paragraph> : null}
    </YStack>
  );
}
