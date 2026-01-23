/**
 * AI Service
 * FR-402: AI follow-up questions
 * FR-405: Framework recommendations
 *
 * Handles AI interactions with usage tracking and limit enforcement
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { UsageService } from "@/services/usage.service";
import { generateCompletion, AIMessage } from "@/lib/ai/client";
import {
  DISCOVERY_SYSTEM_PROMPT,
  FRAMEWORK_RECOMMENDATION_PROMPT,
  DISCOVERY_SUMMARY_PROMPT,
  buildDiscoveryFollowUpPrompt,
  buildFrameworkRecommendationPrompt,
  buildDiscoverySummaryPrompt,
} from "@/lib/ai/prompts";
import { createLogger } from "@/lib/logger";

const log = createLogger("AIService");

export interface DiscoveryContext {
  clientName: string;
  industry?: string;
  previousAnswers?: Array<{ question: string; answer: string }>;
}

export interface FrameworkRecommendation {
  framework: "swot" | "porter" | "mckinsey7s" | "bmc";
  confidence: number;
  reasoning: string;
  focusAreas: string[];
}

export interface FrameworkRecommendationResult {
  recommendations: FrameworkRecommendation[];
  summary: string;
}

export class AIService {
  private usageService: UsageService;

  constructor(private supabase: SupabaseClient) {
    this.usageService = new UsageService(supabase);
  }

  /**
   * Generate a follow-up question for discovery
   * FR-402: AI follow-up questions
   */
  async generateFollowUpQuestion(
    userId: string,
    engagementId: string,
    question: string,
    answer: string,
    context: DiscoveryContext
  ): Promise<string | null> {
    // Check usage limits
    await this.usageService.canPerformAction(userId, "ai_query");

    log.info("Generating follow-up question", { userId, engagementId });

    const userPrompt = buildDiscoveryFollowUpPrompt(question, answer, context);
    const messages: AIMessage[] = [{ role: "user", content: userPrompt }];

    const result = await generateCompletion(messages, {
      systemPrompt: DISCOVERY_SYSTEM_PROMPT,
      maxTokens: 256,
      temperature: 0.7,
    });

    // Track usage with telemetry
    await this.usageService.trackAIUsage(
      userId,
      engagementId,
      "discovery",
      { question, answer, context },
      { followUp: result.content, requestId: result.requestId },
      {
        tokensUsed: result.tokensUsed.input + result.tokensUsed.output,
        modelUsed: result.model,
        latencyMs: result.latencyMs,
      }
    );

    // Check if no follow-up needed
    if (result.content.trim() === "NO_FOLLOWUP") {
      return null;
    }

    return result.content.trim();
  }

  /**
   * Generate framework recommendations based on discovery
   * FR-405: Framework recommendations
   */
  async generateFrameworkRecommendations(
    userId: string,
    engagementId: string,
    discoveryAnswers: Array<{ question: string; answer: string }>,
    context: { clientName: string; industry?: string; challenge?: string }
  ): Promise<FrameworkRecommendationResult> {
    // Check usage limits
    await this.usageService.canPerformAction(userId, "ai_query");

    log.info("Generating framework recommendations", { userId, engagementId });

    const userPrompt = buildFrameworkRecommendationPrompt(
      discoveryAnswers,
      context
    );
    const messages: AIMessage[] = [{ role: "user", content: userPrompt }];

    const result = await generateCompletion(messages, {
      systemPrompt: FRAMEWORK_RECOMMENDATION_PROMPT,
      maxTokens: 1024,
      temperature: 0.5,
    });

    // Track usage with telemetry
    await this.usageService.trackAIUsage(
      userId,
      engagementId,
      "framework_recommend",
      { discoveryAnswers, context },
      { recommendations: result.content, requestId: result.requestId },
      {
        tokensUsed: result.tokensUsed.input + result.tokensUsed.output,
        modelUsed: result.model,
        latencyMs: result.latencyMs,
      }
    );

    // Parse JSON response
    try {
      const parsed = JSON.parse(result.content);
      return {
        recommendations: parsed.recommendations || [],
        summary: parsed.summary || "",
      };
    } catch {
      log.warn("Failed to parse framework recommendations JSON", {
        content: result.content,
      });
      // Return default if parsing fails
      return {
        recommendations: [],
        summary: result.content,
      };
    }
  }

  /**
   * Generate discovery summary
   * FR-404: Discovery summary
   */
  async generateDiscoverySummary(
    userId: string,
    engagementId: string,
    discoveryAnswers: Array<{ question: string; answer: string }>,
    context: { clientName: string; industry?: string }
  ): Promise<string> {
    // Check usage limits
    await this.usageService.canPerformAction(userId, "ai_query");

    log.info("Generating discovery summary", { userId, engagementId });

    const userPrompt = buildDiscoverySummaryPrompt(discoveryAnswers, context);
    const messages: AIMessage[] = [{ role: "user", content: userPrompt }];

    const result = await generateCompletion(messages, {
      systemPrompt: DISCOVERY_SUMMARY_PROMPT,
      maxTokens: 512,
      temperature: 0.5,
    });

    // Track usage with telemetry
    await this.usageService.trackAIUsage(
      userId,
      engagementId,
      "discovery",
      { discoveryAnswers, context },
      { summary: result.content, requestId: result.requestId },
      {
        tokensUsed: result.tokensUsed.input + result.tokensUsed.output,
        modelUsed: result.model,
        latencyMs: result.latencyMs,
      }
    );

    return result.content.trim();
  }
}
