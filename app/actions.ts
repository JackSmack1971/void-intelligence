"use server";

import { runGoA } from "@/lib/goa/engine";
import { ModelCard } from "@/lib/goa/types";
import * as fs from "fs";
import * as path from "path";

export async function processChat(query: string) {
  const modelsPath = path.join(process.cwd(), "config/models.json");
  const allCards: ModelCard[] = JSON.parse(fs.readFileSync(modelsPath, "utf-8"));

  // This is a simplified version for the server action.
  // In a real app with streaming, we'd use a different approach (Route Handler).
  try {
    const result = await runGoA(query, allCards);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
