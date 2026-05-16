import { describe, it, expect, beforeEach } from "vitest";
import { getCache, setCache, clearCache } from "./kgCache";

describe("kgCache [RED]", () => {
  beforeEach(() => {
    clearCache();
  });

  it("should successfully set and retrieve triplets", () => {
    const triplets = [{ subject: "agent", predicate: "uses", object: "tools" }];
    setCache("query-1", triplets);
    expect(getCache("query-1")).toEqual(triplets);
  });

  it("should normalize cache keys to be case-insensitive and whitespace-trimmed", () => {
    const triplets = [{ subject: "agent", predicate: "uses", object: "tools" }];
    setCache("  Graph-Of-Agents  ", triplets);
    expect(getCache("graph-of-agents")).toEqual(triplets);
    expect(getCache("  GRAPH-OF-AGENTS  ")).toEqual(triplets);
  });

  it("should short-circuit getCache on empty or whitespace keys", () => {
    expect(getCache("   ")).toBeUndefined();
    expect(getCache("")).toBeUndefined();
  });

  it("should short-circuit setCache and avoid storing on empty keys or empty triplets", () => {
    const triplets = [{ subject: "agent", predicate: "uses", object: "tools" }];
    setCache("   ", triplets);
    expect(getCache("   ")).toBeUndefined();

    setCache("query-2", []);
    expect(getCache("query-2")).toBeUndefined();
  });

  it("should invalidate the cache cleanly when clearCache is called", () => {
    const triplets = [{ subject: "agent", predicate: "uses", object: "tools" }];
    setCache("query-3", triplets);
    clearCache();
    expect(getCache("query-3")).toBeUndefined();
  });
});
