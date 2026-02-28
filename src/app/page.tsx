import { Suspense } from "react";
import { EventCard } from "@/components/EventCard";
import { FilterBar } from "@/components/FilterBar";
import { LastUpdated } from "@/components/LastUpdated";
import type { FeedResponse } from "@/lib/types";

interface PageProps {
  searchParams: Promise<{
    country?: string;
    category?: string;
    confidence?: string;
    page?: string;
  }>;
}

async function getFeed(params: Awaited<PageProps["searchParams"]>): Promise<FeedResponse | null> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const qs = new URLSearchParams();
  if (params.country) qs.set("country", params.country);
  if (params.category) qs.set("category", params.category);
  if (params.confidence) qs.set("confidence", params.confidence);
  if (params.page) qs.set("page", params.page);
  qs.set("limit", "20");

  try {
    const res = await fetch(`${base}/api/events?${qs.toString()}`, {
      next: { revalidate: 180 }, // 3 minutes
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function FeedPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const feed = await getFeed(params);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Global Conflict Feed</h1>
        <p className="text-sm text-gray-600">
          Aggregated and ranked reports from GDELT 2.1 + ReliefWeb. No LLM inference.
          Confidence reflects source corroboration, not editorial judgement.
        </p>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <Suspense>
          <FilterBar />
        </Suspense>
        <div className="text-right">
          {feed && <LastUpdated generatedAt={feed.generatedAt} />}
          {feed && (
            <p className="text-xs text-gray-400">{feed.total} events</p>
          )}
        </div>
      </div>

      {/* Cards */}
      {!feed && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg font-medium mb-2">No data available</p>
          <p className="text-sm">
            Run the ingest pipeline first:{" "}
            <code className="bg-gray-100 px-1 rounded">npm run ingest</code>
          </p>
        </div>
      )}

      {feed && feed.clusters.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg font-medium mb-2">No events match your filters</p>
        </div>
      )}

      {feed && feed.clusters.length > 0 && (
        <div className="grid gap-4">
          {feed.clusters.map((cluster) => (
            <EventCard key={cluster.id} cluster={cluster} />
          ))}
        </div>
      )}
    </div>
  );
}
