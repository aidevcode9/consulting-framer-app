/**
 * Shared types for AI prompts
 */

export interface PromptMetadata {
  id: string;
  version: string;
  description: string;
  lastUpdated: string;
  changelog?: string[];
}

export interface PromptConfig<TContext = unknown> {
  metadata: PromptMetadata;
  systemPrompt: string;
  buildUserPrompt: (context: TContext) => string;
}
