/**
 * Discovery Summary Prompt
 * FR-404: Discovery summary
 *
 * Generates executive summary from discovery answers.
 */

import { sanitizeForPrompt } from "../sanitize";
import type { PromptMetadata } from "./types";

export const SUMMARY_PROMPT_METADATA: PromptMetadata = {
  id: "discovery-summary",
  version: "1.0.0",
  description: "Generates executive summary from discovery data",
  lastUpdated: "2026-01-22",
  changelog: [
    "1.0.0 (2026-01-22): Initial version with 2-3 paragraph format",
  ],
};

export const DISCOVERY_SUMMARY_PROMPT = `You are an expert management consultant. Generate a concise executive summary based on the discovery information provided.

Guidelines:
- Keep it to 2-3 paragraphs
- Highlight the key business challenge
- Summarize critical constraints and success criteria
- Note any risks or dependencies identified
- Be professional and actionable

Response format:
Return the summary as plain text, formatted with clear paragraphs.`;

export interface SummaryContext {
  clientName: string;
  industry?: string;
}

export function buildDiscoverySummaryPrompt(
  discoveryAnswers: Array<{ question: string; answer: string }>,
  context: SummaryContext
): string {
  const safeClientName = sanitizeForPrompt(context.clientName, "short");
  const safeIndustry = context.industry
    ? sanitizeForPrompt(context.industry, "short")
    : null;

  let prompt = `Client: ${safeClientName}`;
  if (safeIndustry) {
    prompt += `\nIndustry: ${safeIndustry}`;
  }

  prompt += `\n\nDiscovery Answers:`;
  for (const qa of discoveryAnswers) {
    const safeQ = sanitizeForPrompt(qa.question, "medium");
    const safeA = sanitizeForPrompt(qa.answer, "medium");
    prompt += `\n\nQ: ${safeQ}\nA: ${safeA}`;
  }

  prompt += `\n\nGenerate a concise executive summary of this discovery information.`;

  return prompt;
}
