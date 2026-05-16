import { chatWithRetry } from "../openrouter/client";
import { KnowledgeTriplet as Triplet } from "../goa/types";

const EXTRACTION_MODEL = "openrouter/owl-alpha";

export const EXTRACTION_PROMPT = (transcript: string) => `
### SYSTEM ROLE
You are a world-class Knowledge Graph extraction agent. Your goal is to identify and extract factual semantic triplets (Subject-Predicate-Object) from transcripts.

### TARGET TRANSCRIPT
"${transcript}"

### EXTRACTION REQUIREMENTS
1. Extract as many unique, factual, and meaningful triplets as possible.
2. Predicates should be concise (e.g., "mentions", "defined_as", "related_to").
3. Use a flat JSON format representing relations.
4. If no meaningful triplets are found, return an empty array under the 'triplets' key.

### OUTPUT SCHEMA
Return ONLY a raw JSON object:
{
  "triplets": [
    { "subject": "string", "predicate": "string", "object": "string" }
  ]
}
`;

export async function extractTriplets(transcript: string): Promise<Triplet[]> {
  // [BEH-3] Short-circuit on empty input
  if (!transcript || !transcript.trim()) {
    return [];
  }

  const response = await chatWithRetry(
    [{ role: "user", content: EXTRACTION_PROMPT(transcript) }],
    { model: EXTRACTION_MODEL, json_mode: true }
  );

  try {
    const { triplets } = JSON.parse(response);
    if (!triplets || !Array.isArray(triplets)) {
      return [];
    }
    return triplets as Triplet[];
  } catch (error) {
    console.error("Failed to parse triplets from Owl Alpha:", error);
    return [];
  }
}
