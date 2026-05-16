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

describe("HybridRetriever", () => {
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
});
