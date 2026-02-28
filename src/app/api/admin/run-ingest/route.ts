import { NextRequest, NextResponse } from "next/server";
import { runAllProviders } from "@/lib/ingest";
import { normalizeNewItems } from "@/lib/pipeline/normalize";
import { clusterNewCandidates } from "@/lib/pipeline/cluster";
import { scoreAllClusters } from "@/lib/pipeline/score";
import { summarizeAllClusters } from "@/lib/pipeline/summarize";
import { publishFeedCache } from "@/lib/pipeline/publish";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const adminToken = process.env.WAR_SCANNER_ADMIN_TOKEN;
  const authHeader = req.headers.get("Authorization");

  if (!adminToken || authHeader !== `Bearer ${adminToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[ingest] Starting full pipeline run...");

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

    return NextResponse.json({
      ok: true,
      stats: {
        inserted: ingestResult.inserted,
        skipped: ingestResult.skipped,
        normalized,
        clustersCreated: clusterResult.created,
        clustersUpdated: clusterResult.attached,
      },
    });
  } catch (err) {
    console.error("[ingest] Pipeline error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
