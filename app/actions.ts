"use server";

import { GoAOrchestrator } from "@/lib/goa/engine";
import { ModelCard, AdjacencyMatrix } from "@/lib/goa/types";
import * as fs from "fs";
import * as path from "path";

const modelsPath = path.join(process.cwd(), "config/models.json");
const allCards: ModelCard[] = JSON.parse(fs.readFileSync(modelsPath, "utf-8"));

export async function processChat(query: string) {
  try {
    const orchestrator = new GoAOrchestrator();
    const result = await orchestrator.run(query, allCards);
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
  try {
    const orchestrator = new GoAOrchestrator();
    const result = await orchestrator.resume(query, existingLog, selectedAgents, matrix);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
import { KnowledgeGraph } from "@/lib/kg";

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
  try {
    const { storeTriplets } = await import("@/lib/kg/db");
    await storeTriplets(triplets);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
