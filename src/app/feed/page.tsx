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
      next: { revalidate: 180 },
      signal: AbortSignal.timeout(10_000),
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
    <div
      style={{
        maxWidth: "64rem",
        margin: "0 auto",
        padding: "80px 1.5rem 2.5rem",
      }}
    >
      {/* Page header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "6px",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}
        >
          Global Conflict Feed
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.6, maxWidth: "42rem" }}>
          Aggregated and ranked reports from GDELT 2.1 + ReliefWeb.
          Confidence reflects source corroboration, not editorial judgement.
        </p>
      </div>

      {/* Filter + status bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "1.5rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Suspense>
          <FilterBar />
        </Suspense>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
          {feed && <LastUpdated generatedAt={feed.generatedAt} />}
          {feed && (
            <span
              style={{
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                color: "var(--text-dim)",
                letterSpacing: "0.04em",
              }}
            >
              {feed.total} events
            </span>
          )}
        </div>
      </div>

      {!feed && (
        <div className="empty-state">
          <div
            style={{
              width: "40px",
              height: "40px",
              margin: "0 auto 16px",
              borderRadius: "50%",
              background: "rgba(224,62,62,0.08)",
              border: "1px solid rgba(224,62,62,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}
          >
            ⚠
          </div>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
            No data available
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Run the ingest pipeline first:{" "}
            <code
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "3px",
                padding: "1px 6px",
                color: "var(--accent-blue)",
              }}
            >
              npm run ingest
            </code>
          </p>
        </div>
      )}

      {feed && feed.clusters.length === 0 && (
        <div className="empty-state">
          <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
            No events match your filters
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Try clearing the filters to see all events.
          </p>
        </div>
      )}

      {feed && feed.clusters.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {feed.clusters.map((cluster) => (
            <EventCard key={cluster.id} cluster={cluster} />
          ))}
        </div>
      )}
    </div>
  );
}
