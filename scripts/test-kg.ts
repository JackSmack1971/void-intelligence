import { extractTriplets } from "../lib/kg/extraction";
import { initDb, storeTriplets, getAllTriplets } from "../lib/kg/db";

async function test() {
  console.log("Initializing Database...");
  await initDb();

  const transcript = "User: How does RSA encryption work? Assistant: RSA encryption uses large prime numbers to generate public and private keys. The difficulty of factoring the product of two large primes provides the security.";

  console.log("Extracting Triplets...");
  // Note: This requires OPENROUTER_API_KEY
  try {
    const triplets = await extractTriplets(transcript);
    console.log("Extracted:", triplets);

    if (triplets.length > 0) {
      console.log("Storing Triplets...");
      await storeTriplets(triplets);
      
      console.log("Retrieving all triplets from DB...");
      const all = await getAllTriplets();
      console.log("All Triplets in DB:", all);
    } else {
      console.log("No triplets extracted (Mocking one for DB test)...");
      await storeTriplets([{ subject: "RSA", predicate: "uses", object: "Prime Numbers" }]);
      const all = await getAllTriplets();
      console.log("All Triplets in DB (including mock):", all);
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

test();
