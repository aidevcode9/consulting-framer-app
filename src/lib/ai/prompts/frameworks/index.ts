/**
 * Framework-Specific Prompts Index
 * FR-451: Framework-specific prompts
 * FR-452: Methodology sources
 * FR-456: Methodology transparency
 *
 * Exports individual framework prompts with versioning metadata and
 * provides helper functions for framework-specific prompt selection.
 */

import type { PromptMetadata } from "../types";
import type { MethodologySource } from "@/types";

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

// Business Model Canvas
export {
  BMC_PROMPT_METADATA,
  BMC_SYSTEM_PROMPT,
  BMC_SOURCE,
  buildBMCPrompt,
  type BMCContext,
} from "./bmc.prompt";

// Import for aggregation
import { PORTER_PROMPT_METADATA, PORTER_SYSTEM_PROMPT, PORTER_SOURCE, buildPorterPrompt } from "./porter.prompt";
import { MCKINSEY_PROMPT_METADATA, MCKINSEY_SYSTEM_PROMPT, MCKINSEY_SOURCE, buildMcKinseyPrompt } from "./mckinsey.prompt";
import { SWOT_PROMPT_METADATA, SWOT_SYSTEM_PROMPT, SWOT_SOURCE, buildSWOTPrompt } from "./swot.prompt";
import { BMC_PROMPT_METADATA, BMC_SYSTEM_PROMPT, BMC_SOURCE, buildBMCPrompt } from "./bmc.prompt";

/**
 * Supported framework types for enhanced prompts
 */
export type EnhancedFrameworkType = "swot" | "porter" | "mckinsey7s" | "bmc";

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
  bmc: {
    metadata: BMC_PROMPT_METADATA,
    systemPrompt: BMC_SYSTEM_PROMPT,
    buildUserPrompt: buildBMCPrompt,
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
    bmc: BMC_PROMPT_METADATA,
  };
}

// ============================================
// FR-456: METHODOLOGY TRANSPARENCY HELPERS
// ============================================

/**
 * Human-readable display names for frameworks
 */
const FRAMEWORK_DISPLAY_NAMES: Record<EnhancedFrameworkType, string> = {
  porter: "Porter's Five Forces",
  mckinsey7s: "McKinsey 7-S Framework",
  swot: "SWOT Analysis",
  bmc: "Business Model Canvas",
};

/**
 * Source type for framework methodology
 */
interface FrameworkSourceDefinition {
  primary: MethodologySource;
  updated?: MethodologySource;
  extended?: MethodologySource;
}

/**
 * Registry of framework methodology sources
 */
const FRAMEWORK_SOURCES: Record<EnhancedFrameworkType, FrameworkSourceDefinition> = {
  porter: PORTER_SOURCE,
  mckinsey7s: MCKINSEY_SOURCE,
  swot: SWOT_SOURCE,
  bmc: BMC_SOURCE,
};

/**
 * Get methodology source for a framework type
 * Returns null if framework doesn't have enhanced methodology
 */
export function getFrameworkSource(
  frameworkType: string
): FrameworkSourceDefinition | null {
  if (hasEnhancedPrompt(frameworkType)) {
    return FRAMEWORK_SOURCES[frameworkType];
  }
  return null;
}

/**
 * Get human-readable display name for a framework type
 * Falls back to the raw type string if not found
 */
export function getFrameworkDisplayName(frameworkType: string): string {
  if (hasEnhancedPrompt(frameworkType)) {
    return FRAMEWORK_DISPLAY_NAMES[frameworkType];
  }
  return frameworkType;
}
