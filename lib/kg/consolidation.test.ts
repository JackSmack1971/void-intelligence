import { describe, it, expect, vi, beforeEach } from "vitest";
import { runConsolidation } from "./consolidation";
import * as db from "./db";
import * as client from "../openrouter/client";

vi.mock("./db", () => ({
  getConsolidationBatch: vi.fn(),
  consolidateTriplets: vi.fn(),
}));

vi.mock("../openrouter/client", () => ({
  chatWithRetry: vi.fn(),
}));

describe("KG Consolidation Agent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips consolidation if batch is too small", async () => {
    vi.mocked(db.getConsolidationBatch).mockResolvedValue([
      { id: 1, subject: "A", predicate: "B", object: "C" }
    ]);

    await runConsolidation();
    expect(client.chatWithRetry).not.toHaveBeenCalled();
  });

  it("performs consolidation and swaps records in DB", async () => {
    const mockBatch = Array(15).fill(0).map((_, i) => ({
      id: i, subject: "AI", predicate: "is", object: "tech"
    }));
    vi.mocked(db.getConsolidationBatch).mockResolvedValue(mockBatch);
    
    vi.mocked(client.chatWithRetry).mockResolvedValue(JSON.stringify({
      consolidated: [{ subject: "Artificial Intelligence", predicate: "is", object: "Technology" }]
    }));

    await runConsolidation();

    expect(client.chatWithRetry).toHaveBeenCalled();
    expect(db.consolidateTriplets).toHaveBeenCalledWith(
      mockBatch.map(b => b.id),
      [{ subject: "Artificial Intelligence", predicate: "is", object: "Technology" }]
    );
  });
});
