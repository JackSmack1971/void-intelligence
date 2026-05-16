import { runGoA, ModelCard } from "../lib/goa";
import * as fs from "fs";
import * as path from "path";

// Load models from config
const modelsPath = path.join(__dirname, "../config/models.json");
const allCards: ModelCard[] = JSON.parse(fs.readFileSync(modelsPath, "utf-8"));

async function test() {
  const query = "Explain the relationship between prime numbers and encryption algorithms.";
  
  console.log("Testing GoA Engine...");
  try {
    const result = await runGoA(query, allCards, { k: 3, pooling: "mean" });
    
    console.log("\n--- FINAL RESPONSE ---");
    console.log(result.finalResponse);
    console.log("\n--- METRICS ---");
    console.log(`Source Nodes: ${result.sourceNodes.join(", ")}`);
    console.log(`Target Nodes: ${result.targetNodes.join(", ")}`);
    console.log("Matrix:", JSON.stringify(result.matrix, null, 2));
    
  } catch (error) {
    console.error("Test failed:", error);
  }
}

test();
