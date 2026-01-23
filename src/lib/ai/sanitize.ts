/**
 * Input Sanitization for AI Prompts
 * Defends against prompt injection attacks
 */

/**
 * Common prompt injection patterns to detect and neutralize
 */
const INJECTION_PATTERNS = [
  // Direct instruction overrides
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|rules?)/gi,
  /disregard\s+(all\s+)?(previous|prior|above)/gi,
  /forget\s+(everything|all|what)/gi,

  // Role hijacking attempts
  /you\s+are\s+now\s+a/gi,
  /act\s+as\s+(if\s+you\s+are\s+)?a/gi,
  /pretend\s+(to\s+be|you\s+are)/gi,
  /roleplay\s+as/gi,

  // System prompt extraction
  /what\s+(is|are)\s+your\s+(system\s+)?(instructions?|prompts?|rules?)/gi,
  /show\s+me\s+your\s+(system\s+)?(prompt|instructions?)/gi,
  /repeat\s+(your\s+)?(system\s+)?(prompt|instructions?)/gi,

  // Delimiter injection
  /```\s*system/gi,
  /<\/?system>/gi,
  /\[SYSTEM\]/gi,
  /\[INST\]/gi,
  /<<SYS>>/gi,
];

/**
 * Maximum allowed length for different input types
 */
const MAX_LENGTHS = {
  short: 200,    // Names, titles
  medium: 1000,  // Single answers, questions
  long: 5000,    // Full context, multiple Q&As
};

export type InputLength = keyof typeof MAX_LENGTHS;

/**
 * Sanitize user input for safe inclusion in AI prompts
 *
 * @param input - Raw user input
 * @param maxLength - Maximum allowed length ('short', 'medium', 'long')
 * @returns Sanitized input safe for prompt inclusion
 */
export function sanitizeForPrompt(
  input: string,
  maxLength: InputLength = "medium"
): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  let sanitized = input;

  // 1. Trim whitespace
  sanitized = sanitized.trim();

  // 2. Enforce length limit
  const limit = MAX_LENGTHS[maxLength];
  if (sanitized.length > limit) {
    sanitized = sanitized.slice(0, limit) + "...";
  }

  // 3. Neutralize injection patterns by adding markers
  // Instead of removing (which could break legitimate content),
  // we wrap suspicious patterns to make them clearly user content
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, (match) => `[user said: ${match}]`);
  }

  // 4. Escape sequences that could be interpreted as delimiters
  sanitized = sanitized
    .replace(/```/g, "'''")  // Code blocks
    .replace(/<</g, "< <")   // Angle bracket sequences
    .replace(/>>/g, "> >")
    .replace(/\[\[/g, "[ [") // Bracket sequences
    .replace(/\]\]/g, "] ]");

  return sanitized;
}

/**
 * Sanitize an object's string values recursively
 * Useful for sanitizing context objects
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  maxLength: InputLength = "medium"
): T {
  const result = { ...obj };

  for (const key of Object.keys(result)) {
    const value = result[key];

    if (typeof value === "string") {
      (result as Record<string, unknown>)[key] = sanitizeForPrompt(value, maxLength);
    } else if (Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = value.map((item) => {
        if (typeof item === "string") {
          return sanitizeForPrompt(item, maxLength);
        }
        if (item && typeof item === "object") {
          return sanitizeObject(item as Record<string, unknown>, maxLength);
        }
        return item;
      });
    } else if (value && typeof value === "object") {
      (result as Record<string, unknown>)[key] = sanitizeObject(
        value as Record<string, unknown>,
        maxLength
      );
    }
  }

  return result;
}

/**
 * Check if input contains potential injection attempts
 * Returns true if suspicious patterns detected
 */
export function detectInjectionAttempt(input: string): boolean {
  if (!input || typeof input !== "string") {
    return false;
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      // Reset lastIndex for global patterns
      pattern.lastIndex = 0;
      return true;
    }
  }

  return false;
}
