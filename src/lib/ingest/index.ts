import { ingestGdelt } from "./providers/gdelt";
import { ingestReliefWeb } from "./providers/reliefweb";

export interface IngestResult {
  inserted: number;
  skipped: number;
}

export async function runAllProviders(): Promise<IngestResult> {
  console.log("▶ Starting ingestion...");

  let totalInserted = 0;
  let totalSkipped = 0;

  console.log("  → GDELT 2.1");
  try {
    const gdelt = await ingestGdelt();
    console.log(`    inserted=${gdelt.inserted} skipped=${gdelt.skipped}`);
    totalInserted += gdelt.inserted;
    totalSkipped += gdelt.skipped;
  } catch (err) {
    console.error("GDELT ingestion failed:", err);
  }

  console.log("  → ReliefWeb");
  try {
    const rw = await ingestReliefWeb();
    console.log(`    inserted=${rw.inserted} skipped=${rw.skipped}`);
    totalInserted += rw.inserted;
    totalSkipped += rw.skipped;
  } catch (err) {
    console.error("ReliefWeb ingestion failed:", err);
  }

  console.log(`▶ Ingestion done. inserted=${totalInserted} skipped=${totalSkipped}`);
  return { inserted: totalInserted, skipped: totalSkipped };
}
