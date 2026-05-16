import { chatWithRetry } from "../openrouter/client";

const EXTRACTION_MODEL = "openrouter/owl-alpha";

import { KnowledgeTriplet as Triplet } from "../goa/types";

export const EXTRACTION_PROMPT = (transcript: string) => `
You are a world-class Knowledge Graph extraction agent. 
Your task is to extract meaningful semantic triplets (Subject-Predicate-Object) from the following conversation transcript.

Transcript:
"${transcript}"

Requirements:
1. Extract as many unique, factual triplets as possible.
2. Predicates should be concise (e.g., "mentions", "defined_as", "related_to").
3. Use a flat JSON format.
4. If no meaningful triplets are found, return an empty array.

Respond ONLY with a JSON object in this format:
{
  "triplets": [
    { "subject": "Prime Numbers", "predicate": "used_in", "object": "RSA Encryption" },
    ...
  ]
}
`;

export async function extractTriplets(transcript: string): Promise<Triplet[]> {
  const response = await chatWithRetry(
    [{ role: "user", content: EXTRACTION_PROMPT(transcript) }],
    { model: EXTRACTION_MODEL, json_mode: true }
  );

  try {
    const { triplets } = JSON.parse(response);
    return triplets as Triplet[];
  } catch (error) {
    console.error("Failed to parse triplets from Owl Alpha:", error);
    return [];
  }
}
