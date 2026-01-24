/**
 * Canvas Population Prompt
 * FR-406: Auto-populate canvas from discovery
 *
 * Generates framework-specific content to populate canvas nodes.
 */

import { sanitizeForPrompt } from "../sanitize";
import type { PromptMetadata } from "./types";

export const CANVAS_PROMPT_METADATA: PromptMetadata = {
  id: "canvas-populate",
  version: "1.0.0",
  description: "Generates content to auto-populate framework nodes on canvas",
  lastUpdated: "2026-01-22",
  changelog: [
    "1.0.0 (2026-01-22): Initial version with SWOT, Porter, McKinsey 7S support",
  ],
};

export const CANVAS_POPULATE_PROMPT = `You are an expert management consultant. Based on the discovery information provided, generate content to populate a consulting framework.

Guidelines:
- Generate 3-5 items per section
- Each item should be a concise, actionable insight (1-2 sentences)
- Items should be specific to the client's situation
- Prioritize the most impactful insights
- Use professional consulting language

Framework-specific guidance:
- SWOT: Internal (Strengths, Weaknesses) and External (Opportunities, Threats)
- Porter: Analyze each of the 5 competitive forces
- McKinsey 7S: Cover Strategy, Structure, Systems, Shared Values, Style, Staff, Skills
- BMC: Business Model Canvas with 9 building blocks

Response format (JSON):
{
  "sections": {
    "sectionId": ["item 1", "item 2", "item 3"]
  }
}

For SWOT, use section IDs: strengths, weaknesses, opportunities, threats
For Porter, use section IDs: rivalry, suppliers, buyers, substitutes, entrants
For McKinsey 7S, use section IDs: strategy, structure, systems, shared_values, style, staff, skills
For BMC, use section IDs: key_partners, key_activities, key_resources, value_propositions, customer_relationships, channels, customer_segments, cost_structure, revenue_streams`;

export type PopulateFrameworkType = "swot" | "porter" | "mckinsey7s" | "bmc";

export interface CanvasContext {
  clientName: string;
  industry?: string;
}

export function buildCanvasPopulatePrompt(
  frameworkType: PopulateFrameworkType,
  discoveryAnswers: Array<{ question: string; answer: string }>,
  context: CanvasContext
): string {
  const safeClientName = sanitizeForPrompt(context.clientName, "short");
  const safeIndustry = context.industry
    ? sanitizeForPrompt(context.industry, "short")
    : null;

  const frameworkNames: Record<string, string> = {
    swot: "SWOT Analysis",
    porter: "Porter's Five Forces",
    mckinsey7s: "McKinsey 7-S Framework",
    bmc: "Business Model Canvas",
  };

  let prompt = `Framework: ${frameworkNames[frameworkType]}`;
  prompt += `\nClient: ${safeClientName}`;
  if (safeIndustry) {
    prompt += `\nIndustry: ${safeIndustry}`;
  }

  prompt += `\n\nDiscovery Answers:`;
  for (const qa of discoveryAnswers) {
    const safeQ = sanitizeForPrompt(qa.question, "medium");
    const safeA = sanitizeForPrompt(qa.answer, "medium");
    prompt += `\n\nQ: ${safeQ}\nA: ${safeA}`;
  }

  prompt += `\n\nBased on this information, generate content for the ${frameworkNames[frameworkType]}. Return your response as JSON with a "sections" object.`;

  return prompt;
}
