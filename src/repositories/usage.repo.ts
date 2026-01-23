import { SupabaseClient } from "@supabase/supabase-js";
import { createLogger } from "@/lib/logger";

const log = createLogger("UsageRepo");

export interface UsageCounts {
  engagements: number;
  ai_queries_this_month: number;
  sow_generations: number;
}

export class UsageRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get current usage counts for a user
   */
  async getUsageCounts(userId: string): Promise<UsageCounts> {
    // Get start of current month for AI query counting
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Run all queries in parallel
    const [engagementsResult, aiQueriesResult, sowResult] = await Promise.all([
      // Count engagements (excluding archived/on_hold)
      this.supabase
        .from("engagements")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .neq("status", "on_hold"),

      // Count AI interactions this month
      this.supabase
        .from("ai_interactions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", startOfMonth.toISOString()),

      // Count SOW deliverables
      this.supabase
        .from("deliverables")
        .select("id, engagements!inner(user_id)", { count: "exact", head: true })
        .eq("type", "sow")
        .eq("engagements.user_id", userId),
    ]);

    if (engagementsResult.error) {
      log.error("Failed to count engagements", engagementsResult.error);
    }
    if (aiQueriesResult.error) {
      log.error("Failed to count AI queries", aiQueriesResult.error);
    }
    if (sowResult.error) {
      log.error("Failed to count SOW generations", sowResult.error);
    }

    return {
      engagements: engagementsResult.count ?? 0,
      ai_queries_this_month: aiQueriesResult.count ?? 0,
      sow_generations: sowResult.count ?? 0,
    };
  }

  /**
   * Log an AI interaction for tracking
   */
  async logAIInteraction(
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
    const { error } = await this.supabase.from("ai_interactions").insert({
      user_id: userId,
      engagement_id: engagementId,
      interaction_type: interactionType,
      input_data: inputData,
      output_data: outputData,
      latency_ms: options?.latencyMs,
      tokens_used: options?.tokensUsed,
      model_used: options?.modelUsed,
    });

    if (error) {
      log.error("Failed to log AI interaction", error);
      throw error;
    }
  }
}
