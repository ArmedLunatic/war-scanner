import { notFound } from "next/navigation";
import Link from "next/link";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { CategoryTag } from "@/components/CategoryTag";
import { SourcesList } from "@/components/SourcesList";
import type { ClusterDetail } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getCluster(id: string): Promise<ClusterDetail | null> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/events/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cluster = await getCluster(id);

  if (!cluster) notFound();

  return (
    <div style={{ maxWidth: "48rem", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/"
          className="link-hover-blue"
          style={{
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.06em",
            color: "var(--text-muted)",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          ← Feed
        </Link>
      </div>

      <article>
        {/* Hero: country + headline */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "1.5rem",
            marginBottom: "1.25rem",
          }}
        >
          {cluster.country && (
            <p
              style={{
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: "8px",
              }}
            >
              {cluster.country}
            </p>
          )}
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1.4,
              marginBottom: "14px",
            }}
          >
            {cluster.headline}
          </h1>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", marginBottom: "14px" }}>
            <CategoryTag category={cluster.category} />
            <ConfidenceBadge confidence={cluster.confidence} />
            <span
              style={{
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                color: "var(--text-dim)",
                letterSpacing: "0.04em",
              }}
            >
              score {Math.round(cluster.score)}
            </span>
          </div>

          {/* Timeline */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              paddingTop: "12px",
              borderTop: "1px solid var(--border)",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              color: "var(--text-dim)",
              letterSpacing: "0.02em",
            }}
          >
            <span>First seen: {new Date(cluster.first_seen_at).toLocaleString()}</span>
            <span>Last updated: {new Date(cluster.last_updated_at).toLocaleString()}</span>
          </div>
        </div>

        {/* What we know */}
        {cluster.summary_know.length > 0 && (
          <section style={{ marginBottom: "1.25rem" }}>
            <h2
              style={{
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--accent-green)",
                marginBottom: "10px",
              }}
            >
              What we know
            </h2>
            <ul className="section-know" style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              {cluster.summary_know.map((bullet, i) => (
                <li key={i} style={{ display: "flex", gap: "10px", fontSize: "14px", color: "var(--text-secondary)" }}>
                  <span style={{ color: "var(--accent-green)", flexShrink: 0, fontSize: "12px", marginTop: "2px" }}>✓</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Still unclear */}
        {cluster.summary_unclear.length > 0 && (
          <section style={{ marginBottom: "1.25rem" }}>
            <h2
              style={{
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--accent-amber)",
                marginBottom: "10px",
              }}
            >
              Still unclear
            </h2>
            <ul
              className="section-unclear"
              style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}
            >
              {cluster.summary_unclear.map((bullet, i) => (
                <li key={i} style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  {bullet}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Context */}
        {cluster.summary_why && (
          <section style={{ marginBottom: "1.25rem" }}>
            <h2
              style={{
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--accent-blue)",
                marginBottom: "10px",
              }}
            >
              Context
            </h2>
            <div className="section-context">
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {cluster.summary_why}
              </p>
            </div>
          </section>
        )}

        {/* Sources */}
        <section
          style={{
            marginTop: "1.5rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid var(--border)",
          }}
        >
          <h2
            style={{
              fontSize: "10px",
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: "12px",
            }}
          >
            Sources ({cluster.sources.length})
          </h2>
          <SourcesList sources={cluster.sources} max={20} />
        </section>

        {/* Keywords */}
        {cluster.keywords.length > 0 && (
          <section
            style={{
              marginTop: "1.25rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {cluster.keywords.slice(0, 15).map((kw) => (
                <span
                  key={kw}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    letterSpacing: "0.04em",
                    padding: "2px 8px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "2px",
                    color: "var(--text-dim)",
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
