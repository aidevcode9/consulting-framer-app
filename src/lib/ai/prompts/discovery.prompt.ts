/**
 * Discovery Follow-up Prompt
 * FR-402: AI follow-up questions
 *
 * Generates contextual follow-up questions during discovery.
 */

import { sanitizeForPrompt } from "../sanitize";
import type { PromptMetadata } from "./types";

export const DISCOVERY_PROMPT_METADATA: PromptMetadata = {
  id: "discovery-followup",
  version: "1.0.0",
  description: "Generates follow-up questions during client discovery",
  lastUpdated: "2026-01-22",
  changelog: [
    "1.0.0 (2026-01-22): Initial version with category-aware follow-ups",
  ],
};

export const DISCOVERY_SYSTEM_PROMPT = `You are an expert management consultant helping gather information for a consulting engagement. Your role is to ask insightful follow-up questions that help clarify the client's situation.

Guidelines:
- Ask ONE focused follow-up question at a time
- Questions should be open-ended but specific
- Probe deeper into vague or incomplete answers
- Focus on understanding root causes, not just symptoms
- Consider business impact, stakeholders, and constraints
- Be professional but conversational
- If the answer is already comprehensive, acknowledge it and move on

Response format:
Return ONLY the follow-up question, nothing else. No preamble, no explanation.
If no follow-up is needed, respond with exactly: "NO_FOLLOWUP"`;

export interface DiscoveryContext {
  clientName: string;
  industry?: string;
  previousAnswers?: Array<{ question: string; answer: string }>;
}

export function buildDiscoveryFollowUpPrompt(
  question: string,
  answer: string,
  context: DiscoveryContext
): string {
  const safeClientName = sanitizeForPrompt(context.clientName, "short");
  const safeIndustry = context.industry
    ? sanitizeForPrompt(context.industry, "short")
    : null;
  const safeQuestion = sanitizeForPrompt(question, "medium");
  const safeAnswer = sanitizeForPrompt(answer, "medium");

  let prompt = `Client: ${safeClientName}`;
  if (safeIndustry) {
    prompt += `\nIndustry: ${safeIndustry}`;
  }

  if (context.previousAnswers && context.previousAnswers.length > 0) {
    prompt += `\n\nPrevious discovery answers:`;
    for (const qa of context.previousAnswers.slice(-3)) {
      const safeQ = sanitizeForPrompt(qa.question, "medium");
      const safeA = sanitizeForPrompt(qa.answer, "medium");
      prompt += `\nQ: ${safeQ}\nA: ${safeA}`;
    }
  }

  prompt += `\n\nCurrent question: ${safeQuestion}`;
  prompt += `\nClient's answer: ${safeAnswer}`;
  prompt += `\n\nGenerate a follow-up question to clarify or expand on this answer, or respond with "NO_FOLLOWUP" if the answer is complete.`;

  return prompt;
}
