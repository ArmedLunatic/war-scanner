import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { runAllProviders } from "@/lib/ingest";
import { normalizeNewItems } from "@/lib/pipeline/normalize";
import { clusterNewCandidates } from "@/lib/pipeline/cluster";
import { scoreAllClusters } from "@/lib/pipeline/score";
import { summarizeAllClusters } from "@/lib/pipeline/summarize";
import { publishFeedCache } from "@/lib/pipeline/publish";

// Vercel: allow up to 5 min for the pipeline on pro/enterprise plans
export const maxDuration = 300;

function verifyToken(expected: string, actual: string): boolean {
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(actual, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

interface PipelineStats {
  inserted: number;
  skipped: number;
  normalized: number;
  clustersCreated: number;
  clustersUpdated: number;
  errors: string[];
}

async function runPipeline(): Promise<PipelineStats> {
  const stats: PipelineStats = {
    inserted: 0,
    skipped: 0,
    normalized: 0,
    clustersCreated: 0,
    clustersUpdated: 0,
    errors: [],
  };

  // Step 1: Ingest — critical, abort if this fails entirely
  const ingestResult = await runAllProviders();
  stats.inserted = ingestResult.inserted;
  stats.skipped = ingestResult.skipped;
  console.log(`[ingest] Ingest: inserted=${stats.inserted}, skipped=${stats.skipped}`);

  // Step 2: Normalize — isolated
  try {
    stats.normalized = await normalizeNewItems();
    console.log(`[ingest] Normalized: ${stats.normalized}`);
  } catch (err) {
    const msg = `normalize failed: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[ingest] ${msg}`);
    stats.errors.push(msg);
  }

  // Step 3: Cluster — isolated
  try {
    const clusterResult = await clusterNewCandidates();
    stats.clustersCreated = clusterResult.created;
    stats.clustersUpdated = clusterResult.attached;
    console.log(`[ingest] Clusters: created=${stats.clustersCreated}, attached=${stats.clustersUpdated}`);
  } catch (err) {
    const msg = `cluster failed: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[ingest] ${msg}`);
    stats.errors.push(msg);
  }

  // Step 4: Score — isolated
  try {
    await scoreAllClusters();
    console.log("[ingest] Scored clusters");
  } catch (err) {
    const msg = `score failed: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[ingest] ${msg}`);
    stats.errors.push(msg);
  }

  // Step 5: Summarize — isolated
  try {
    await summarizeAllClusters();
    console.log("[ingest] Summarized clusters");
  } catch (err) {
    const msg = `summarize failed: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[ingest] ${msg}`);
    stats.errors.push(msg);
  }

  // Step 6: Publish — isolated (most important for frontend freshness)
  try {
    await publishFeedCache();
    console.log("[ingest] Feed cache published");
  } catch (err) {
    const msg = `publish failed: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[ingest] ${msg}`);
    stats.errors.push(msg);
  }

  if (stats.errors.length > 0) {
    console.warn(`[ingest] Pipeline completed with ${stats.errors.length} error(s)`);
  }

  return stats;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const adminToken = process.env.WAR_SCANNER_ADMIN_TOKEN ?? "";
  const authHeader = req.headers.get("Authorization") ?? "";
  const provided = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!adminToken || !verifyToken(adminToken, provided)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[ingest] Starting full pipeline run...");

  try {
    const stats = await runPipeline();
    return NextResponse.json({ ok: true, stats });
  } catch (err) {
    console.error("[ingest] Pipeline error:", err);
    return NextResponse.json({ error: "Pipeline error" }, { status: 500 });
  }
}

// Support Vercel Cron (GET with Authorization: Bearer <CRON_SECRET>)
// Also accepts WAR_SCANNER_ADMIN_TOKEN as fallback for flexibility.
export async function GET(req: NextRequest): Promise<NextResponse> {
  const cronSecret = process.env.CRON_SECRET ?? "";
  const adminToken = process.env.WAR_SCANNER_ADMIN_TOKEN ?? "";
  const authHeader = req.headers.get("Authorization") ?? "";
  const provided = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  const isAuthorized =
    (cronSecret && verifyToken(cronSecret, provided)) ||
    (adminToken && verifyToken(adminToken, provided));

  if (!isAuthorized) {
    console.warn("[ingest] Cron GET rejected — invalid or missing token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[ingest] Cron-triggered pipeline run...");

  try {
    const stats = await runPipeline();
    return NextResponse.json({ ok: true, stats });
  } catch (err) {
    console.error("[ingest] Pipeline error:", err);
    return NextResponse.json({ error: "Pipeline error" }, { status: 500 });
  }
}
