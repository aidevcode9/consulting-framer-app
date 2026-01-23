/**
 * Proposal Generation Prompt
 * FR-502: Generate Proposal
 *
 * Generates client-facing proposal documents from engagement data.
 * Unlike SOW (internal scope), proposals are sales-focused and client-oriented.
 */

import { sanitizeForPrompt } from "../sanitize";
import type { PromptMetadata } from "./types";

export const PROPOSAL_PROMPT_METADATA: PromptMetadata = {
  id: "proposal-generate",
  version: "1.0.0",
  description: "Generates client-facing proposal from discovery and framework data",
  lastUpdated: "2026-01-22",
  changelog: [
    "1.0.0 (2026-01-22): Initial version with executive summary, situation analysis, approach, benefits, methodology, investment",
  ],
};

export const PROPOSAL_GENERATION_PROMPT = `You are an expert management consultant creating a professional consulting proposal. Generate a compelling, client-facing proposal based on the discovery information and framework analysis provided.

Guidelines:
- Write from the perspective of a consulting firm pitching to the client
- Focus on VALUE to the client, not just what you'll do
- Be persuasive but not overselling
- Use professional but accessible language
- Include specific details from the discovery to show you understand their situation
- Make the investment section positive ("investment" not "cost")

Response format (JSON):
{
  "executive_summary": "2-3 paragraph compelling overview that hooks the reader",
  "situation_analysis": "1-2 paragraphs showing you understand their challenges and context",
  "proposed_approach": "2-3 paragraphs describing your methodology and how you'll solve their problem",
  "key_benefits": ["Benefit 1 with specific outcome", "Benefit 2", "Benefit 3", "Benefit 4"],
  "methodology": [
    {
      "phase": "Phase 1: Discovery",
      "description": "Brief description of what happens",
      "duration": "2 weeks",
      "outcomes": ["Outcome 1", "Outcome 2"]
    }
  ],
  "investment": {
    "summary": "Brief investment overview paragraph",
    "options": [
      {
        "name": "Recommended Engagement",
        "description": "Full scope engagement",
        "price_range": "$50,000 - $75,000",
        "includes": ["Item 1", "Item 2"]
      }
    ],
    "terms": "Standard payment terms description"
  },
  "next_steps": ["Schedule kickoff call", "Sign engagement letter", "Begin discovery phase"],
  "why_us": "Brief paragraph on why your firm is the right choice"
}

Important:
- Generate 4-6 key benefits that resonate with business outcomes
- Create 3-4 methodology phases with clear outcomes
- Include at least one investment option (can include alternatives)
- Make next_steps actionable and specific`;

export interface ProposalEngagement {
  title: string;
  clientName: string;
  industry?: string;
  description?: string;
}

export function buildProposalGenerationPrompt(
  engagement: ProposalEngagement,
  discoveryAnswers: Array<{ question: string; answer: string }>,
  canvasInsights: string,
  sowSummary?: string
): string {
  const safeTitle = sanitizeForPrompt(engagement.title, "short");
  const safeClientName = sanitizeForPrompt(engagement.clientName, "short");
  const safeIndustry = engagement.industry
    ? sanitizeForPrompt(engagement.industry, "short")
    : null;
  const safeDescription = engagement.description
    ? sanitizeForPrompt(engagement.description, "medium")
    : null;
  const safeCanvasInsights = sanitizeForPrompt(canvasInsights, "long");
  const safeSowSummary = sowSummary
    ? sanitizeForPrompt(sowSummary, "long")
    : null;

  let prompt = `ENGAGEMENT DETAILS:
Title: ${safeTitle}
Client: ${safeClientName}`;

  if (safeIndustry) {
    prompt += `\nIndustry: ${safeIndustry}`;
  }
  if (safeDescription) {
    prompt += `\nDescription: ${safeDescription}`;
  }

  prompt += `\n\nDISCOVERY ANSWERS (client's perspective):`;
  for (const qa of discoveryAnswers) {
    const safeQ = sanitizeForPrompt(qa.question, "medium");
    const safeA = sanitizeForPrompt(qa.answer, "medium");
    prompt += `\n\nQ: ${safeQ}\nA: ${safeA}`;
  }

  prompt += `\n\nFRAMEWORK ANALYSIS (from canvas):
${safeCanvasInsights || "No framework analysis completed yet"}`;

  if (safeSowSummary) {
    prompt += `\n\nSOW CONTEXT (for scope alignment):
${safeSowSummary}`;
  }

  prompt += `\n\nBased on this information, generate a compelling client-facing proposal. Return your response as JSON.`;

  return prompt;
}
