#!/usr/bin/env tsx
/**
 * Warspy — Local dev ingest runner
 * Usage: npm run ingest
 *
 * Reads .env.local (via dotenv), then runs the full pipeline in sequence.
 * Logs each step with timing. Exits 0 on success, 1 on error.
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local from project root
config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  // Dynamic imports AFTER env is loaded
  const { runAllProviders } = await import("../src/lib/ingest/index");
  const { normalizeNewItems } = await import("../src/lib/pipeline/normalize");
  const { clusterNewCandidates } = await import("../src/lib/pipeline/cluster");
  const { scoreAllClusters } = await import("../src/lib/pipeline/score");
  const { summarizeAllClusters } = await import("../src/lib/pipeline/summarize");
  const { publishFeedCache } = await import("../src/lib/pipeline/publish");

  console.log("=".repeat(60));
  console.log("WARSPY — INGEST PIPELINE");
  console.log("=".repeat(60));
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log();

  const totalStart = Date.now();

  // Step 1: Ingest
  let t = Date.now();
  console.log("Step 1/6: Ingesting from providers...");
  const ingestResult = await runAllProviders();
  console.log(
    `  ✓ inserted=${ingestResult.inserted} skipped=${ingestResult.skipped} [${Date.now() - t}ms]`,
  );
  console.log();

  // Step 2: Normalize
  t = Date.now();
  console.log("Step 2/6: Normalizing raw items...");
  const normalized = await normalizeNewItems();
  console.log(`  ✓ normalized=${normalized} [${Date.now() - t}ms]`);
  console.log();

  // Step 3: Cluster
  t = Date.now();
  console.log("Step 3/6: Clustering candidates...");
  const clusterResult = await clusterNewCandidates();
  console.log(
    `  ✓ created=${clusterResult.created} attached=${clusterResult.attached} [${Date.now() - t}ms]`,
  );
  console.log();

  // Step 4: Score
  t = Date.now();
  console.log("Step 4/6: Scoring clusters...");
  await scoreAllClusters();
  console.log(`  ✓ done [${Date.now() - t}ms]`);
  console.log();

  // Step 5: Summarize
  t = Date.now();
  console.log("Step 5/6: Generating summaries...");
  await summarizeAllClusters();
  console.log(`  ✓ done [${Date.now() - t}ms]`);
  console.log();

  // Step 6: Publish
  t = Date.now();
  console.log("Step 6/6: Publishing feed cache...");
  await publishFeedCache();
  console.log(`  ✓ done [${Date.now() - t}ms]`);
  console.log();

  console.log("=".repeat(60));
  console.log(`Pipeline complete in ${Date.now() - totalStart}ms`);
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("\n[ERROR]", err);
  process.exit(1);
});
