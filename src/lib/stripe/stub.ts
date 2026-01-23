/**
 * Stripe Stub Service
 * Mock implementation for development without real Stripe credentials
 *
 * This allows building and testing the billing UI before connecting to Stripe.
 * Replace with real Stripe calls when ready.
 */

import { SubscriptionTier, TRIAL_DURATION_DAYS } from "./config";

export interface StubSubscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: "active" | "trialing" | "past_due" | "canceled" | "incomplete";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end: string | null;
}

export interface StubCheckoutResult {
  success: boolean;
  subscription?: StubSubscription;
  error?: string;
  redirect_url?: string;
}

/**
 * Stub: Create a checkout session
 * In real implementation, this creates a Stripe Checkout Session
 */
export async function createStubCheckout(
  userId: string,
  tier: "pro" | "team",
  interval: "monthly" | "yearly"
): Promise<StubCheckoutResult> {
  // Simulate checkout completion
  console.log(`[Stripe Stub] Creating checkout for user ${userId}: ${tier} ${interval}`);

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + (interval === "yearly" ? 12 : 1));

  const subscription: StubSubscription = {
    id: `sub_stub_${Date.now()}`,
    user_id: userId,
    tier,
    status: "active",
    current_period_start: now.toISOString(),
    current_period_end: periodEnd.toISOString(),
    cancel_at_period_end: false,
    trial_end: null,
  };

  return {
    success: true,
    subscription,
    redirect_url: "/app?upgrade=success",
  };
}

/**
 * Stub: Get billing portal URL
 * In real implementation, this creates a Stripe Customer Portal session
 */
export async function getStubPortalUrl(userId: string): Promise<string> {
  console.log(`[Stripe Stub] Getting portal URL for user ${userId}`);
  // In stub mode, just redirect to settings
  return "/app/settings?billing=stub";
}

/**
 * Stub: Cancel subscription
 */
export async function cancelStubSubscription(
  subscriptionId: string
): Promise<StubSubscription> {
  console.log(`[Stripe Stub] Canceling subscription ${subscriptionId}`);

  return {
    id: subscriptionId,
    user_id: "stub",
    tier: "free",
    status: "canceled",
    current_period_start: new Date().toISOString(),
    current_period_end: new Date().toISOString(),
    cancel_at_period_end: true,
    trial_end: null,
  };
}

/**
 * Stub: Start trial for new user
 * Called when user signs up - gives them 14-day Pro trial
 */
export function createTrialSubscription(userId: string): StubSubscription {
  const now = new Date();
  const trialEnd = new Date(now);
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DURATION_DAYS);

  return {
    id: `sub_trial_${userId}`,
    user_id: userId,
    tier: "trial",
    status: "trialing",
    current_period_start: now.toISOString(),
    current_period_end: trialEnd.toISOString(),
    cancel_at_period_end: false,
    trial_end: trialEnd.toISOString(),
  };
}

/**
 * Stub: Check if trial has expired
 */
export function isTrialExpired(trialEnd: string | null): boolean {
  if (!trialEnd) return true;
  return new Date(trialEnd) < new Date();
}

/**
 * Stub: Get effective tier (considers trial expiration)
 */
export function getEffectiveTier(
  tier: SubscriptionTier,
  status: string,
  trialEnd: string | null
): SubscriptionTier {
  if (tier === "trial" && isTrialExpired(trialEnd)) {
    return "free";
  }
  if (status === "canceled" || status === "past_due") {
    return "free";
  }
  return tier;
}
