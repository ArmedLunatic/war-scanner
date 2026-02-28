import Link from "next/link";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { CategoryTag } from "@/components/CategoryTag";
import type { ClusterCard } from "@/lib/types";

interface BriefResponse {
  clusters: ClusterCard[];
  hours: number;
  generatedAt: string;
}

async function getBrief(hours = 12): Promise<BriefResponse | null> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/brief?hours=${hours}`, {
      next: { revalidate: 180 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function BriefPage() {
  const brief = await getBrief(12);

  return (
    <div style={{ maxWidth: "48rem", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
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
          Top 10 — Last 12 Hours
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.6 }}>
          Highest-scoring conflict events ranked by severity, source corroboration, and recency.
        </p>
        {brief && (
          <p
            style={{
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              color: "var(--text-dim)",
              marginTop: "6px",
            }}
          >
            Generated {new Date(brief.generatedAt).toLocaleString()}
          </p>
        )}
      </div>

      {!brief || brief.clusters.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px" }}>
            No events in the last 12 hours
          </p>
          <Link
            href="/"
            style={{
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              color: "var(--accent-blue)",
              textDecoration: "underline",
            }}
          >
            View all events →
          </Link>
        </div>
      ) : (
        <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
          {brief.clusters.map((cluster, i) => (
            <li key={cluster.id} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
              {/* Rank number */}
              <span className="rank-num">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Card */}
              <div
                style={{
                  flex: 1,
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "14px 16px",
                }}
              >
                {/* Tags row */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", marginBottom: "8px" }}>
                  <CategoryTag category={cluster.category} />
                  <ConfidenceBadge confidence={cluster.confidence} />
                  {cluster.country && (
                    <span
                      style={{
                        fontSize: "10px",
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--text-muted)",
                      }}
                    >
                      {cluster.country}
                    </span>
                  )}
                </div>

                {/* Headline */}
                <Link
                  href={`/event/${cluster.id}`}
                  className="link-hover-blue"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    lineHeight: 1.4,
                    marginBottom: "8px",
                  }}
                >
                  {cluster.headline}
                </Link>

                {/* First bullet */}
                {cluster.summary_know[0] && (
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "10px" }}>
                    {cluster.summary_know[0]}
                  </p>
                )}

                {/* Footer */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-dim)",
                    paddingTop: "8px",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <span>{cluster.sources_count} source{cluster.sources_count !== 1 ? "s" : ""}</span>
                  <span>score {Math.round(cluster.score)}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
