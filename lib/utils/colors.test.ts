import { describe, it, expect } from "vitest";
import { getPredicateColor } from "./colors";

describe("HSL Color Generator", () => {
  it("should deterministically generate the exact same HSL color for identical strings", () => {
    const input = "ActionPredicate";
    const color1 = getPredicateColor(input);
    const color2 = getPredicateColor(input);

    expect(color1).toBe(color2);
    expect(color1).toContain("hsl(");
  });

  it("should match standard HSL syntax pattern", () => {
    const color = getPredicateColor("custom-predicate-value");
    // Standard format: hsl(H, S%, L%)
    const hslRegex = /^hsl\(\d+,\s*65%,\s*60%\)$/;
    expect(color).toMatch(hslRegex);
  });

  it("should generate case-insensitive deterministic colors", () => {
    const colorLower = getPredicateColor("some-string");
    const colorUpper = getPredicateColor("SOME-STRING");
    expect(colorLower).toBe(colorUpper);
  });
});
