/// <reference types="jest" />

// react-native-purchases pulls in an ESM-only RevenueCat package that Jest's default
// transformIgnorePatterns doesn't transform. Mocking it avoids loading the real module — harmless
// here since EXPO_PUBLIC_REVENUECAT_API_KEY isn't set in the test environment, so
// isPurchasesConfigured is false and every function below short-circuits before touching it.
import Purchases from 'react-native-purchases';

import { PLATINUM_ENTITLEMENT_ID } from '@/src/types';

import {
  configurePurchases,
  fetchCurrentTier,
  fetchPlatinumOffer,
  isPurchasesConfigured,
  purchasePlatinum,
  restorePurchases,
  tierFromEntitlements,
} from '@/src/lib/purchases';

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

describe('tierFromEntitlements (pure)', () => {
  it('returns "platinum" when the Platinum entitlement is active', () => {
    expect(tierFromEntitlements({ [PLATINUM_ENTITLEMENT_ID]: {} })).toBe('platinum');
  });

  it('returns "free" when the Platinum entitlement is absent', () => {
    expect(tierFromEntitlements({})).toBe('free');
    expect(tierFromEntitlements({ some_other_entitlement: {} })).toBe('free');
  });
});

// No EXPO_PUBLIC_REVENUECAT_API_KEY is set in the test environment, matching the app's state
// until a RevenueCat key is provided (see README "Subscriptions").
describe('purchases.ts (RevenueCat not configured)', () => {
  it('isPurchasesConfigured is false', () => {
    expect(isPurchasesConfigured).toBe(false);
  });

  it('fetchCurrentTier resolves to "free" without calling the SDK', async () => {
    await expect(fetchCurrentTier()).resolves.toBe('free');
  });

  it('fetchPlatinumOffer resolves to null without calling the SDK', async () => {
    await expect(fetchPlatinumOffer()).resolves.toBeNull();
  });

  it('purchasePlatinum rejects with a clear error instead of silently unlocking Platinum', async () => {
    await expect(purchasePlatinum()).rejects.toThrow('Subscriptions are not configured.');
  });

  it('restorePurchases resolves to "free" without calling the SDK', async () => {
    await expect(restorePurchases()).resolves.toBe('free');
  });

  it('configurePurchases resolves without ever calling Purchases.configure', async () => {
    await expect(configurePurchases('user-1')).resolves.toBeUndefined();
    expect(Purchases.configure).not.toHaveBeenCalled();
  });
});
