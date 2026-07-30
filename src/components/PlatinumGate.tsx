import type { ReactNode } from 'react';
import { Paragraph, YStack } from 'tamagui';

import { AuthForm } from '@/src/components/AuthForm';
import { Card } from '@/src/components/Card';
import { Paywall } from '@/src/components/Paywall';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/state/authStore';
import { useSubscriptionStore } from '@/src/state/subscriptionStore';

/** Gates its children behind sign-in + an active Platinum subscription. */
export function PlatinumGate({ children }: { children: ReactNode }) {
  const initializing = useAuthStore((state) => state.initializing);
  const session = useAuthStore((state) => state.session);
  const tier = useSubscriptionStore((state) => state.tier);

  if (!supabase) {
    return (
      <Card>
        <Paragraph color="$color10">
          Platinum features require a Studiq account, and cloud sync isn&apos;t configured on this
          build yet. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable
          sign-in.
        </Paragraph>
      </Card>
    );
  }

  if (initializing) {
    return (
      <Card>
        <Paragraph color="$color10">Loading…</Paragraph>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card>
        <AuthForm />
      </Card>
    );
  }

  if (tier !== 'platinum') {
    return (
      <Card>
        <Paywall />
      </Card>
    );
  }

  return <YStack gap="$4">{children}</YStack>;
}
