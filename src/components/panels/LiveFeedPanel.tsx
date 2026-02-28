"use client";
import { useEffect, useState, useCallback } from "react";
import { PanelShell } from "./PanelShell";
import type { FeedResponse, ClusterCard } from "@/lib/types";

const REFRESH_MS = 3 * 60 * 1000;

function severityColor(s: number) {
  if (s >= 5) return "#e03e3e";
  if (s >= 4) return "#f97316";
  if (s >= 3) return "#d97706";
  return "#22c55e";
}

function confidenceColor(c: string) {
  if (c === "HIGH") return "#22c55e";
  if (c === "MED") return "#d97706";
  return "#e03e3e";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function LiveFeedPanel() {
  const [clusters, setClusters] = useState<ClusterCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(0);

  const fetchFeed = useCallback(async () => {
    try {
      const base =
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000";
      const res = await fetch(
        `${base}/api/events?limit=15&country=Israel,Iran,Lebanon,Gaza,Yemen`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const data: FeedResponse = await res.json();
      setClusters(data.clusters);
      setLastFetch(Date.now());
    } catch {
      // noop
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
    const id = setInterval(fetchFeed, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchFeed]);

  return (
    <PanelShell id="live" title="Live Events" icon="📡">
      {loading ? (
        <div
          style={{
            padding: "24px",
            textAlign: "center",
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "#3d4f63",
            letterSpacing: "0.1em",
          }}
        >
          LOADING...
        </div>
      ) : clusters.length === 0 ? (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            fontSize: "11px",
            color: "#6b7a8d",
          }}
        >
          No events — run{" "}
          <code
            style={{
              fontFamily: "var(--font-mono)",
              color: "#60a5fa",
              fontSize: "10px",
            }}
          >
            npm run ingest
          </code>
        </div>
      ) : (
        <div>
          {clusters.map((c) => (
            <a
              key={c.id}
              href={`/event/${c.id}`}
              style={{ display: "block", textDecoration: "none" }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid rgba(30,42,56,0.6)",
                  borderLeft: `2px solid ${severityColor(c.severity)}`,
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "rgba(96,165,250,0.04)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "transparent")
                }
              >
                {/* Headline */}
                <div
                  style={{
                    fontSize: "11px",
                    color: "#e2e8f0",
                    lineHeight: 1.45,
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  {c.headline}
                </div>

                {/* Meta row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  {c.country && (
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "9px",
                        color: "#60a5fa",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {c.country}
                    </span>
                  )}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "9px",
                      color: confidenceColor(c.confidence),
                      letterSpacing: "0.04em",
                    }}
                  >
                    {c.confidence}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "9px",
                      color: "#3d4f63",
                      marginLeft: "auto",
                    }}
                  >
                    {timeAgo(c.last_updated_at)}
                  </span>
                </div>
              </div>
            </a>
          ))}

          {/* Footer */}
          <div
            style={{
              padding: "8px 14px",
              textAlign: "center",
              borderTop: "1px solid rgba(30,42,56,0.6)",
            }}
          >
            <a
              href="/feed"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                letterSpacing: "0.1em",
                color: "#60a5fa",
                textDecoration: "none",
                textTransform: "uppercase",
              }}
            >
              View Full Feed →
            </a>
          </div>
        </div>
      )}
    </PanelShell>
  );
}
