import { useState } from 'react';
import { Button, H3, Paragraph, Text, XStack, YStack } from 'tamagui';

import { isPurchasesConfigured } from '@/src/lib/purchases';
import { useSubscriptionStore } from '@/src/state/subscriptionStore';

const PREMIUM_FEATURES = [
  'Unlimited lecture recording, transcription & AI notes',
  'Flashcards, quizzes, practice exams & mnemonics per lecture',
  'Unit Study Guides — one AI pass over every lecture in a unit',
  'PDF export for study guides, flashcards & review sheets',
];

const FALLBACK_MONTHLY_PRICE = '$5.99';
const FALLBACK_ANNUAL_PRICE = '$49.99';

type BillingPeriod = 'monthly' | 'annual';

export function Paywall() {
  const offer = useSubscriptionStore((state) => state.offer);
  const purchase = useSubscriptionStore((state) => state.purchase);
  const restore = useSubscriptionStore((state) => state.restore);
  const refreshing = useSubscriptionStore((state) => state.refreshing);

  const [period, setPeriod] = useState<BillingPeriod>('annual');
  const [busy, setBusy] = useState<'purchase' | 'restore' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const monthlyPrice = offer?.monthly?.priceString ?? FALLBACK_MONTHLY_PRICE;
  const annualPrice = offer?.annual?.priceString ?? FALLBACK_ANNUAL_PRICE;
  const selectedPackageId = period === 'monthly' ? offer?.monthly?.packageIdentifier : offer?.annual?.packageIdentifier;

  async function handlePurchase() {
    setError(null);
    setBusy('purchase');
    try {
      await purchase(selectedPackageId);
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
      <H3>🎯 Ace your next exam with AI Study Mode</H3>
      <Paragraph color="$color10" fontSize="$3">
        Record any lecture and let AI turn it into notes, flashcards, and a practice exam — so you
        walk in knowing exactly what&apos;s going to be on the test.
      </Paragraph>

      <XStack gap="$2">
        <Button
          flex={1}
          size="$3"
          theme={period === 'annual' ? 'active' : undefined}
          onPress={() => setPeriod('annual')}>
          Yearly · {annualPrice}
        </Button>
        <Button
          flex={1}
          size="$3"
          theme={period === 'monthly' ? 'active' : undefined}
          onPress={() => setPeriod('monthly')}>
          Monthly · {monthlyPrice}
        </Button>
      </XStack>

      <Text fontSize="$8" fontWeight="700">
        {period === 'monthly' ? monthlyPrice : annualPrice}
        <Text fontSize="$4" color="$color10">
          {' '}
          / {period === 'monthly' ? 'month' : 'year'}
        </Text>
      </Text>

      <YStack gap="$1.5">
        {PREMIUM_FEATURES.map((feature) => (
          <Text key={feature}>• {feature}</Text>
        ))}
      </YStack>

      {!isPurchasesConfigured ? (
        <Paragraph color="$color10" fontSize="$3">
          Subscriptions aren&apos;t configured yet on this build — set EXPO_PUBLIC_REVENUECAT_API_KEY
          (and configure the Premium entitlement/offering in the RevenueCat dashboard) to enable
          purchasing.
        </Paragraph>
      ) : (
        <>
          <Button theme="active" borderRadius="$10" onPress={handlePurchase} disabled={busy !== null || refreshing}>
            {busy === 'purchase' ? 'Processing…' : '✨ Unlock AI Study Mode'}
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
