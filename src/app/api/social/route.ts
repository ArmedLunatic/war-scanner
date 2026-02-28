import { NextResponse } from "next/server";
import { fetchAllSocialSources } from "@/lib/ingest/providers/socialFeeds";
import type { SocialResponse } from "@/lib/types";

// In-memory cache
let cache: { data: SocialResponse; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function GET() {
  try {
    const now = Date.now();

    // Return cached response if still fresh
    if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
      return NextResponse.json(cache.data, {
        headers: { "X-Cache": "HIT", "Cache-Control": "no-store" },
      });
    }

    const { posts, activeSources } = await fetchAllSocialSources();

    const response: SocialResponse = {
      posts,
      generatedAt: new Date().toISOString(),
      sources: activeSources,
    };

    cache = { data: response, fetchedAt: now };

    return NextResponse.json(response, {
      headers: { "X-Cache": "MISS", "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[social] Error:", err);
    return NextResponse.json(
      { posts: [], generatedAt: new Date().toISOString(), sources: [] },
      { status: 500 }
    );
  }
}
