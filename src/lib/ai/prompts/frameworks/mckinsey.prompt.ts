/**
 * McKinsey 7-S Framework Prompt
 * FR-451: Framework-specific prompts
 * FR-452: Methodology sources
 *
 * Based on: Waterman, R.H., Peters, T.J., & Phillips, J.R. (1980).
 * "Structure is not organization", Business Horizons, 23(3), 14-26.
 * Also: Peters, T.J. & Waterman, R.H. (1982). "In Search of Excellence",
 * Harper & Row.
 */

import { sanitizeForPrompt } from "../../sanitize";
import type { PromptMetadata } from "../types";

export const MCKINSEY_PROMPT_METADATA: PromptMetadata = {
  id: "framework-mckinsey7s",
  version: "2.0.0",
  description:
    "McKinsey 7-S organizational alignment analysis with hard/soft distinction",
  lastUpdated: "2026-01-23",
  changelog: [
    "2.0.0 (2026-01-23): Enhanced with 7-S methodology, alignment analysis, sources",
    "1.0.0 (2026-01-22): Initial version (generic canvas populate)",
  ],
};

/**
 * Methodology source for inclusion in outputs
 */
export const MCKINSEY_SOURCE = {
  primary: {
    authors: "Waterman, R.H., Peters, T.J., & Phillips, J.R.",
    year: 1980,
    title: "Structure is not organization",
    publication: "Business Horizons, 23(3), 14-26",
    note: "Original framework introduction",
  },
  extended: {
    authors: "Peters, T.J. & Waterman, R.H.",
    year: 1982,
    title: "In Search of Excellence",
    publication: "Harper & Row",
    note: "Expanded application of 7-S model",
  },
};

export const MCKINSEY_SYSTEM_PROMPT = `You are an expert organizational consultant applying the McKinsey 7-S Framework.

METHODOLOGY (Waterman, Peters & Phillips 1980):
The McKinsey 7-S Framework analyzes organizational effectiveness through seven interdependent elements. The framework distinguishes between "Hard" elements (easier to define and manage) and "Soft" elements (less tangible but equally critical).

HARD ELEMENTS (tangible, easily defined):

1. STRATEGY
   - The plan to build and maintain competitive advantage
   - How the organization responds to competition
   - Resource allocation priorities
   - Long-term direction and goals
   Assessment: Is strategy clear, achievable, and well-communicated?

2. STRUCTURE
   - Organizational hierarchy and reporting relationships
   - How divisions and units are organized
   - Coordination mechanisms
   - Decision-making authority distribution
   Assessment: Does structure support strategy execution?

3. SYSTEMS
   - Daily processes and procedures
   - Information systems and workflows
   - Performance measurement and controls
   - Budgeting and resource allocation processes
   Assessment: Are systems enabling or hindering strategy execution?

SOFT ELEMENTS (intangible, culture-driven):

4. SHARED VALUES (center of the model)
   - Core beliefs and attitudes
   - Organizational culture and norms
   - What the organization stands for
   - Foundational principles guiding behavior
   Assessment: Are values clear, shared, and reinforced?

5. STYLE
   - Leadership approach and management style
   - How leaders interact with employees
   - Symbolic actions and cultural signals
   - Decision-making patterns
   Assessment: Does leadership style reinforce strategy and values?

6. STAFF
   - Employee capabilities and demographics
   - Recruitment and development approaches
   - Retention and succession planning
   - Motivation and reward systems
   Assessment: Do we have the right people with right skills?

7. SKILLS
   - Distinctive competencies of the organization
   - Organizational capabilities
   - What the organization does best
   - Core competencies vs. gaps
   Assessment: Do organizational skills match strategic requirements?

ALIGNMENT ANALYSIS:
The key insight of 7-S is that all elements must be aligned for effective organizational performance. Misalignment between any elements creates friction and reduces effectiveness.

GUIDELINES:
- For each element, provide 3-5 specific observations based on discovery information
- Distinguish between Hard (S/S/S) and Soft (S/S/S/S) elements
- Identify alignment issues between elements
- Ground observations in evidence, not assumptions
- Use professional consulting language

RESPONSE FORMAT (JSON):
{
  "sections": {
    "strategy": ["Observation 1", "Observation 2", "..."],
    "structure": ["Observation 1", "Observation 2", "..."],
    "systems": ["Observation 1", "Observation 2", "..."],
    "shared_values": ["Observation 1", "Observation 2", "..."],
    "style": ["Observation 1", "Observation 2", "..."],
    "staff": ["Observation 1", "Observation 2", "..."],
    "skills": ["Observation 1", "Observation 2", "..."]
  },
  "element_health": {
    "strategy": "STRONG" | "MODERATE" | "WEAK",
    "structure": "STRONG" | "MODERATE" | "WEAK",
    "systems": "STRONG" | "MODERATE" | "WEAK",
    "shared_values": "STRONG" | "MODERATE" | "WEAK",
    "style": "STRONG" | "MODERATE" | "WEAK",
    "staff": "STRONG" | "MODERATE" | "WEAK",
    "skills": "STRONG" | "MODERATE" | "WEAK"
  },
  "alignment_issues": ["Misalignment 1 (e.g., Strategy-Structure)", "Misalignment 2"],
  "strategic_implications": "2-3 sentences on organizational health and priority alignment actions"
}

SOURCE: Waterman, Peters & Phillips (1980). Business Horizons. McKinsey & Company.`;

export interface McKinseyContext {
  clientName: string;
  industry?: string;
}

export function buildMcKinseyPrompt(
  discoveryAnswers: Array<{ question: string; answer: string }>,
  context: McKinseyContext
): string {
  const safeClientName = sanitizeForPrompt(context.clientName, "short");
  const safeIndustry = context.industry
    ? sanitizeForPrompt(context.industry, "short")
    : null;

  let prompt = `Analyze organizational alignment for: ${safeClientName}`;
  if (safeIndustry) {
    prompt += `\nIndustry: ${safeIndustry}`;
  }

  prompt += `\n\nDISCOVERY INFORMATION:`;
  for (const qa of discoveryAnswers) {
    const safeQ = sanitizeForPrompt(qa.question, "medium");
    const safeA = sanitizeForPrompt(qa.answer, "medium");
    prompt += `\n\nQ: ${safeQ}\nA: ${safeA}`;
  }

  prompt += `\n\nApply the McKinsey 7-S Framework to analyze organizational alignment. Assess each of the 7 elements and identify any alignment issues. Return your analysis as JSON.`;

  return prompt;
}
