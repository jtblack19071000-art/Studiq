import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStateStorage } from '@/src/lib/mmkvStorage';
import {
  fetchCurrentTier,
  fetchPlatinumOffer,
  isPurchasesConfigured,
  purchasePlatinum,
  restorePurchases,
  type PlatinumOffer,
} from '@/src/lib/purchases';
import type { SubscriptionTier } from '@/src/types';

interface SubscriptionState {
  tier: SubscriptionTier;
  offer: PlatinumOffer | null;
  refreshing: boolean;
  refresh: () => Promise<void>;
  purchase: () => Promise<void>;
  restore: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      tier: 'free',
      offer: null,
      refreshing: false,
      refresh: async () => {
        if (!isPurchasesConfigured) return;
        set({ refreshing: true });
        try {
          const [tier, offer] = await Promise.all([fetchCurrentTier(), fetchPlatinumOffer()]);
          set({ tier, offer });
        } catch {
          // RevenueCat unreachable or misconfigured (e.g. invalid API key) — keep the last known
          // tier rather than crashing the refresh chain with an unhandled rejection.
        } finally {
          set({ refreshing: false });
        }
      },
      purchase: async () => {
        const tier = await purchasePlatinum();
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
