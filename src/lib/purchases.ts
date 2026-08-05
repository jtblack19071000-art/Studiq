import Purchases from 'react-native-purchases';

import { PREMIUM_ENTITLEMENT_ID, type SubscriptionTier } from '@/src/types';

const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

/**
 * RevenueCat SDK keys are meant to be embedded client-side (unlike the OpenAI/Anthropic keys,
 * which must stay server-only) — see https://www.revenuecat.com/docs/authentication.
 *
 * This flips to false if `configure()` itself fails (e.g. the key isn't valid for the current
 * platform — RevenueCat's web "Browser Mode" specifically requires a Web Billing key, distinct
 * from the iOS/Android SDK key format, and throws synchronously if the format doesn't match).
 * Every other function below checks this before touching the SDK, so a bad or platform-mismatched
 * key degrades to the free tier instead of crashing the app.
 */
export let isPurchasesConfigured = Boolean(apiKey);

let configuredUserId: string | null | undefined;

/** Configures (or re-logs-in) the RevenueCat SDK for the given Supabase user id, or anonymous if null. */
export async function configurePurchases(userId: string | null): Promise<void> {
  if (!isPurchasesConfigured || !apiKey || configuredUserId === userId) return;

  try {
    if (configuredUserId === undefined) {
      Purchases.configure({ apiKey, appUserID: userId });
    } else if (userId) {
      await Purchases.logIn(userId);
    } else {
      await Purchases.logOut();
    }
    configuredUserId = userId;
  } catch (error) {
    isPurchasesConfigured = false;
    console.warn('RevenueCat configuration failed; subscriptions will show as free.', error);
  }
}

export function tierFromEntitlements(activeEntitlements: Record<string, unknown>): SubscriptionTier {
  return PREMIUM_ENTITLEMENT_ID in activeEntitlements ? 'premium' : 'free';
}

export async function fetchCurrentTier(): Promise<SubscriptionTier> {
  if (!isPurchasesConfigured) return 'free';
  const customerInfo = await Purchases.getCustomerInfo();
  return tierFromEntitlements(customerInfo.entitlements.active);
}

export interface PackageInfo {
  packageIdentifier: string;
  priceString: string;
}

export interface PremiumOffer {
  monthly: PackageInfo | null;
  annual: PackageInfo | null;
}

function toPackageInfo(pkg: { identifier: string; product: { priceString: string } } | null): PackageInfo | null {
  if (!pkg) return null;
  return { packageIdentifier: pkg.identifier, priceString: pkg.product.priceString };
}

/** Fetches the current offering's monthly/annual packages for the Premium entitlement, if configured. */
export async function fetchPremiumOffer(): Promise<PremiumOffer | null> {
  if (!isPurchasesConfigured) return null;
  const offerings = await Purchases.getOfferings();
  const current = offerings.current;
  if (!current || current.availablePackages.length === 0) return null;
  return { monthly: toPackageInfo(current.monthly), annual: toPackageInfo(current.annual) };
}

export async function purchasePremium(packageIdentifier?: string): Promise<SubscriptionTier> {
  if (!isPurchasesConfigured) throw new Error('Subscriptions are not configured.');
  const offerings = await Purchases.getOfferings();
  const available = offerings.current?.availablePackages ?? [];
  const pkg = packageIdentifier
    ? available.find((candidate) => candidate.identifier === packageIdentifier)
    : available[0];
  if (!pkg) throw new Error('No subscription package is configured yet.');
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return tierFromEntitlements(customerInfo.entitlements.active);
}

export async function restorePurchases(): Promise<SubscriptionTier> {
  if (!isPurchasesConfigured) return 'free';
  const customerInfo = await Purchases.restorePurchases();
  return tierFromEntitlements(customerInfo.entitlements.active);
}
