import { describe, it, expect } from "vitest";
import { KnowledgeGraph, SyncService, getHybridMemory, initDb } from "./index";

describe("KnowledgeGraph Singleton Facade [GREEN]", () => {
  it("should return a single instance via getInstance()", async () => {
    const kg1 = await KnowledgeGraph.getInstance();
    const kg2 = await KnowledgeGraph.getInstance();
    expect(kg1).toBe(kg2);
  });

  it("should throw validation error when ingesting transcripts with empty threadId or empty transcript", async () => {
    const kg = await KnowledgeGraph.getInstance();
    
    expect(() => kg.ingestTranscript("", "some transcript")).toThrow("Invalid threadId");
    expect(() => kg.ingestTranscript("thread-123", "")).toThrow("Empty transcript");
  });

  it("should throw validation error when calling query with empty query", async () => {
    const kg = await KnowledgeGraph.getInstance();
    
    await expect(kg.query("", [])).rejects.toThrow("Empty query");
  });

  it("should throw validation error when recording messages with empty fields", async () => {
    const kg = await KnowledgeGraph.getInstance();

    await expect(kg.recordMessage("", "user", "hi")).rejects.toThrow("Invalid threadId");
    await expect(kg.recordMessage("thread-1", "", "hi")).rejects.toThrow("Invalid role");
    await expect(kg.recordMessage("thread-1", "user", "")).rejects.toThrow("Empty message");
  });

  it("should verify barrel public exports are mapped correctly", () => {
    expect(SyncService).toBeDefined();
    expect(getHybridMemory).toBeDefined();
    expect(initDb).toBeDefined();
  });
});
