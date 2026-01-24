/**
 * Framework-Specific Prompts Index
 * FR-451: Framework-specific prompts
 * FR-452: Methodology sources
 *
 * Exports individual framework prompts with versioning metadata and
 * provides helper functions for framework-specific prompt selection.
 */

import type { PromptMetadata } from "../types";

// Porter's Five Forces
export {
  PORTER_PROMPT_METADATA,
  PORTER_SYSTEM_PROMPT,
  PORTER_SOURCE,
  buildPorterPrompt,
  type PorterContext,
} from "./porter.prompt";

// McKinsey 7-S
export {
  MCKINSEY_PROMPT_METADATA,
  MCKINSEY_SYSTEM_PROMPT,
  MCKINSEY_SOURCE,
  buildMcKinseyPrompt,
  type McKinseyContext,
} from "./mckinsey.prompt";

// SWOT Analysis
export {
  SWOT_PROMPT_METADATA,
  SWOT_SYSTEM_PROMPT,
  SWOT_SOURCE,
  buildSWOTPrompt,
  type SWOTContext,
} from "./swot.prompt";

// Import for aggregation
import { PORTER_PROMPT_METADATA, PORTER_SYSTEM_PROMPT, buildPorterPrompt } from "./porter.prompt";
import { MCKINSEY_PROMPT_METADATA, MCKINSEY_SYSTEM_PROMPT, buildMcKinseyPrompt } from "./mckinsey.prompt";
import { SWOT_PROMPT_METADATA, SWOT_SYSTEM_PROMPT, buildSWOTPrompt } from "./swot.prompt";

/**
 * Supported framework types for enhanced prompts
 */
export type EnhancedFrameworkType = "swot" | "porter" | "mckinsey7s";

/**
 * Framework prompt configuration
 */
export interface FrameworkPromptConfig {
  metadata: PromptMetadata;
  systemPrompt: string;
  buildUserPrompt: (
    discoveryAnswers: Array<{ question: string; answer: string }>,
    context: { clientName: string; industry?: string }
  ) => string;
}

/**
 * Registry of enhanced framework prompts
 */
const FRAMEWORK_PROMPTS: Record<EnhancedFrameworkType, FrameworkPromptConfig> = {
  porter: {
    metadata: PORTER_PROMPT_METADATA,
    systemPrompt: PORTER_SYSTEM_PROMPT,
    buildUserPrompt: buildPorterPrompt,
  },
  mckinsey7s: {
    metadata: MCKINSEY_PROMPT_METADATA,
    systemPrompt: MCKINSEY_SYSTEM_PROMPT,
    buildUserPrompt: buildMcKinseyPrompt,
  },
  swot: {
    metadata: SWOT_PROMPT_METADATA,
    systemPrompt: SWOT_SYSTEM_PROMPT,
    buildUserPrompt: buildSWOTPrompt,
  },
};

/**
 * Check if a framework type has an enhanced prompt
 */
export function hasEnhancedPrompt(frameworkType: string): frameworkType is EnhancedFrameworkType {
  return frameworkType in FRAMEWORK_PROMPTS;
}

/**
 * Get framework-specific prompt configuration
 * Returns null if no enhanced prompt exists for this framework type
 */
export function getFrameworkPrompt(
  frameworkType: string
): FrameworkPromptConfig | null {
  if (hasEnhancedPrompt(frameworkType)) {
    return FRAMEWORK_PROMPTS[frameworkType];
  }
  return null;
}

/**
 * Get all framework prompt metadata for monitoring/debugging
 */
export function getAllFrameworkPromptMetadata(): Record<string, PromptMetadata> {
  return {
    porter: PORTER_PROMPT_METADATA,
    mckinsey7s: MCKINSEY_PROMPT_METADATA,
    swot: SWOT_PROMPT_METADATA,
  };
}
