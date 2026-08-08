import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { isFounderEmail } from '@/src/lib/founderAccess';
import { mmkvStateStorage } from '@/src/lib/mmkvStorage';
import {
  fetchCurrentTier,
  fetchPremiumOffer,
  isPurchasesConfigured,
  purchasePremium,
  restorePurchases,
  type PremiumOffer,
} from '@/src/lib/purchases';
import type { SubscriptionTier } from '@/src/types';

interface SubscriptionState {
  tier: SubscriptionTier;
  offer: PremiumOffer | null;
  refreshing: boolean;
  refresh: (email?: string | null) => Promise<void>;
  purchase: (packageIdentifier?: string) => Promise<void>;
  restore: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      tier: 'free',
      offer: null,
      refreshing: false,
      refresh: async (email) => {
        // Founder accounts always have Premium — checked first so it works even without
        // RevenueCat configured at all, which is exactly the state of a fresh preview deploy.
        if (isFounderEmail(email)) {
          set({ tier: 'premium' });
          return;
        }
        if (!isPurchasesConfigured) {
          // Without RevenueCat there's no way anyone legitimately purchased Premium, so anything
          // other than 'free' here can only be stale state left over from a previous account on
          // this device (e.g. a founder signed out, or `tier` was persisted from an earlier
          // session) — explicitly reset it instead of leaving it untouched.
          set({ tier: 'free' });
          return;
        }
        set({ refreshing: true });
        try {
          const [tier, offer] = await Promise.all([fetchCurrentTier(), fetchPremiumOffer()]);
          set({ tier, offer });
        } catch {
          // RevenueCat unreachable or misconfigured (e.g. invalid API key) — keep the last known
          // tier rather than crashing the refresh chain with an unhandled rejection.
        } finally {
          set({ refreshing: false });
        }
      },
      purchase: async (packageIdentifier) => {
        const tier = await purchasePremium(packageIdentifier);
        set({ tier });
      },
      restore: async () => {
        const tier = await restorePurchases();
        set({ tier });
      },
    }),
    {
      name: 'studiq-subscription',
      storage: createJSONStorage(() => mmkvStateStorage),
      partialize: (state) => ({ tier: state.tier }),
    },
  ),
);
