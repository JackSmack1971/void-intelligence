import { describe, it, expect } from "vitest";
import { tokens, GoAOrchestrator, DebateScheduler, redactPII } from "./index";

describe("Library Consolidated Entrypoint [RED]", () => {
  it("should successfully import and verify design tokens", () => {
    expect(tokens).toBeDefined();
    expect(tokens.colors.background).toBe("#030712");
  });

  it("should successfully import and verify GoA orchestrators & schedulers", () => {
    expect(GoAOrchestrator).toBeDefined();
    expect(DebateScheduler).toBeDefined();
  });

  it("should successfully import and verify utilities", () => {
    expect(redactPII).toBeDefined();
    expect(typeof redactPII).toBe("function");
  });
});
