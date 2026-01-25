/**
 * AI Response Utilities
 * Helper functions for processing AI responses
 */

/**
 * Strip markdown code blocks from AI responses
 * AI sometimes wraps JSON in ```json ... ``` blocks
 *
 * @example
 * // Input: "```json\n{\"key\": \"value\"}\n```"
 * // Output: "{\"key\": \"value\"}"
 */
export function stripMarkdownCodeBlocks(content: string): string {
  // Remove ```json or ``` at start and ``` at end
  let cleaned = content.trim();

  // Handle ```json or ```JSON or just ```
  if (cleaned.startsWith("```")) {
    // Find the end of the first line (after ```json or ```)
    const firstNewline = cleaned.indexOf("\n");
    if (firstNewline !== -1) {
      cleaned = cleaned.slice(firstNewline + 1);
    }
  }

  // Remove trailing ```
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }

  return cleaned.trim();
}

/**
 * Summarize discovery inputs for methodology display
 * FR-456: Methodology transparency
 *
 * @example
 * // Input: [{question: "Q1", answer: "A1"}, {question: "Q2", answer: "A2"}]
 * // Output: "2 questions answered"
 */
export function summarizeDiscoveryInputs(
  answers: Array<{ question: string; answer: string }>
): string {
  const count = answers.length;
  if (count === 0) {
    return "No discovery inputs";
  }
  return `${count} question${count !== 1 ? "s" : ""} answered`;
}
