/**
 * Stripe Configuration
 * FR-901: Subscription tiers
 *
 * STUB MODE: Set STRIPE_STUB_MODE=true in .env to use mock billing
 * Real Stripe integration deferred to end of project
 */

// Check if we're in stub mode (no real Stripe credentials)
export const STRIPE_STUB_MODE =
  process.env.STRIPE_STUB_MODE === "true" ||
  !process.env.STRIPE_SECRET_KEY;

// Price IDs from Stripe Dashboard (set these when ready)
export const STRIPE_PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || "price_stub_pro_monthly",
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY || "price_stub_pro_yearly",
  team_monthly: process.env.STRIPE_PRICE_TEAM_MONTHLY || "price_stub_team_monthly",
  team_yearly: process.env.STRIPE_PRICE_TEAM_YEARLY || "price_stub_team_yearly",
} as const;

// Subscription tiers and their limits
export type SubscriptionTier = "free" | "trial" | "pro" | "team";

export interface TierLimits {
  engagements: number;
  ai_queries_per_month: number;
  sow_generations: number;
  seats?: number;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    engagements: 2,
    ai_queries_per_month: 10,
    sow_generations: 0,
  },
  trial: {
    engagements: 999,
    ai_queries_per_month: 100,
    sow_generations: 5,
  },
  pro: {
    engagements: 999,
    ai_queries_per_month: 500,
    sow_generations: 999,
  },
  team: {
    engagements: 999,
    ai_queries_per_month: 2000,
    sow_generations: 999,
    seats: 5,
  },
} as const;

// Pricing display info
export const TIER_PRICING = {
  free: { monthly: 0, yearly: 0, label: "Free" },
  trial: { monthly: 0, yearly: 0, label: "14-day Trial" },
  pro: { monthly: 49, yearly: 490, label: "Pro" },
  team: { monthly: 149, yearly: 1490, label: "Team" },
} as const;

// Trial duration in days
export const TRIAL_DURATION_DAYS = 14;

/**
 * Get tier from Stripe price ID
 */
export function getTierFromPriceId(priceId: string): SubscriptionTier {
  if (priceId === STRIPE_PRICES.pro_monthly || priceId === STRIPE_PRICES.pro_yearly) {
    return "pro";
  }
  if (priceId === STRIPE_PRICES.team_monthly || priceId === STRIPE_PRICES.team_yearly) {
    return "team";
  }
  return "free";
}

/**
 * Check if a tier has access to a feature
 */
export function tierHasFeature(
  tier: SubscriptionTier,
  feature: "ai_discovery" | "sow_generation" | "team_features"
): boolean {
  switch (feature) {
    case "ai_discovery":
      return tier !== "free" || TIER_LIMITS.free.ai_queries_per_month > 0;
    case "sow_generation":
      return tier === "pro" || tier === "team";
    case "team_features":
      return tier === "team";
    default:
      return false;
  }
}
