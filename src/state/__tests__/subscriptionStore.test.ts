/// <reference types="jest" />

// react-native-purchases pulls in an ESM-only RevenueCat package that Jest's default
// transformIgnorePatterns doesn't transform. Mocking it avoids loading the real module at all —
// harmless here since isPurchasesConfigured is false in every test below, so nothing in
// src/lib/purchases.ts ever calls into it.
import { useSubscriptionStore } from '@/src/state/subscriptionStore';

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(),
    logIn: jest.fn(),
    logOut: jest.fn(),
    getCustomerInfo: jest.fn(),
    getOfferings: jest.fn(),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(),
  },
}));

const initialState = useSubscriptionStore.getState();

beforeEach(() => {
  useSubscriptionStore.setState(initialState, true);
});

// No EXPO_PUBLIC_REVENUECAT_API_KEY is set in the test environment, so `isPurchasesConfigured`
// (src/lib/purchases.ts) is false and every action here degrades to the free tier instead of
// touching the RevenueCat SDK — the same state the app is in until a RevenueCat key is provided.
describe('useSubscriptionStore (RevenueCat not configured)', () => {
  it('starts on the free tier with no offer', () => {
    const state = useSubscriptionStore.getState();
    expect(state.tier).toBe('free');
    expect(state.offer).toBeNull();
    expect(state.refreshing).toBe(false);
  });

  it('refresh() is a no-op when purchases are not configured', async () => {
    await useSubscriptionStore.getState().refresh();

    const state = useSubscriptionStore.getState();
    expect(state.tier).toBe('free');
    expect(state.refreshing).toBe(false);
  });

  it('purchase() rejects with a clear error instead of silently unlocking Platinum', async () => {
    await expect(useSubscriptionStore.getState().purchase()).rejects.toThrow(
      'Subscriptions are not configured.',
    );
    expect(useSubscriptionStore.getState().tier).toBe('free');
  });

  it('restore() resolves to the free tier without throwing', async () => {
    await expect(useSubscriptionStore.getState().restore()).resolves.toBeUndefined();
    expect(useSubscriptionStore.getState().tier).toBe('free');
  });
});
