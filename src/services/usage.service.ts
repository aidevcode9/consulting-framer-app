import { SupabaseClient } from "@supabase/supabase-js";
import { UsageRepository, UsageCounts } from "@/repositories/usage.repo";
import { ProfileRepository } from "@/repositories/profile.repo";
import { TIER_LIMITS, SubscriptionTier } from "@/lib/stripe/config";
import { getEffectiveTier } from "@/lib/stripe/stub";
import { UsageLimitError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";

const log = createLogger("UsageService");

export type UsageAction = "create_engagement" | "ai_query" | "sow_generation";

// PROMO period - all users get expanded access until this date
const PROMO_END_DATE = new Date("2026-03-15T23:59:59Z");
const PROMO_DAILY_AI_LIMIT = parseInt(process.env.PROMO_AI_QUERY_COUNT || "20", 10);

function isPromoPeriod(): boolean {
  return new Date() < PROMO_END_DATE;
}

export interface UsageInfo {
  tier: SubscriptionTier;
  counts: UsageCounts;
  limits: {
    engagements: number;
    ai_queries_per_month: number;
    sow_generations: number;
  };
  remaining: {
    engagements: number;
    ai_queries_per_month: number;
    sow_generations: number;
  };
  percentUsed: {
    engagements: number;
    ai_queries_per_month: number;
    sow_generations: number;
  };
}

export class UsageService {
  private usageRepo: UsageRepository;
  private profileRepo: ProfileRepository;

  constructor(private supabase: SupabaseClient) {
    this.usageRepo = new UsageRepository(supabase);
    this.profileRepo = new ProfileRepository(supabase);
  }

  /**
   * Get complete usage information for a user
   */
  async getUsageInfo(userId: string): Promise<UsageInfo> {
    const [profile, counts] = await Promise.all([
      this.profileRepo.findById(userId),
      this.usageRepo.getUsageCounts(userId),
    ]);

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Get effective tier (handles trial expiration)
    const tier = getEffectiveTier(
      profile.subscription_tier,
      profile.subscription_status,
      profile.trial_ends_at
    );
    const limits = TIER_LIMITS[tier];

    const remaining = {
      engagements: Math.max(0, limits.engagements - counts.engagements),
      ai_queries_per_month: Math.max(
        0,
        limits.ai_queries_per_month - counts.ai_queries_this_month
      ),
      sow_generations: Math.max(
        0,
        limits.sow_generations - counts.sow_generations
      ),
    };

    const percentUsed = {
      engagements:
        limits.engagements === 0
          ? 0
          : Math.round((counts.engagements / limits.engagements) * 100),
      ai_queries_per_month:
        limits.ai_queries_per_month === 0
          ? 0
          : Math.round(
              (counts.ai_queries_this_month / limits.ai_queries_per_month) * 100
            ),
      sow_generations:
        limits.sow_generations === 0
          ? 0
          : Math.round(
              (counts.sow_generations / limits.sow_generations) * 100
            ),
    };

    return {
      tier,
      counts,
      limits: {
        engagements: limits.engagements,
        ai_queries_per_month: limits.ai_queries_per_month,
        sow_generations: limits.sow_generations,
      },
      remaining,
      percentUsed,
    };
  }

  /**
   * Check if user can perform an action based on their tier limits
   * Returns true if allowed, throws UsageLimitError if not
   */
  async canPerformAction(userId: string, action: UsageAction): Promise<boolean> {
    const usage = await this.getUsageInfo(userId);

    switch (action) {
      case "create_engagement":
        if (usage.remaining.engagements <= 0) {
          log.warn("Engagement limit reached", { userId, tier: usage.tier });
          throw new UsageLimitError(
            "engagement_limit",
            `You've reached your limit of ${usage.limits.engagements} engagements. Upgrade to create more.`,
            {
              current: usage.counts.engagements,
              limit: usage.limits.engagements,
              tier: usage.tier,
            }
          );
        }
        break;

      case "ai_query":
        // PROMO: Allow up to 20 AI queries per day during promo period
        if (isPromoPeriod()) {
          if (usage.counts.ai_queries_today >= PROMO_DAILY_AI_LIMIT) {
            log.warn("PROMO daily AI limit reached", {
              userId,
              tier: usage.tier,
              today: usage.counts.ai_queries_today,
              limit: PROMO_DAILY_AI_LIMIT,
            });
            throw new UsageLimitError(
              "ai_query_limit",
              `You've used all ${PROMO_DAILY_AI_LIMIT} AI queries for today. Try again tomorrow!`,
              {
                current: usage.counts.ai_queries_today,
                limit: PROMO_DAILY_AI_LIMIT,
                tier: usage.tier,
                isPromo: true,
              }
            );
          }
          log.info("AI query allowed (PROMO period)", {
            userId,
            tier: usage.tier,
            todayUsed: usage.counts.ai_queries_today,
            dailyLimit: PROMO_DAILY_AI_LIMIT,
          });
          break;
        }
        if (usage.remaining.ai_queries_per_month <= 0) {
          log.warn("AI query limit reached", { userId, tier: usage.tier });
          throw new UsageLimitError(
            "ai_query_limit",
            `You've used all ${usage.limits.ai_queries_per_month} AI queries for this month. Upgrade for more.`,
            {
              current: usage.counts.ai_queries_this_month,
              limit: usage.limits.ai_queries_per_month,
              tier: usage.tier,
            }
          );
        }
        break;

      case "sow_generation":
        // PROMO: Allow SOW for all tiers during promo period
        if (isPromoPeriod()) {
          log.info("SOW generation allowed (PROMO period)", { userId, tier: usage.tier });
          break;
        }
        if (usage.limits.sow_generations === 0) {
          log.warn("SOW generation not available", { userId, tier: usage.tier });
          throw new UsageLimitError(
            "sow_not_available",
            "SOW generation is only available on Pro and Team plans.",
            { tier: usage.tier }
          );
        }
        if (usage.remaining.sow_generations <= 0) {
          log.warn("SOW generation limit reached", { userId, tier: usage.tier });
          throw new UsageLimitError(
            "sow_limit",
            `You've used all ${usage.limits.sow_generations} SOW generations. Upgrade for more.`,
            {
              current: usage.counts.sow_generations,
              limit: usage.limits.sow_generations,
              tier: usage.tier,
            }
          );
        }
        break;
    }

    return true;
  }

  /**
   * Log an AI interaction and track usage
   */
  async trackAIUsage(
    userId: string,
    engagementId: string | null,
    interactionType: string,
    inputData: Record<string, unknown>,
    outputData: Record<string, unknown>,
    options?: {
      latencyMs?: number;
      tokensUsed?: number;
      modelUsed?: string;
    }
  ): Promise<void> {
    await this.usageRepo.logAIInteraction(
      userId,
      engagementId,
      interactionType,
      inputData,
      outputData,
      options
    );
    log.info("AI usage tracked", { userId, interactionType });
  }
}
