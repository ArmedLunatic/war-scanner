import { NextRequest, NextResponse, after } from "next/server";
import { timingSafeEqual } from "crypto";
import { runAllProviders } from "@/lib/ingest";
import { normalizeNewItems } from "@/lib/pipeline/normalize";
import { clusterNewCandidates } from "@/lib/pipeline/cluster";
import { scoreAllClusters } from "@/lib/pipeline/score";
import { summarizeAllClusters } from "@/lib/pipeline/summarize";
import { publishFeedCache } from "@/lib/pipeline/publish";

// Allow up to 5 min for the pipeline
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

async function runPipeline(): Promise<{
  inserted: number;
  skipped: number;
  normalized: number;
  clustersCreated: number;
  clustersUpdated: number;
}> {
  const ingestResult = await runAllProviders();
  console.log(`[ingest] Ingest: inserted=${ingestResult.inserted}, skipped=${ingestResult.skipped}`);

  const normalized = await normalizeNewItems();
  console.log(`[ingest] Normalized: ${normalized}`);

  const clusterResult = await clusterNewCandidates();
  console.log(`[ingest] Clusters: created=${clusterResult.created}, attached=${clusterResult.attached}`);

  await scoreAllClusters();
  console.log("[ingest] Scored clusters");

  await summarizeAllClusters();
  console.log("[ingest] Summarized clusters");

  await publishFeedCache();
  console.log("[ingest] Feed cache published");

  return {
    inserted: ingestResult.inserted,
    skipped: ingestResult.skipped,
    normalized,
    clustersCreated: clusterResult.created,
    clustersUpdated: clusterResult.attached,
  };
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

// Called by cron-job.org every 15 minutes.
// Configure the job with: GET <your-domain>/api/admin/run-ingest
// Header: Authorization: Bearer <CRON_SECRET>
// Returns 202 immediately; the pipeline runs in the background via after().
export async function GET(req: NextRequest): Promise<NextResponse> {
  const cronSecret = process.env.CRON_SECRET ?? "";
  const authHeader = req.headers.get("Authorization") ?? "";
  const provided = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!cronSecret || !verifyToken(cronSecret, provided)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[ingest] Cron-triggered pipeline run (background)...");

  after(async () => {
    try {
      const stats = await runPipeline();
      console.log("[ingest] Pipeline complete:", stats);
    } catch (err) {
      console.error("[ingest] Pipeline error:", err);
    }
  });

  return NextResponse.json({ ok: true, message: "Pipeline triggered" }, { status: 202 });
}
