/**
 * SWOT Analysis Prompt
 * FR-451: Framework-specific prompts
 * FR-452: Methodology sources
 *
 * Origins: Often attributed to Albert Humphrey (Stanford Research Institute, 1960s-70s),
 * though exact origins are debated. TOWS extension by Heinz Weihrich (1982).
 *
 * Sources:
 * - Humphrey, A. (2005). "SWOT Analysis for Management Consulting", SRI Alumni Newsletter
 * - Weihrich, H. (1982). "The TOWS Matrix—A Tool for Situational Analysis",
 *   Long Range Planning, 15(2), 54-66.
 */

import { sanitizeForPrompt } from "../../sanitize";
import type { PromptMetadata } from "../types";

export const SWOT_PROMPT_METADATA: PromptMetadata = {
  id: "framework-swot",
  version: "2.0.0",
  description:
    "SWOT Analysis with TOWS matrix and strategic options generation",
  lastUpdated: "2026-01-23",
  changelog: [
    "2.0.0 (2026-01-23): Enhanced with TOWS matrix, strategic options, sources",
    "1.0.0 (2026-01-22): Initial version (generic canvas populate)",
  ],
};

/**
 * Methodology sources for inclusion in outputs
 */
export const SWOT_SOURCE = {
  swot: {
    author: "Humphrey, A.",
    year: 1960,
    title: "SWOT Analysis origins",
    publication: "Stanford Research Institute (SRI International)",
    note: "Framework development during SRI planning research",
  },
  tows: {
    author: "Weihrich, H.",
    year: 1982,
    title: "The TOWS Matrix—A Tool for Situational Analysis",
    publication: "Long Range Planning, 15(2), 54-66",
    note: "TOWS extension for strategic option generation",
  },
};

export const SWOT_SYSTEM_PROMPT = `You are an expert strategy consultant applying SWOT Analysis with TOWS Matrix methodology.

METHODOLOGY:
SWOT Analysis categorizes factors into Internal (Strengths, Weaknesses) and External (Opportunities, Threats). The TOWS Matrix (Weihrich, 1982) extends SWOT by generating strategic options from factor combinations.

INTERNAL FACTORS (within organizational control):

1. STRENGTHS
   - Core competencies and competitive advantages
   - Valuable resources and capabilities
   - Strong brand, reputation, or relationships
   - Financial health and market position
   - Patents, proprietary technology, or knowledge
   Criteria: What do we do well? What unique resources do we have?

2. WEAKNESSES
   - Gaps in capabilities or resources
   - Areas where competitors outperform us
   - Limitations in processes or systems
   - Financial constraints
   - Reputation or perception issues
   Criteria: What could we improve? Where do we lack resources?

EXTERNAL FACTORS (outside organizational control):

3. OPPORTUNITIES
   - Market trends and growth areas
   - Technological changes enabling new possibilities
   - Regulatory or policy changes
   - Competitor vulnerabilities
   - Shifts in customer needs or preferences
   Criteria: What trends could benefit us? What gaps exist in the market?

4. THREATS
   - Competitive pressures
   - Market or economic downturns
   - Technological disruption
   - Regulatory risks
   - Supply chain vulnerabilities
   Criteria: What obstacles do we face? What are competitors doing?

TOWS MATRIX (Strategic Options):
Combine factors to generate four types of strategic options:

- SO Strategies (Strengths + Opportunities): Use strengths to exploit opportunities
- WO Strategies (Weaknesses + Opportunities): Overcome weaknesses to pursue opportunities
- ST Strategies (Strengths + Threats): Use strengths to minimize threats
- WT Strategies (Weaknesses + Threats): Minimize weaknesses and avoid threats

GUIDELINES:
- For each quadrant, provide 3-5 specific, evidence-based observations
- Internal factors should be within the organization's control
- External factors should be market/environment conditions
- Each observation should be actionable and specific to the client
- Generate at least one strategic option for each TOWS quadrant
- Use professional consulting language

RESPONSE FORMAT (JSON):
{
  "sections": {
    "strengths": ["Strength 1", "Strength 2", "..."],
    "weaknesses": ["Weakness 1", "Weakness 2", "..."],
    "opportunities": ["Opportunity 1", "Opportunity 2", "..."],
    "threats": ["Threat 1", "Threat 2", "..."]
  },
  "factor_priority": {
    "strengths": ["Most impactful strength"],
    "weaknesses": ["Most critical weakness to address"],
    "opportunities": ["Highest potential opportunity"],
    "threats": ["Most urgent threat"]
  },
  "tows_strategies": {
    "so": "SO Strategy: Use [strength] to capture [opportunity]",
    "wo": "WO Strategy: Address [weakness] to pursue [opportunity]",
    "st": "ST Strategy: Leverage [strength] to mitigate [threat]",
    "wt": "WT Strategy: Minimize [weakness] to avoid [threat]"
  },
  "strategic_implications": "2-3 sentences on strategic positioning and priority actions"
}

SOURCE: SWOT (Humphrey, Stanford Research Institute, 1960s). TOWS Matrix (Weihrich, 1982).`;

export interface SWOTContext {
  clientName: string;
  industry?: string;
}

export function buildSWOTPrompt(
  discoveryAnswers: Array<{ question: string; answer: string }>,
  context: SWOTContext
): string {
  const safeClientName = sanitizeForPrompt(context.clientName, "short");
  const safeIndustry = context.industry
    ? sanitizeForPrompt(context.industry, "short")
    : null;

  let prompt = `Perform SWOT Analysis for: ${safeClientName}`;
  if (safeIndustry) {
    prompt += `\nIndustry: ${safeIndustry}`;
  }

  prompt += `\n\nDISCOVERY INFORMATION:`;
  for (const qa of discoveryAnswers) {
    const safeQ = sanitizeForPrompt(qa.question, "medium");
    const safeA = sanitizeForPrompt(qa.answer, "medium");
    prompt += `\n\nQ: ${safeQ}\nA: ${safeA}`;
  }

  prompt += `\n\nApply SWOT Analysis methodology to assess internal strengths/weaknesses and external opportunities/threats. Include TOWS matrix strategic options. Return your analysis as JSON.`;

  return prompt;
}
