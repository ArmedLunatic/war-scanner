import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";
import type { ClusterCard, FeedResponse } from "@/lib/types";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  const country = searchParams.get("country");
  const category = searchParams.get("category");
  const confidence = searchParams.get("confidence");
  const page = parseInt(searchParams.get("page") ?? "0", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);

  const supabase = getServerClient();

  try {
    // Try to load from feed cache first
    const { data: cache } = await supabase
      .from("feed_cache")
      .select("payload, generated_at")
      .eq("key", "global:top")
      .single();

    let clusters: ClusterCard[] = [];
    let generatedAt = new Date().toISOString();

    if (cache) {
      clusters = (cache.payload as ClusterCard[]) ?? [];
      generatedAt = cache.generated_at;
    } else {
      // Fallback: query DB directly
      const { data, error } = await supabase
        .from("clusters")
        .select("*")
        .eq("is_active", true)
        .order("score", { ascending: false })
        .limit(200);

      if (error) throw error;
      clusters = (data ?? []) as ClusterCard[];
    }

    // Apply filters
    if (country) {
      clusters = clusters.filter(
        (c) => c.country?.toLowerCase() === country.toLowerCase(),
      );
    }
    if (category) {
      clusters = clusters.filter((c) => c.category === category);
    }
    if (confidence) {
      clusters = clusters.filter((c) => c.confidence === confidence.toUpperCase());
    }

    const total = clusters.length;
    const paged = clusters.slice(page * limit, (page + 1) * limit);

    const response: FeedResponse = { clusters: paged, total, generatedAt };
    return NextResponse.json(response);
  } catch (err) {
    console.error("GET /api/events error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
