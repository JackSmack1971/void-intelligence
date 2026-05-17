import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Telemetry } from "./telemetry";

describe("Telemetry Metrics Observability", () => {
  let consoleSpy: any;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("should start latency timer cleanly", () => {
    expect(() => Telemetry.start()).not.toThrow();
  });

  it("should log stages with correct duration and custom metadata", () => {
    Telemetry.start();
    Telemetry.logStage("TestStage", { tokens: 100, customParam: "value" });

    expect(consoleSpy).toHaveBeenCalled();
    const logCall = consoleSpy.mock.calls[0][0];
    expect(logCall).toContain("[Telemetry]");
    expect(logCall).toContain("[TestStage]");
    expect(logCall).toContain("Duration:");
    expect(consoleSpy.mock.calls[0][1]).toEqual({ tokens: 100, customParam: "value" });
  });

  it("should log standalone metrics cleanly", () => {
    Telemetry.logMetric("MemoryUsageMB", 128);

    expect(consoleSpy).toHaveBeenCalled();
    const logCall = consoleSpy.mock.calls[0][0];
    expect(logCall).toContain("[Telemetry]");
    expect(logCall).toContain("[Metric]");
    expect(logCall).toContain("MemoryUsageMB:");
    expect(consoleSpy.mock.calls[0][1]).toBe(128);
  });
});
