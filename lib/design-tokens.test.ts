import { describe, it, expect } from "vitest";
import { tokens } from "./design-tokens";

describe("Design Tokens Alignment [RED]", () => {
  it("should carry standard background and text definitions", () => {
    expect(tokens.colors.background).toBe("#030712");
    expect(tokens.colors.surface01).toBe("#111827");
  });

  it("should align exactly with Tailwind CSS v4 custom colors", () => {
    expect(tokens.colors.accentEmerald).toBe("#10B981");
    expect(tokens.colors.accentAmber).toBe("#F59E0B");
    expect(tokens.colors.accentViolet).toBe("#8B5CF6");
  });

  it("should contain components glassPremium styling specification", () => {
    expect(tokens.components.glassPremium).toBeDefined();
    expect(tokens.components.glassPremium.background).toBe("rgba(13, 14, 27, 0.7)");
    expect(tokens.components.glassPremium.backdropFilter).toBe("blur(12px)");
    expect(tokens.components.glassPremium.border).toBe("1px solid rgba(255, 255, 255, 0.08)");
  });
});
