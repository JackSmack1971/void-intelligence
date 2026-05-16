import { describe, it, expect, vi, beforeEach } from "vitest";

// Vitest allows variables prefixed with "mock" to be referenced inside vi.mock factory
const mockGetOrCreateCollection = vi.fn();
const mockGetCollection = vi.fn();

vi.mock("chromadb", () => {
  return {
    ChromaClient: class {
      // Delegate at call-time to avoid construct-time hoisting/initialization race
      getOrCreateCollection(...args: any[]) {
        return mockGetOrCreateCollection(...args);
      }
      getCollection(...args: any[]) {
        return mockGetCollection(...args);
      }
    },
  };
});

import { VectorStore } from "./chroma";

describe("VectorStore [GREEN]", () => {
  const mockUpsert = vi.fn();
  const mockQuery = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton state between tests
    (VectorStore as any).instance = undefined;
    (VectorStore as any).initPromise = null;

    mockGetOrCreateCollection.mockResolvedValue({});
    mockGetCollection.mockResolvedValue({
      upsert: mockUpsert,
      query: mockQuery,
    });
  });

  it("should enforce async thread-safety with static promise lock", async () => {
    // Call getInstance multiple times simultaneously
    const p1 = VectorStore.getInstance();
    const p2 = VectorStore.getInstance();
    const [s1, s2] = await Promise.all([p1, p2]);

    expect(s1).toBe(s2);
    // getOrCreateCollection should only be called once
    expect(mockGetOrCreateCollection).toHaveBeenCalledTimes(1);
  });

  it("should short-circuit upsertTriplets on empty batches", async () => {
    const store = await VectorStore.getInstance();
    await store.upsertTriplets([]);
    expect(mockGetCollection).not.toHaveBeenCalled();
  });

  it("should short-circuit querySemantic on empty or whitespace queries", async () => {
    const store = await VectorStore.getInstance();
    const res1 = await store.querySemantic("   ");
    const res2 = await store.querySemantic("");
    expect(res1).toEqual([]);
    expect(res2).toEqual([]);
    expect(mockGetCollection).not.toHaveBeenCalled();
  });

  it("should set isConnected = false and short-circuit when connection fails", async () => {
    // Mock init failure
    mockGetOrCreateCollection.mockRejectedValue(new Error("Connection refused"));

    const store = await VectorStore.getInstance();
    expect((store as any).isConnected).toBe(false);

    // Call upsert and query; they should short-circuit immediately without calling client
    vi.clearAllMocks();
    await store.upsertTriplets([{ subject: "A", predicate: "B", object: "C" }]);
    const queryRes = await store.querySemantic("A");

    expect(queryRes).toEqual([]);
    expect(mockGetCollection).not.toHaveBeenCalled();
  });

  it("should disable isConnected if a dynamic request encounters network exceptions", async () => {
    // Init succeeds
    mockGetOrCreateCollection.mockResolvedValue({});
    const store = await VectorStore.getInstance();
    expect((store as any).isConnected).toBe(true);

    // Request fails
    mockGetCollection.mockRejectedValue(new Error("Network disconnect"));
    await store.upsertTriplets([{ subject: "A", predicate: "B", object: "C" }]);
    expect((store as any).isConnected).toBe(false);

    // Next query should short-circuit instantly
    vi.clearAllMocks();
    const queryRes = await store.querySemantic("A");
    expect(queryRes).toEqual([]);
    expect(mockGetCollection).not.toHaveBeenCalled();
  });
});
