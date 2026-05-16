import { describe, it, expect, vi, beforeEach } from "vitest";
import { runConsolidation, CONSOLIDATION_PROMPT } from "./consolidation";
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

  it("aborts consolidation if LLM returns empty result [BEH-3]", async () => {
    const mockBatch = Array(15).fill(0).map((_, i) => ({
      id: i, subject: "A", predicate: "B", object: "C"
    }));
    vi.mocked(db.getConsolidationBatch).mockResolvedValue(mockBatch);
    
    vi.mocked(client.chatWithRetry).mockResolvedValue(JSON.stringify({
      consolidated: []
    }));

    await runConsolidation();

    expect(db.consolidateTriplets).not.toHaveBeenCalled();
  });

  it("CONSOLIDATION_PROMPT should use ### headers [BEH-1]", () => {
    const prompt = CONSOLIDATION_PROMPT([
      { subject: "A", predicate: "is", object: "B" }
    ]);
    expect(prompt).toContain("### SYSTEM ROLE");
    expect(prompt).toContain("### RAW TRIPLETS");
    expect(prompt).toContain("### CONSOLIDATION RULES");
    expect(prompt).toContain("### OUTPUT SCHEMA");
  });
});
