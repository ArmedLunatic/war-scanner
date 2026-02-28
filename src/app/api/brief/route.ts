import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";
import type { ClusterCard } from "@/lib/types";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  const hours = Math.min(parseInt(searchParams.get("hours") ?? "12", 10), 48);

  const supabase = getServerClient();

  try {
    const { data: cache } = await supabase
      .from("feed_cache")
      .select("payload, generated_at")
      .eq("key", "global:top")
      .single();

    let clusters: ClusterCard[] = [];

    if (cache) {
      const windowStart = new Date(Date.now() - hours * 3600 * 1000).toISOString();
      clusters = ((cache.payload as ClusterCard[]) ?? []).filter(
        (c) => c.last_updated_at >= windowStart,
      );
    } else {
      const windowStart = new Date(Date.now() - hours * 3600 * 1000).toISOString();
      const { data, error } = await supabase
        .from("clusters")
        .select("*")
        .eq("is_active", true)
        .gte("last_updated_at", windowStart)
        .order("score", { ascending: false })
        .limit(10);
      if (error) throw error;
      clusters = (data ?? []) as ClusterCard[];
    }

    return NextResponse.json({
      clusters: clusters.slice(0, 10),
      hours,
      generatedAt: cache?.generated_at ?? new Date().toISOString(),
    });
  } catch (err) {
    console.error("GET /api/brief error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
