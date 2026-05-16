import { describe, it, expect } from "vitest";
// Import from the barrel file. This will fail or have errors in RED phase since the file is not populated.
import { GoAOrchestrator, DebateScheduler } from "./index";

describe("GoA Barrel [RED]", () => {
  it("should export GoAOrchestrator successfully", () => {
    expect(GoAOrchestrator).toBeDefined();
    const orchestrator = new GoAOrchestrator();
    expect(orchestrator).toHaveProperty("run");
    expect(orchestrator).toHaveProperty("resume");
  });

  it("should export DebateScheduler successfully", () => {
    expect(DebateScheduler).toBeDefined();
    expect(DebateScheduler).toHaveProperty("computeWaves");
  });
});
