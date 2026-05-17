import { describe, it, expect, vi, beforeEach } from "vitest";
import { processChat, processIntervention, syncKg, importSelectedTriplets, getTripletsForExport } from "./actions";

// Mock @/lib/goa
vi.mock("@/lib/goa", () => {
  const mockRun = vi.fn();
  const mockResume = vi.fn();
  class GoAOrchestrator {
    run = mockRun;
    resume = mockResume;
  }
  return {
    GoAOrchestrator,
    _mockRun: mockRun,
    _mockResume: mockResume
  };
});

// Mock @/lib/kg
vi.mock("@/lib/kg", () => {
  const mockDump = vi.fn().mockResolvedValue([{ subject: "A", predicate: "is", object: "B" }]);
  const KnowledgeGraph = {
    getInstance: vi.fn().mockResolvedValue({
      dump: mockDump
    })
  };
  return {
    KnowledgeGraph,
    _mockDump: mockDump
  };
});

// Mock @/lib/kg/db
vi.mock("@/lib/kg/db", () => {
  return {
    storeTriplets: vi.fn().mockResolvedValue(true)
  };
});

describe("app/actions [GREEN]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fail processChat if the query parameter is empty or only whitespace", async () => {
    const res1 = await processChat("");
    expect(res1.success).toBe(false);
    expect(res1.error).toContain("Query cannot be empty");

    const res2 = await processChat("   ");
    expect(res2.success).toBe(false);
  });

  it("should fail importSelectedTriplets if the parameter is not a valid array", async () => {
    const res1 = await importSelectedTriplets(null as any);
    expect(res1.success).toBe(false);
    expect(res1.error).toContain("expected array");

    const res2 = await importSelectedTriplets("not-an-array" as any);
    expect(res2.success).toBe(false);
  });

  it("should skip importSelectedTriplets processing if triplet array is empty", async () => {
    const res = await importSelectedTriplets([]);
    expect(res.success).toBe(true);
  });

  it("should successfully processChat if query is valid", async () => {
    const { _mockRun } = await import("@/lib/goa") as any;
    _mockRun.mockResolvedValueOnce({ response: "heya" });

    const res = await processChat("hello system");
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ response: "heya" });
  });

  it("should catch orchestrator exceptions during processChat and return success false", async () => {
    const { _mockRun } = await import("@/lib/goa") as any;
    _mockRun.mockRejectedValueOnce(new Error("orchestrator crash"));

    const res = await processChat("hello system");
    expect(res.success).toBe(false);
    expect(res.error).toBe("orchestrator crash");
  });

  it("should fail processIntervention if query is empty or whitespace", async () => {
    const res = await processIntervention("", [], [], {} as any);
    expect(res.success).toBe(false);
    expect(res.error).toContain("cannot be empty");
  });

  it("should successfully processIntervention if parameters are valid", async () => {
    const { _mockResume } = await import("@/lib/goa") as any;
    _mockResume.mockResolvedValueOnce({ response: "resumed ok" });

    const res = await processIntervention("please resume", [], [], {} as any);
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ response: "resumed ok" });
  });

  it("should catch exceptions during processIntervention and return error", async () => {
    const { _mockResume } = await import("@/lib/goa") as any;
    _mockResume.mockRejectedValueOnce(new Error("resume crash"));

    const res = await processIntervention("please resume", [], [], {} as any);
    expect(res.success).toBe(false);
    expect(res.error).toBe("resume crash");
  });

  it("should dump KnowledgeGraph and export triplets cleanly", async () => {
    const resDump = await syncKg();
    expect(resDump.success).toBe(true);
    expect(resDump.data).toEqual([{ subject: "A", predicate: "is", object: "B" }]);

    const resExport = await getTripletsForExport();
    expect(resExport.success).toBe(true);
    expect(resExport.data).toEqual([{ subject: "A", predicate: "is", object: "B" }]);
  });

  it("should catch KnowledgeGraph instance failure inside syncKg", async () => {
    const { KnowledgeGraph } = await import("@/lib/kg") as any;
    vi.spyOn(KnowledgeGraph, "getInstance").mockRejectedValueOnce(new Error("kg uninitialized"));

    const res = await syncKg();
    expect(res.success).toBe(false);
    expect(res.error).toBe("kg uninitialized");
  });

  it("should successfully importSelectedTriplets", async () => {
    const res = await importSelectedTriplets([{ subject: "X", predicate: "y", object: "Z" }]);
    expect(res.success).toBe(true);
  });
});
