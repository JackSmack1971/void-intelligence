import { describe, it, expect, vi, beforeEach } from "vitest";
import { getHybridMemory } from "./hybridRetriever";
import { VectorStore } from "./chroma";
import * as db from "./db";

vi.mock("./db", () => ({
  getRelevantMemory: vi.fn(),
}));

vi.mock("./chroma", () => ({
  VectorStore: {
    getInstance: vi.fn(),
  },
}));

describe("HybridRetriever [RED]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should merge results from SQLite and Chroma using RRF", async () => {
    const sqliteTriplets = [
      { subject: "A", predicate: "is", object: "B" },
      { subject: "C", predicate: "is", object: "D" },
    ];
    const chromaTriplets = [
      { subject: "C", predicate: "is", object: "D" },
      { subject: "E", predicate: "is", object: "F" },
    ];

    (db.getRelevantMemory as any).mockResolvedValue(sqliteTriplets);
    (VectorStore.getInstance as any).mockResolvedValue({
      querySemantic: vi.fn().mockResolvedValue(chromaTriplets),
    });

    const results = await getHybridMemory("test query", ["keyword"]);

    expect(results.length).toBe(3);
    // Result C-is-D should be first because it's in both lists
    expect(results[0].subject).toBe("C");
  });

  it("should fallback to SQLite if Chroma fails", async () => {
    const sqliteTriplets = [{ subject: "A", predicate: "is", object: "B" }];
    (db.getRelevantMemory as any).mockResolvedValue(sqliteTriplets);
    (VectorStore.getInstance as any).mockResolvedValue({
      querySemantic: vi.fn().mockRejectedValue(new Error("Chroma Offline")),
    });

    const results = await getHybridMemory("test query", ["keyword"]);
    expect(results).toEqual(sqliteTriplets);
  });

  it("should canonicalize RRF matching keys to be case-insensitive and trimmed", async () => {
    // A-is-B and a-is-b are the same canonical triple
    const sqliteTriplets = [{ subject: "  A  ", predicate: "is", object: "B" }];
    const chromaTriplets = [{ subject: "a", predicate: "is", object: "b" }];

    (db.getRelevantMemory as any).mockResolvedValue(sqliteTriplets);
    (VectorStore.getInstance as any).mockResolvedValue({
      querySemantic: vi.fn().mockResolvedValue(chromaTriplets),
    });

    const results = await getHybridMemory("test query", ["keyword"]);

    // Should merge them and output exactly 1 triple, preserving original case of highest scored or first processed (sqlite)
    expect(results.length).toBe(1);
    expect(results[0].subject).toBe("  A  ");
  });

  it("should short-circuit and return [] if both query and keywords are empty", async () => {
    const results = await getHybridMemory("   ", []);
    expect(results).toEqual([]);
    expect(db.getRelevantMemory).not.toHaveBeenCalled();
    expect(VectorStore.getInstance).not.toHaveBeenCalled();
  });

  it("should enforce safe positive boundaries on the limit parameter", async () => {
    const sqliteTriplets = [
      { subject: "A", predicate: "is", object: "B" },
      { subject: "C", predicate: "is", object: "D" },
    ];
    (db.getRelevantMemory as any).mockResolvedValue(sqliteTriplets);
    (VectorStore.getInstance as any).mockResolvedValue({
      querySemantic: vi.fn().mockResolvedValue([]),
    });

    // Request limit of 0 or negative
    const results1 = await getHybridMemory("test query", ["keyword"], 0);
    const results2 = await getHybridMemory("test query", ["keyword"], -5);

    expect(results1.length).toBe(1);
    expect(results2.length).toBe(1);
  });

  it("should handle cleanly when one branch returns empty results", async () => {
    const chromaTriplets = [{ subject: "E", predicate: "is", object: "F" }];
    (db.getRelevantMemory as any).mockResolvedValue([]);
    (VectorStore.getInstance as any).mockResolvedValue({
      querySemantic: vi.fn().mockResolvedValue(chromaTriplets),
    });

    const results = await getHybridMemory("test query", ["keyword"]);
    expect(results).toEqual(chromaTriplets);
  });
});
