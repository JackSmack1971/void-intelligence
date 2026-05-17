import { describe, it, expect } from "vitest";
import { getPredicateColor, Telemetry, encryptData, redactPII } from "./index";

describe("Utils Consolidated Entrypoint [RED]", () => {
  it("should successfully import and verify color utilities", () => {
    expect(getPredicateColor).toBeDefined();
    expect(typeof getPredicateColor).toBe("function");
    expect(getPredicateColor("test")).toContain("hsl");
  });

  it("should successfully import and verify telemetry utilities", () => {
    expect(Telemetry).toBeDefined();
  });

  it("should successfully import and verify cryptography utilities", () => {
    expect(encryptData).toBeDefined();
    expect(typeof encryptData).toBe("function");
  });

  it("should successfully import and verify redaction utilities", () => {
    expect(redactPII).toBeDefined();
    expect(typeof redactPII).toBe("function");
  });
});
