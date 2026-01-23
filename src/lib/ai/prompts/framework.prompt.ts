/**
 * Framework Recommendation Prompt
 * FR-405: Framework recommendations
 *
 * Analyzes discovery data and recommends appropriate consulting frameworks.
 */

import { sanitizeForPrompt } from "../sanitize";
import type { PromptMetadata } from "./types";

export const FRAMEWORK_PROMPT_METADATA: PromptMetadata = {
  id: "framework-recommend",
  version: "1.0.0",
  description: "Recommends consulting frameworks based on discovery",
  lastUpdated: "2026-01-22",
  changelog: [
    "1.0.0 (2026-01-22): Initial version with SWOT, Porter, McKinsey, BMC support",
  ],
};

export const FRAMEWORK_RECOMMENDATION_PROMPT = `You are an expert management consultant. Based on the discovery information provided, recommend the most appropriate consulting frameworks for this engagement.

Available frameworks:
1. SWOT Analysis - For strategic planning, understanding competitive position
2. Porter's Five Forces - For industry analysis, competitive dynamics
3. McKinsey 7-S - For organizational alignment, change management
4. Business Model Canvas - For business model innovation, startup planning

Guidelines:
- Recommend 1-3 frameworks that best fit the client's situation
- Explain WHY each framework is relevant to their specific challenge
- Suggest focus areas within each framework
- Consider the engagement scope and timeline

Response format (JSON):
{
  "recommendations": [
    {
      "framework": "swot" | "porter" | "mckinsey7s" | "bmc",
      "confidence": 0.0-1.0,
      "reasoning": "Why this framework fits",
      "focusAreas": ["Area 1", "Area 2"]
    }
  ],
  "summary": "Brief overall recommendation summary"
}`;

export interface FrameworkContext {
  clientName: string;
  industry?: string;
  challenge?: string;
}

export function buildFrameworkRecommendationPrompt(
  discoveryAnswers: Array<{ question: string; answer: string }>,
  context: FrameworkContext
): string {
  const safeClientName = sanitizeForPrompt(context.clientName, "short");
  const safeIndustry = context.industry
    ? sanitizeForPrompt(context.industry, "short")
    : null;
  const safeChallenge = context.challenge
    ? sanitizeForPrompt(context.challenge, "medium")
    : null;

  let prompt = `Client: ${safeClientName}`;
  if (safeIndustry) {
    prompt += `\nIndustry: ${safeIndustry}`;
  }
  if (safeChallenge) {
    prompt += `\nPrimary Challenge: ${safeChallenge}`;
  }

  prompt += `\n\nDiscovery Answers:`;
  for (const qa of discoveryAnswers) {
    const safeQ = sanitizeForPrompt(qa.question, "medium");
    const safeA = sanitizeForPrompt(qa.answer, "medium");
    prompt += `\n\nQ: ${safeQ}\nA: ${safeA}`;
  }

  prompt += `\n\nBased on this information, recommend the most appropriate consulting frameworks. Return your response as JSON.`;

  return prompt;
}
