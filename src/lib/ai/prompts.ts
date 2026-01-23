/**
 * AI Prompts for Consulting Framer
 * FR-402: AI follow-up questions
 * FR-405: Framework recommendations
 *
 * All user inputs are sanitized to defend against prompt injection.
 */

import { sanitizeForPrompt } from "./sanitize";

/**
 * System prompt for discovery follow-up questions
 */
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

/**
 * Build user message for discovery follow-up
 */
export function buildDiscoveryFollowUpPrompt(
  question: string,
  answer: string,
  context: {
    clientName: string;
    industry?: string;
    previousAnswers?: Array<{ question: string; answer: string }>;
  }
): string {
  // Sanitize all user inputs
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

/**
 * System prompt for framework recommendations
 */
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

/**
 * Build user message for framework recommendations
 */
export function buildFrameworkRecommendationPrompt(
  discoveryAnswers: Array<{ question: string; answer: string }>,
  context: {
    clientName: string;
    industry?: string;
    challenge?: string;
  }
): string {
  // Sanitize all user inputs
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

/**
 * System prompt for discovery summary generation
 */
export const DISCOVERY_SUMMARY_PROMPT = `You are an expert management consultant. Generate a concise executive summary based on the discovery information provided.

Guidelines:
- Keep it to 2-3 paragraphs
- Highlight the key business challenge
- Summarize critical constraints and success criteria
- Note any risks or dependencies identified
- Be professional and actionable

Response format:
Return the summary as plain text, formatted with clear paragraphs.`;

/**
 * Build user message for discovery summary
 */
export function buildDiscoverySummaryPrompt(
  discoveryAnswers: Array<{ question: string; answer: string }>,
  context: {
    clientName: string;
    industry?: string;
  }
): string {
  // Sanitize all user inputs
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
