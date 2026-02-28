import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";
import type { ClusterDetail } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = getServerClient();

  try {
    const { data: cluster, error } = await supabase
      .from("clusters")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !cluster) {
      return NextResponse.json({ error: "Cluster not found" }, { status: 404 });
    }

    const { data: sources } = await supabase
      .from("cluster_sources")
      .select("url, source_name, domain, published_at")
      .eq("cluster_id", id)
      .order("published_at", { ascending: false });

    const detail: ClusterDetail = {
      ...cluster,
      sources: (sources ?? []).map((s) => ({
        url: s.url,
        source_name: s.source_name,
        domain: s.domain,
        published_at: s.published_at,
      })),
    };

    return NextResponse.json(detail);
  } catch (err) {
    console.error(`GET /api/events/${id} error:`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
