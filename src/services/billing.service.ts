/**
 * Billing Service
 * FR-901 through FR-909: Subscription management
 *
 * Uses stub mode when STRIPE_STUB_MODE=true or no Stripe credentials.
 * Switch to real Stripe when ready by setting proper env vars.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { ProfileRepository } from "@/repositories/profile.repo";
import type { Profile, SubscriptionStatus } from "@/types";
import {
  STRIPE_STUB_MODE,
  SubscriptionTier,
  TIER_LIMITS,
  TIER_PRICING,
  TRIAL_DURATION_DAYS,
  getTierFromPriceId,
} from "@/lib/stripe/config";
import {
  createStubCheckout,
  getStubPortalUrl,
  getEffectiveTier,
} from "@/lib/stripe/stub";

export interface CheckoutResult {
  success: boolean;
  redirect_url?: string;
  error?: string;
}

export interface TierPricing {
  monthly: number;
  yearly: number;
  label: string;
}

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  effectiveTier: SubscriptionTier;
  status: SubscriptionStatus;
  trialEndsAt: string | null;
  isTrialing: boolean;
  limits: (typeof TIER_LIMITS)[SubscriptionTier];
  pricing: TierPricing;
}

export class BillingService {
  private profileRepo: ProfileRepository;

  constructor(private supabase: SupabaseClient) {
    this.profileRepo = new ProfileRepository(supabase);
  }

  /**
   * Get subscription info for a user
   */
  async getSubscriptionInfo(userId: string): Promise<SubscriptionInfo> {
    const profile = await this.profileRepo.findById(userId);

    if (!profile) {
      throw new Error("Profile not found");
    }

    const tier = profile.subscription_tier || "free";
    const status = profile.subscription_status || "active";
    const trialEndsAt = profile.trial_ends_at;

    const effectiveTier = getEffectiveTier(tier, status, trialEndsAt);

    return {
      tier,
      effectiveTier,
      status,
      trialEndsAt,
      isTrialing: status === "trialing",
      limits: TIER_LIMITS[effectiveTier],
      pricing: TIER_PRICING[tier],
    };
  }

  /**
   * Start a trial for a new user (called on signup)
   * FR-906: 14-day trial
   */
  async startTrial(userId: string): Promise<Profile> {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + TRIAL_DURATION_DAYS);

    return this.profileRepo.updateSubscription(userId, {
      subscription_tier: "trial",
      subscription_status: "trialing",
      trial_ends_at: trialEnd.toISOString(),
    });
  }

  /**
   * Create checkout session for upgrade
   * FR-902, FR-904: Stripe checkout + upgrade flow
   */
  async createCheckout(
    userId: string,
    tier: "pro" | "team",
    interval: "monthly" | "yearly"
  ): Promise<CheckoutResult> {
    if (STRIPE_STUB_MODE) {
      // Stub mode: simulate checkout
      const result = await createStubCheckout(userId, tier, interval);

      if (result.success && result.subscription) {
        // Update profile with new tier
        await this.profileRepo.updateSubscription(userId, {
          subscription_tier: tier,
          subscription_status: "active",
          trial_ends_at: null,
        });
      }

      return {
        success: result.success,
        redirect_url: result.redirect_url,
        error: result.error,
      };
    }

    // Real Stripe mode (to be implemented)
    // TODO: Implement real Stripe checkout when ready
    return {
      success: false,
      error: "Stripe not configured. Set STRIPE_SECRET_KEY in environment.",
    };
  }

  /**
   * Get billing portal URL
   * FR-907: Billing portal
   */
  async getPortalUrl(userId: string): Promise<string> {
    if (STRIPE_STUB_MODE) {
      return getStubPortalUrl(userId);
    }

    // Real Stripe mode (to be implemented)
    // TODO: Implement real Stripe portal when ready
    return "/app/settings";
  }

  /**
   * Handle downgrade (cancel at period end)
   * FR-905: Downgrade flow
   */
  async cancelSubscription(userId: string): Promise<void> {
    if (STRIPE_STUB_MODE) {
      // In stub mode, immediately downgrade to free
      await this.profileRepo.updateSubscription(userId, {
        subscription_tier: "free",
        subscription_status: "canceled",
        trial_ends_at: null,
      });
      return;
    }

    // Real Stripe mode: would set cancel_at_period_end
    // TODO: Implement real Stripe cancellation when ready
  }

  /**
   * Handle webhook events (for real Stripe mode)
   * FR-902: Webhooks
   */
  async handleWebhookEvent(
    eventType: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  ): Promise<void> {
    if (STRIPE_STUB_MODE) {
      console.log(`[Stripe Stub] Would handle webhook: ${eventType}`);
      return;
    }

    switch (eventType) {
      case "checkout.session.completed": {
        const userId = data.metadata?.user_id;
        if (!userId) return;

        const priceId = data.items?.[0]?.price?.id;
        const tier = getTierFromPriceId(priceId);

        await this.profileRepo.updateSubscription(userId, {
          subscription_tier: tier,
          subscription_status: "active",
          trial_ends_at: null,
        });
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        // Would lookup user by stripe_customer_id and update
        // TODO: Implement when real Stripe is connected
        break;
      }

      case "invoice.payment_failed": {
        // Would mark subscription as past_due
        // TODO: Implement when real Stripe is connected
        break;
      }
    }
  }
}
