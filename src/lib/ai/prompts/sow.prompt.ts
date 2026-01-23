/**
 * SOW Generation Prompt
 * FR-501: Generate SOW
 *
 * Generates comprehensive Statement of Work from engagement data.
 */

import { sanitizeForPrompt } from "../sanitize";
import type { PromptMetadata } from "./types";

export const SOW_PROMPT_METADATA: PromptMetadata = {
  id: "sow-generate",
  version: "1.0.0",
  description: "Generates Statement of Work from discovery and framework data",
  lastUpdated: "2026-01-22",
  changelog: [
    "1.0.0 (2026-01-22): Initial version with executive summary, objectives, deliverables, timeline, assumptions, risks",
  ],
};

export const SOW_GENERATION_PROMPT = `You are an expert management consultant creating a Statement of Work (SOW) document. Generate a comprehensive, professional SOW based on the discovery information and framework analysis provided.

Guidelines:
- Be specific and tailored to the client's situation
- Include realistic timelines and deliverables
- Identify key risks and assumptions
- Use professional consulting language
- All content must be traceable to the provided inputs

Response format (JSON):
{
  "executive_summary": "2-3 paragraph overview of the engagement",
  "objectives": ["Objective 1", "Objective 2", "Objective 3"],
  "deliverables": [
    {
      "id": "D1",
      "name": "Deliverable name",
      "description": "Detailed description",
      "acceptance_criteria": ["Criterion 1", "Criterion 2"]
    }
  ],
  "timeline": [
    {
      "id": "P1",
      "name": "Phase name",
      "duration_weeks": 2,
      "deliverables": ["D1"],
      "dependencies": []
    }
  ],
  "assumptions": ["Assumption 1", "Assumption 2"],
  "risks": [
    {
      "id": "R1",
      "description": "Risk description",
      "likelihood": "high" | "medium" | "low",
      "impact": "high" | "medium" | "low",
      "mitigation": "Mitigation strategy"
    }
  ]
}

Important:
- Generate 3-5 objectives
- Generate 3-6 deliverables with 2-4 acceptance criteria each
- Create a realistic timeline with 2-4 phases
- Include 3-5 assumptions
- Identify 2-4 risks with mitigations`;

export interface SOWEngagement {
  title: string;
  clientName: string;
  industry?: string;
  description?: string;
}

export function buildSOWGenerationPrompt(
  engagement: SOWEngagement,
  discoveryAnswers: Array<{ question: string; answer: string }>,
  canvasInsights: string
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

  let prompt = `ENGAGEMENT DETAILS:
Title: ${safeTitle}
Client: ${safeClientName}`;

  if (safeIndustry) {
    prompt += `\nIndustry: ${safeIndustry}`;
  }
  if (safeDescription) {
    prompt += `\nDescription: ${safeDescription}`;
  }

  prompt += `\n\nDISCOVERY ANSWERS:`;
  for (const qa of discoveryAnswers) {
    const safeQ = sanitizeForPrompt(qa.question, "medium");
    const safeA = sanitizeForPrompt(qa.answer, "medium");
    prompt += `\n\nQ: ${safeQ}\nA: ${safeA}`;
  }

  prompt += `\n\nFRAMEWORK ANALYSIS (from canvas):
${safeCanvasInsights || "No framework analysis completed yet"}`;

  prompt += `\n\nBased on this information, generate a comprehensive Statement of Work. Return your response as JSON.`;

  return prompt;
}
