/**
 * AI Service
 * FR-402: AI follow-up questions
 * FR-405: Framework recommendations
 * FR-501: SOW generation
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
  CANVAS_POPULATE_PROMPT,
  SOW_GENERATION_PROMPT,
  PROPOSAL_GENERATION_PROMPT,
  buildDiscoveryFollowUpPrompt,
  buildFrameworkRecommendationPrompt,
  buildDiscoverySummaryPrompt,
  buildCanvasPopulatePrompt,
  buildSOWGenerationPrompt,
  buildProposalGenerationPrompt,
  type DiscoveryContext,
  type PopulateFrameworkType,
} from "@/lib/ai/prompts";
import { detectInjectionAttempt } from "@/lib/ai/sanitize";
import { createLogger } from "@/lib/logger";
import type { GeneratedScope, GeneratedProposal, CanvasData, Engagement } from "@/types";

const log = createLogger("AIService");

// Re-export for backwards compatibility
export type { DiscoveryContext };

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

// Re-export PopulateFrameworkType for backwards compatibility
export type { PopulateFrameworkType };

export interface CanvasPopulateResult {
  sections: Record<string, string[]>;
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

    // Log potential injection attempts (inputs are sanitized in prompts.ts)
    if (detectInjectionAttempt(answer) || detectInjectionAttempt(context.clientName)) {
      log.warn("Potential prompt injection detected", {
        userId,
        engagementId,
        field: detectInjectionAttempt(answer) ? "answer" : "clientName",
      });
    }

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

    // Log potential injection attempts (inputs are sanitized in prompts.ts)
    const suspiciousAnswers = discoveryAnswers.filter((qa) =>
      detectInjectionAttempt(qa.answer)
    );
    if (suspiciousAnswers.length > 0 || detectInjectionAttempt(context.clientName)) {
      log.warn("Potential prompt injection detected", {
        userId,
        engagementId,
        suspiciousCount: suspiciousAnswers.length,
      });
    }

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

    // Log potential injection attempts (inputs are sanitized in prompts.ts)
    const suspiciousAnswers = discoveryAnswers.filter((qa) =>
      detectInjectionAttempt(qa.answer)
    );
    if (suspiciousAnswers.length > 0 || detectInjectionAttempt(context.clientName)) {
      log.warn("Potential prompt injection detected", {
        userId,
        engagementId,
        suspiciousCount: suspiciousAnswers.length,
      });
    }

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

  /**
   * Generate content to populate a framework on the canvas
   * FR-406: Auto-populate canvas
   */
  async generateCanvasContent(
    userId: string,
    engagementId: string,
    frameworkType: PopulateFrameworkType,
    discoveryAnswers: Array<{ question: string; answer: string }>,
    context: { clientName: string; industry?: string }
  ): Promise<CanvasPopulateResult> {
    // Check usage limits
    await this.usageService.canPerformAction(userId, "ai_query");

    // Log potential injection attempts (inputs are sanitized in prompts.ts)
    const suspiciousAnswers = discoveryAnswers.filter((qa) =>
      detectInjectionAttempt(qa.answer)
    );
    if (suspiciousAnswers.length > 0 || detectInjectionAttempt(context.clientName)) {
      log.warn("Potential prompt injection detected", {
        userId,
        engagementId,
        suspiciousCount: suspiciousAnswers.length,
      });
    }

    log.info("Generating canvas content", { userId, engagementId, frameworkType });

    const userPrompt = buildCanvasPopulatePrompt(
      frameworkType,
      discoveryAnswers,
      context
    );
    const messages: AIMessage[] = [{ role: "user", content: userPrompt }];

    const result = await generateCompletion(messages, {
      systemPrompt: CANVAS_POPULATE_PROMPT,
      maxTokens: 1024,
      temperature: 0.6,
    });

    // Track usage with telemetry
    await this.usageService.trackAIUsage(
      userId,
      engagementId,
      "canvas_populate",
      { frameworkType, discoveryAnswers, context },
      { content: result.content, requestId: result.requestId },
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
        sections: parsed.sections || {},
      };
    } catch {
      log.warn("Failed to parse canvas populate JSON", {
        content: result.content,
      });
      // Return empty sections if parsing fails
      return {
        sections: {},
      };
    }
  }

  /**
   * Generate Statement of Work from engagement data
   * FR-501: Generate SOW
   */
  async generateSOW(
    userId: string,
    engagement: Engagement
  ): Promise<GeneratedScope> {
    // Check usage limits - SOW generation is a separate limit
    await this.usageService.canPerformAction(userId, "sow_generation");

    // Log potential injection attempts
    if (detectInjectionAttempt(engagement.client_name) || detectInjectionAttempt(engagement.title)) {
      log.warn("Potential prompt injection detected in SOW generation", {
        userId,
        engagementId: engagement.id,
      });
    }

    log.info("Generating SOW", { userId, engagementId: engagement.id });

    // Extract canvas insights from framework data
    const canvasInsights = this.extractCanvasInsights(engagement.canvas_data);

    // Convert discovery answers to array format
    const discoveryAnswers = this.formatDiscoveryAnswers(engagement.discovery_answers);

    const userPrompt = buildSOWGenerationPrompt(
      {
        title: engagement.title,
        clientName: engagement.client_name,
        industry: engagement.client_industry || undefined,
        description: engagement.description || undefined,
      },
      discoveryAnswers,
      canvasInsights
    );

    const messages: AIMessage[] = [{ role: "user", content: userPrompt }];

    const result = await generateCompletion(messages, {
      systemPrompt: SOW_GENERATION_PROMPT,
      maxTokens: 4096, // SOW generation needs more tokens
      temperature: 0.4, // Lower temperature for more consistent output
      timeoutMs: 60000, // 60 second timeout for SOW generation
    });

    // Track usage with telemetry
    await this.usageService.trackAIUsage(
      userId,
      engagement.id,
      "scope_generate",
      {
        engagementId: engagement.id,
        clientName: engagement.client_name,
        discoveryAnswersCount: discoveryAnswers.length,
      },
      { sow: result.content, requestId: result.requestId },
      {
        tokensUsed: result.tokensUsed.input + result.tokensUsed.output,
        modelUsed: result.model,
        latencyMs: result.latencyMs,
      }
    );

    // Parse JSON response
    try {
      const parsed = JSON.parse(result.content) as GeneratedScope;

      // Ensure all required fields exist with defaults
      return {
        executive_summary: parsed.executive_summary || "",
        objectives: parsed.objectives || [],
        deliverables: parsed.deliverables || [],
        timeline: parsed.timeline || [],
        assumptions: parsed.assumptions || [],
        risks: parsed.risks || [],
        pricing: parsed.pricing,
      };
    } catch {
      log.error("Failed to parse SOW JSON", {
        userId,
        engagementId: engagement.id,
        content: result.content.slice(0, 500),
      });
      // Return empty SOW structure if parsing fails
      return {
        executive_summary: "Error generating SOW. Please try again.",
        objectives: [],
        deliverables: [],
        timeline: [],
        assumptions: [],
        risks: [],
      };
    }
  }

  /**
   * Extract insights from canvas data for SOW generation
   */
  private extractCanvasInsights(canvasData: CanvasData): string {
    const insights: string[] = [];

    for (const node of canvasData.nodes) {
      if (node.data.items && node.data.items.length > 0) {
        const itemTexts = node.data.items.map((item) => `  - ${item.text}`).join("\n");
        insights.push(`${node.data.label || node.type}:\n${itemTexts}`);
      }
    }

    return insights.length > 0
      ? insights.join("\n\n")
      : "No framework analysis completed yet";
  }

  /**
   * Format discovery answers for prompt
   */
  private formatDiscoveryAnswers(
    answers: Record<string, unknown>
  ): Array<{ question: string; answer: string }> {
    const result: Array<{ question: string; answer: string }> = [];

    for (const [questionId, answerData] of Object.entries(answers)) {
      if (answerData && typeof answerData === "object") {
        const answer = answerData as { value?: unknown; question_id?: string };
        if (answer.value !== undefined) {
          result.push({
            question: questionId,
            answer: String(answer.value),
          });
        }
      }
    }

    return result;
  }

  /**
   * Generate client-facing proposal from engagement data
   * FR-502: Generate Proposal
   */
  async generateProposal(
    userId: string,
    engagement: Engagement,
    sowSummary?: string
  ): Promise<GeneratedProposal> {
    // Check usage limits - proposal generation uses same limit as SOW
    await this.usageService.canPerformAction(userId, "sow_generation");

    // Log potential injection attempts
    if (detectInjectionAttempt(engagement.client_name) || detectInjectionAttempt(engagement.title)) {
      log.warn("Potential prompt injection detected in proposal generation", {
        userId,
        engagementId: engagement.id,
      });
    }

    log.info("Generating proposal", { userId, engagementId: engagement.id });

    // Extract canvas insights from framework data
    const canvasInsights = this.extractCanvasInsights(engagement.canvas_data);

    // Convert discovery answers to array format
    const discoveryAnswers = this.formatDiscoveryAnswers(engagement.discovery_answers);

    const userPrompt = buildProposalGenerationPrompt(
      {
        title: engagement.title,
        clientName: engagement.client_name,
        industry: engagement.client_industry || undefined,
        description: engagement.description || undefined,
      },
      discoveryAnswers,
      canvasInsights,
      sowSummary
    );

    const messages: AIMessage[] = [{ role: "user", content: userPrompt }];

    const result = await generateCompletion(messages, {
      systemPrompt: PROPOSAL_GENERATION_PROMPT,
      maxTokens: 4096, // Proposal generation needs similar tokens to SOW
      temperature: 0.5, // Slightly higher than SOW for more creative language
      timeoutMs: 60000, // 60 second timeout
    });

    // Track usage with telemetry
    await this.usageService.trackAIUsage(
      userId,
      engagement.id,
      "scope_generate", // Using same type as SOW for now
      {
        engagementId: engagement.id,
        clientName: engagement.client_name,
        discoveryAnswersCount: discoveryAnswers.length,
        type: "proposal",
      },
      { proposal: result.content, requestId: result.requestId },
      {
        tokensUsed: result.tokensUsed.input + result.tokensUsed.output,
        modelUsed: result.model,
        latencyMs: result.latencyMs,
      }
    );

    // Parse JSON response
    try {
      const parsed = JSON.parse(result.content) as GeneratedProposal;

      // Ensure all required fields exist with defaults
      return {
        executive_summary: parsed.executive_summary || "",
        situation_analysis: parsed.situation_analysis || "",
        proposed_approach: parsed.proposed_approach || "",
        key_benefits: parsed.key_benefits || [],
        methodology: parsed.methodology || [],
        investment: parsed.investment || {
          summary: "",
          options: [],
          terms: "",
        },
        next_steps: parsed.next_steps || [],
        why_us: parsed.why_us || "",
      };
    } catch {
      log.error("Failed to parse proposal JSON", {
        userId,
        engagementId: engagement.id,
        content: result.content.slice(0, 500),
      });
      // Return empty proposal structure if parsing fails
      return {
        executive_summary: "Error generating proposal. Please try again.",
        situation_analysis: "",
        proposed_approach: "",
        key_benefits: [],
        methodology: [],
        investment: {
          summary: "",
          options: [],
          terms: "",
        },
        next_steps: [],
        why_us: "",
      };
    }
  }
}
