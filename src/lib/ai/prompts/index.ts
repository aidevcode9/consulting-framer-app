/**
 * AI Prompts Index
 *
 * Central export for all prompt configurations.
 * Each prompt is in its own file with version metadata for tracking changes.
 */

// Types
export type { PromptMetadata, PromptConfig } from "./types";

// Discovery Follow-up (FR-402)
export {
  DISCOVERY_PROMPT_METADATA,
  DISCOVERY_SYSTEM_PROMPT,
  buildDiscoveryFollowUpPrompt,
  type DiscoveryContext,
} from "./discovery.prompt";

// Framework Recommendations (FR-405)
export {
  FRAMEWORK_PROMPT_METADATA,
  FRAMEWORK_RECOMMENDATION_PROMPT,
  buildFrameworkRecommendationPrompt,
  type FrameworkContext,
} from "./framework.prompt";

// Discovery Summary (FR-404)
export {
  SUMMARY_PROMPT_METADATA,
  DISCOVERY_SUMMARY_PROMPT,
  buildDiscoverySummaryPrompt,
  type SummaryContext,
} from "./summary.prompt";

// Canvas Population (FR-406)
export {
  CANVAS_PROMPT_METADATA,
  CANVAS_POPULATE_PROMPT,
  buildCanvasPopulatePrompt,
  type PopulateFrameworkType,
  type CanvasContext,
} from "./canvas.prompt";

// SOW Generation (FR-501)
export {
  SOW_PROMPT_METADATA,
  SOW_GENERATION_PROMPT,
  buildSOWGenerationPrompt,
  type SOWEngagement,
} from "./sow.prompt";

// Proposal Generation (FR-502)
export {
  PROPOSAL_PROMPT_METADATA,
  PROPOSAL_GENERATION_PROMPT,
  buildProposalGenerationPrompt,
  type ProposalEngagement,
} from "./proposal.prompt";

// Framework-Specific Prompts (FR-451, FR-452)
export {
  PORTER_PROMPT_METADATA,
  PORTER_SYSTEM_PROMPT,
  PORTER_SOURCE,
  buildPorterPrompt,
  MCKINSEY_PROMPT_METADATA,
  MCKINSEY_SYSTEM_PROMPT,
  MCKINSEY_SOURCE,
  buildMcKinseyPrompt,
  SWOT_PROMPT_METADATA,
  SWOT_SYSTEM_PROMPT,
  SWOT_SOURCE,
  buildSWOTPrompt,
  hasEnhancedPrompt,
  getFrameworkPrompt,
  getAllFrameworkPromptMetadata,
  type EnhancedFrameworkType,
  type FrameworkPromptConfig,
} from "./frameworks";

// Import metadata for getAllPromptMetadata function
import { DISCOVERY_PROMPT_METADATA } from "./discovery.prompt";
import { FRAMEWORK_PROMPT_METADATA } from "./framework.prompt";
import { SUMMARY_PROMPT_METADATA } from "./summary.prompt";
import { CANVAS_PROMPT_METADATA } from "./canvas.prompt";
import { SOW_PROMPT_METADATA } from "./sow.prompt";
import { PROPOSAL_PROMPT_METADATA } from "./proposal.prompt";
import { getAllFrameworkPromptMetadata } from "./frameworks";

/**
 * Get all prompt metadata for monitoring/debugging
 */
export function getAllPromptMetadata() {
  return {
    discovery: DISCOVERY_PROMPT_METADATA,
    framework: FRAMEWORK_PROMPT_METADATA,
    summary: SUMMARY_PROMPT_METADATA,
    canvas: CANVAS_PROMPT_METADATA,
    sow: SOW_PROMPT_METADATA,
    proposal: PROPOSAL_PROMPT_METADATA,
    // Framework-specific prompts (FR-451)
    frameworks: getAllFrameworkPromptMetadata(),
  };
}
