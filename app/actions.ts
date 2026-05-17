"use server";

import { GoAOrchestrator, ModelCard, AdjacencyMatrix } from "@/lib/goa";
import * as fs from "fs";
import * as path from "path";
import { KnowledgeGraph } from "@/lib/kg";

let cachedCards: ModelCard[] | null = null;

async function getModelCardsCached(): Promise<ModelCard[]> {
  if (cachedCards) return cachedCards;
  try {
    const modelsPath = path.join(process.cwd(), "config/models.json");
    const content = await fs.promises.readFile(modelsPath, "utf-8");
    cachedCards = JSON.parse(content);
    return cachedCards || [];
  } catch {
    return [];
  }
}

export async function processChat(query: string) {
  const sanitizedQuery = (query || "").trim();
  if (!sanitizedQuery) {
    return { success: false, error: "Query cannot be empty or only whitespace." };
  }
  try {
    const orchestrator = new GoAOrchestrator();
    const allCards = await getModelCardsCached();
    const result = await orchestrator.run(sanitizedQuery, allCards);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function processIntervention(
  query: string, 
  existingLog: any[], 
  selectedAgents: ModelCard[], 
  matrix: AdjacencyMatrix
) {
  const sanitizedQuery = (query || "").trim();
  if (!sanitizedQuery) {
    return { success: false, error: "Intervention query cannot be empty or only whitespace." };
  }
  try {
    const orchestrator = new GoAOrchestrator();
    const result = await orchestrator.resume(sanitizedQuery, existingLog || [], selectedAgents || [], matrix);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function syncKg() {
  try {
    const kg = await KnowledgeGraph.getInstance();
    const triplets = await kg.dump();
    return { success: true, data: triplets };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTripletsForExport() {
  return syncKg();
}

export async function importSelectedTriplets(triplets: any[]) {
  if (!Array.isArray(triplets)) {
    return { success: false, error: "Invalid triplets payload: expected array." };
  }
  if (triplets.length === 0) {
    return { success: true };
  }
  try {
    const { storeTriplets } = await import("@/lib/kg/db");
    await storeTriplets(triplets);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function importSelectedTripletsDelta(
  added: any[],
  modified: any[]
) {
  if (!Array.isArray(added) || !Array.isArray(modified)) {
    return { success: false, error: "Invalid triplets payload: expected arrays for added and modified." };
  }
  try {
    const { replaceTriplets } = await import("@/lib/kg");
    await replaceTriplets(added, modified);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
