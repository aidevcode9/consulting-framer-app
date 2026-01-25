import { describe, it, expect } from "vitest";
import {
  hasEnhancedPrompt,
  getFrameworkPrompt,
  getFrameworkSource,
  getFrameworkDisplayName,
  getAllFrameworkPromptMetadata,
} from "./index";

describe("hasEnhancedPrompt", () => {
  it("returns true for porter", () => {
    expect(hasEnhancedPrompt("porter")).toBe(true);
  });

  it("returns true for mckinsey7s", () => {
    expect(hasEnhancedPrompt("mckinsey7s")).toBe(true);
  });

  it("returns true for swot", () => {
    expect(hasEnhancedPrompt("swot")).toBe(true);
  });

  it("returns true for bmc", () => {
    expect(hasEnhancedPrompt("bmc")).toBe(true);
  });

  it("returns false for unknown framework", () => {
    expect(hasEnhancedPrompt("unknown")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(hasEnhancedPrompt("")).toBe(false);
  });

  it("returns false for similar but incorrect names", () => {
    expect(hasEnhancedPrompt("SWOT")).toBe(false); // Case sensitive
    expect(hasEnhancedPrompt("porter5")).toBe(false);
    expect(hasEnhancedPrompt("mckinsey")).toBe(false); // Missing 7s
  });
});

describe("getFrameworkPrompt", () => {
  it("returns config for porter", () => {
    const config = getFrameworkPrompt("porter");
    expect(config).not.toBeNull();
    expect(config?.metadata.version).toBeDefined();
    expect(config?.systemPrompt).toBeDefined();
    expect(config?.buildUserPrompt).toBeInstanceOf(Function);
  });

  it("returns config for all supported frameworks", () => {
    const frameworks = ["porter", "mckinsey7s", "swot", "bmc"];
    for (const fw of frameworks) {
      const config = getFrameworkPrompt(fw);
      expect(config).not.toBeNull();
      expect(config?.metadata.version).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });

  it("returns null for unknown framework", () => {
    expect(getFrameworkPrompt("unknown")).toBeNull();
  });
});

describe("getFrameworkSource", () => {
  it("returns source for porter with primary", () => {
    const source = getFrameworkSource("porter");
    expect(source).not.toBeNull();
    expect(source?.primary).toBeDefined();
    expect(source?.primary.author).toBe("Porter, M.E.");
    expect(source?.primary.year).toBe(1979);
  });

  it("returns source for porter with updated reference", () => {
    const source = getFrameworkSource("porter");
    expect(source?.updated).toBeDefined();
    expect(source?.updated?.year).toBe(2008);
  });

  it("returns source for mckinsey7s", () => {
    const source = getFrameworkSource("mckinsey7s");
    expect(source).not.toBeNull();
    expect(source?.primary.authors).toContain("Waterman");
    expect(source?.primary.year).toBe(1980);
  });

  it("returns source for swot with extended TOWS reference", () => {
    const source = getFrameworkSource("swot");
    expect(source).not.toBeNull();
    expect(source?.primary).toBeDefined();
    expect(source?.extended).toBeDefined();
    expect(source?.extended?.author).toContain("Weihrich");
  });

  it("returns source for bmc with extended reference", () => {
    const source = getFrameworkSource("bmc");
    expect(source).not.toBeNull();
    expect(source?.primary.authors).toContain("Osterwalder");
    expect(source?.extended).toBeDefined();
  });

  it("returns null for unknown framework", () => {
    expect(getFrameworkSource("unknown")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getFrameworkSource("")).toBeNull();
  });
});

describe("getFrameworkDisplayName", () => {
  it("returns 'Porter's Five Forces' for porter", () => {
    expect(getFrameworkDisplayName("porter")).toBe("Porter's Five Forces");
  });

  it("returns 'McKinsey 7-S Framework' for mckinsey7s", () => {
    expect(getFrameworkDisplayName("mckinsey7s")).toBe("McKinsey 7-S Framework");
  });

  it("returns 'SWOT Analysis' for swot", () => {
    expect(getFrameworkDisplayName("swot")).toBe("SWOT Analysis");
  });

  it("returns 'Business Model Canvas' for bmc", () => {
    expect(getFrameworkDisplayName("bmc")).toBe("Business Model Canvas");
  });

  it("falls back to raw type for unknown framework", () => {
    expect(getFrameworkDisplayName("unknown")).toBe("unknown");
  });

  it("falls back to raw type for empty string", () => {
    expect(getFrameworkDisplayName("")).toBe("");
  });
});

describe("getAllFrameworkPromptMetadata", () => {
  it("returns metadata for all 4 frameworks", () => {
    const metadata = getAllFrameworkPromptMetadata();
    expect(Object.keys(metadata)).toHaveLength(4);
    expect(metadata.porter).toBeDefined();
    expect(metadata.mckinsey7s).toBeDefined();
    expect(metadata.swot).toBeDefined();
    expect(metadata.bmc).toBeDefined();
  });

  it("each metadata has version and lastUpdated", () => {
    const metadata = getAllFrameworkPromptMetadata();
    for (const value of Object.values(metadata)) {
      expect(value.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(value.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
