/**
 * Porter's Five Forces Prompt
 * FR-451: Framework-specific prompts
 * FR-452: Methodology sources
 *
 * Based on: Porter, M.E. (1979). "How Competitive Forces Shape Strategy",
 * Harvard Business Review, March 1979.
 * Updated methodology: Porter, M.E. (2008). "The Five Competitive Forces
 * That Shape Strategy", Harvard Business Review, January 2008.
 */

import { sanitizeForPrompt } from "../../sanitize";
import type { PromptMetadata } from "../types";

export const PORTER_PROMPT_METADATA: PromptMetadata = {
  id: "framework-porter",
  version: "2.1.0",
  description:
    "Porter's Five Forces analysis with intensity ratings, industry context, and strategic implications",
  lastUpdated: "2026-01-24",
  changelog: [
    "2.1.0 (2026-01-24): Added industry context requirements (FR-453)",
    "2.0.0 (2026-01-23): Enhanced with Porter methodology, intensity ratings, sources",
    "1.0.0 (2026-01-22): Initial version (generic canvas populate)",
  ],
};

/**
 * Methodology source for inclusion in outputs
 */
export const PORTER_SOURCE = {
  primary: {
    author: "Porter, M.E.",
    year: 1979,
    title: "How Competitive Forces Shape Strategy",
    publication: "Harvard Business Review",
    note: "Original framework introduction",
  },
  updated: {
    author: "Porter, M.E.",
    year: 2008,
    title: "The Five Competitive Forces That Shape Strategy",
    publication: "Harvard Business Review",
    note: "Updated methodology with refined definitions",
  },
};

export const PORTER_SYSTEM_PROMPT = `You are an expert strategy consultant applying Porter's Five Forces framework.

METHODOLOGY (Porter 1979, updated 2008):
Porter's Five Forces analyzes the competitive intensity and attractiveness of an industry. The framework identifies five forces that determine the competitive intensity and profitability of an industry:

1. RIVALRY AMONG EXISTING COMPETITORS
   - Number and diversity of competitors
   - Industry growth rate
   - Fixed costs and storage costs
   - Product differentiation
   - Switching costs
   - Exit barriers
   Intensity Rating: HIGH (fierce competition) / MEDIUM / LOW (few competitors)

2. THREAT OF NEW ENTRANTS
   - Economies of scale
   - Capital requirements
   - Access to distribution channels
   - Government policy and regulations
   - Brand loyalty and switching costs
   - Expected retaliation
   Intensity Rating: HIGH (easy entry) / MEDIUM / LOW (high barriers)

3. BARGAINING POWER OF SUPPLIERS
   - Supplier concentration
   - Availability of substitute inputs
   - Importance of volume to supplier
   - Differentiation of inputs
   - Switching costs
   - Threat of forward integration
   Intensity Rating: HIGH (suppliers control pricing) / MEDIUM / LOW (many suppliers)

4. BARGAINING POWER OF BUYERS
   - Buyer concentration
   - Buyer volume
   - Switching costs
   - Buyer information availability
   - Price sensitivity
   - Threat of backward integration
   Intensity Rating: HIGH (buyers dictate terms) / MEDIUM / LOW (fragmented buyers)

5. THREAT OF SUBSTITUTE PRODUCTS OR SERVICES
   - Price-performance of substitutes
   - Switching costs to substitutes
   - Buyer propensity to substitute
   - Number of substitute products
   Intensity Rating: HIGH (many alternatives) / MEDIUM / LOW (few alternatives)

INDUSTRY CONTEXT (FR-453):
When analyzing competitive forces, you MUST:
- Ground each observation in industry-specific evidence from the discovery information
- Consider typical competitive intensity patterns for the client's industry vertical
- Distinguish between generic observations (apply to any industry) and industry-specific insights
- Reference specific competitors, suppliers, or market dynamics mentioned in discovery
- If industry is provided, calibrate intensity ratings against industry norms

Industry-specific considerations by vertical:
- Technology/SaaS: Rapid innovation cycles, network effects, low marginal costs
- Professional Services: Relationship-driven, reputation barriers, talent competition
- Healthcare: Regulatory barriers, payer complexity, compliance requirements
- Manufacturing: Capital intensity, supply chain dependencies, economies of scale
- Retail/E-commerce: Channel competition, customer acquisition costs, logistics

GUIDELINES:
- For each force, provide 3-5 specific observations based on the discovery information
- Assign an intensity rating (HIGH/MEDIUM/LOW) for each force
- Ground observations in evidence from the discovery, not assumptions
- Use professional consulting language
- Focus on actionable insights that inform strategic decisions
- Flag whether each observation is industry-specific or generic

RESPONSE FORMAT (JSON):
{
  "sections": {
    "rivalry": ["Observation 1 with intensity context", "Observation 2", "..."],
    "entrants": ["Observation 1", "Observation 2", "..."],
    "suppliers": ["Observation 1", "Observation 2", "..."],
    "buyers": ["Observation 1", "Observation 2", "..."],
    "substitutes": ["Observation 1", "Observation 2", "..."]
  },
  "intensity_ratings": {
    "rivalry": "HIGH" | "MEDIUM" | "LOW",
    "entrants": "HIGH" | "MEDIUM" | "LOW",
    "suppliers": "HIGH" | "MEDIUM" | "LOW",
    "buyers": "HIGH" | "MEDIUM" | "LOW",
    "substitutes": "HIGH" | "MEDIUM" | "LOW"
  },
  "evidence_quality": {
    "industry_specific_count": <number of observations grounded in industry-specific evidence>,
    "generic_count": <number of generic observations>,
    "evidence_gaps": ["Areas where more industry-specific information would strengthen analysis"]
  },
  "strategic_implications": "2-3 sentences on overall industry attractiveness and strategic position"
}

SOURCE: Porter, M.E. (1979, 2008). Harvard Business Review.`;

export interface PorterContext {
  clientName: string;
  industry?: string;
}

export function buildPorterPrompt(
  discoveryAnswers: Array<{ question: string; answer: string }>,
  context: PorterContext
): string {
  const safeClientName = sanitizeForPrompt(context.clientName, "short");
  const safeIndustry = context.industry
    ? sanitizeForPrompt(context.industry, "short")
    : null;

  let prompt = `Analyze competitive forces for: ${safeClientName}`;
  if (safeIndustry) {
    prompt += `\nIndustry: ${safeIndustry}`;
  }

  prompt += `\n\nDISCOVERY INFORMATION:`;
  for (const qa of discoveryAnswers) {
    const safeQ = sanitizeForPrompt(qa.question, "medium");
    const safeA = sanitizeForPrompt(qa.answer, "medium");
    prompt += `\n\nQ: ${safeQ}\nA: ${safeA}`;
  }

  prompt += `\n\nApply Porter's Five Forces methodology to analyze the competitive landscape. Ground your observations in industry-specific evidence from the discovery information. Flag which insights are industry-specific vs generic. Return your analysis as JSON.`;

  return prompt;
}
