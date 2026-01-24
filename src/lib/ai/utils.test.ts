import { describe, it, expect } from "vitest";
import { stripMarkdownCodeBlocks } from "./utils";

describe("stripMarkdownCodeBlocks", () => {
  it("should return plain JSON unchanged", () => {
    const input = '{"key": "value"}';
    expect(stripMarkdownCodeBlocks(input)).toBe('{"key": "value"}');
  });

  it("should strip ```json code blocks", () => {
    const input = '```json\n{"key": "value"}\n```';
    expect(stripMarkdownCodeBlocks(input)).toBe('{"key": "value"}');
  });

  it("should strip ```JSON code blocks (uppercase)", () => {
    const input = '```JSON\n{"key": "value"}\n```';
    expect(stripMarkdownCodeBlocks(input)).toBe('{"key": "value"}');
  });

  it("should strip plain ``` code blocks", () => {
    const input = '```\n{"key": "value"}\n```';
    expect(stripMarkdownCodeBlocks(input)).toBe('{"key": "value"}');
  });

  it("should handle multiline JSON", () => {
    const input = `\`\`\`json
{
  "recommendations": [
    {
      "framework": "swot",
      "confidence": 0.85
    }
  ]
}
\`\`\``;
    const expected = `{
  "recommendations": [
    {
      "framework": "swot",
      "confidence": 0.85
    }
  ]
}`;
    expect(stripMarkdownCodeBlocks(input)).toBe(expected);
  });

  it("should handle whitespace around code blocks", () => {
    const input = '  ```json\n{"key": "value"}\n```  ';
    expect(stripMarkdownCodeBlocks(input)).toBe('{"key": "value"}');
  });

  it("should handle JSON without trailing newline before closing", () => {
    const input = '```json\n{"key": "value"}```';
    expect(stripMarkdownCodeBlocks(input)).toBe('{"key": "value"}');
  });

  it("should not break if only opening backticks present", () => {
    const input = '```json\n{"key": "value"}';
    // Should strip opening but return rest
    expect(stripMarkdownCodeBlocks(input)).toBe('{"key": "value"}');
  });

  it("should handle empty content", () => {
    expect(stripMarkdownCodeBlocks("")).toBe("");
  });

  it("should handle content with only backticks", () => {
    expect(stripMarkdownCodeBlocks("```\n```")).toBe("");
  });

  it("should preserve internal backticks in JSON strings", () => {
    const input = '```json\n{"code": "console.log(`hello`)"}\n```';
    expect(stripMarkdownCodeBlocks(input)).toBe('{"code": "console.log(`hello`)"}');
  });

  it("should handle real AI response format", () => {
    const input = `\`\`\`json
{
  "recommendations": [
    {
      "framework": "bmc",
      "confidence": 0.95,
      "reasoning": "Evidence Bound is a startup with a clear product offering.",
      "focusAreas": ["Customer Segments", "Value Propositions"]
    }
  ],
  "summary": "For Evidence Bound's client acquisition challenge..."
}
\`\`\``;

    const result = stripMarkdownCodeBlocks(input);

    // Should be valid JSON after stripping
    const parsed = JSON.parse(result);
    expect(parsed.recommendations).toHaveLength(1);
    expect(parsed.recommendations[0].framework).toBe("bmc");
    expect(parsed.recommendations[0].confidence).toBe(0.95);
  });
});
