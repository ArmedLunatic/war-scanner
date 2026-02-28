import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";
import type { StatusResponse } from "@/lib/types";

export async function GET(): Promise<NextResponse> {
  const supabase = getServerClient();

  try {
    const [rawResult, clusterResult, cacheResult] = await Promise.all([
      supabase.from("raw_items").select("fetched_at").order("fetched_at", { ascending: false }).limit(1),
      supabase.from("clusters").select("id", { count: "exact" }).eq("is_active", true),
      supabase.from("feed_cache").select("generated_at").eq("key", "global:top").single(),
    ]);

    const { count: rawCount } = await supabase
      .from("raw_items")
      .select("*", { count: "exact", head: true });

    const status: StatusResponse = {
      lastIngestAt: rawResult.data?.[0]?.fetched_at ?? null,
      totalRawItems: rawCount ?? 0,
      totalClusters: clusterResult.count ?? 0,
      feedCacheGeneratedAt: cacheResult.data?.generated_at ?? null,
      ok: true,
    };

    return NextResponse.json(status);
  } catch (err) {
    console.error("GET /api/status error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
