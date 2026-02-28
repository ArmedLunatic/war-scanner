"use client";
import { useEffect, useState, useCallback } from "react";
import { PanelShell } from "./PanelShell";
import { Tooltip } from "@/components/Tooltip";
import type { FeedResponse, ClusterCard } from "@/lib/types";

const REFRESH_MS = 3 * 60 * 1000;
const REALTIME_AVAILABLE =
  typeof process !== "undefined" &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
  const [error, setError] = useState(false);
  const [lastFetch, setLastFetch] = useState(0);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [newCount, setNewCount] = useState(0);

  const fetchFeed = useCallback(async () => {
    try {
      const base =
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000";
      const res = await fetch(
        `${base}/api/events?limit=15`,
        { cache: "no-store", signal: AbortSignal.timeout(10_000) }
      );
      if (!res.ok) {
        setError(true);
        return;
      }
      const data: FeedResponse = await res.json();
      setClusters(data.clusters);
      setError(false);
      setLastFetch(Date.now());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + polling fallback
  useEffect(() => {
    fetchFeed();
    const id = setInterval(fetchFeed, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchFeed]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (!REALTIME_AVAILABLE) return;
    let channel: ReturnType<import("@supabase/supabase-js").SupabaseClient["channel"]> | null = null;
    import("@/lib/supabase")
      .then(({ getBrowserClient }) => {
        const supabase = getBrowserClient();
        channel = supabase
          .channel("clusters-realtime")
          .on(
            "postgres_changes" as any,
            { event: "INSERT", schema: "public", table: "clusters" },
            () => {
              fetchFeed();
              setNewCount((c) => c + 1);
            }
          )
          .subscribe((status: string) => {
            setRealtimeConnected(status === "SUBSCRIBED");
          });
      })
      .catch(() => {});
    return () => {
      if (channel) {
        import("@/lib/supabase").then(({ getBrowserClient }) => {
          getBrowserClient().removeChannel(channel!);
        }).catch(() => {});
      }
    };
  }, [fetchFeed]);

  const title = (
    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      Live Events
      {realtimeConnected && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "3px",
            fontFamily: "var(--font-mono)",
            fontSize: "7px",
            letterSpacing: "0.1em",
            color: "#22c55e",
          }}
        >
          <span className="live-dot" style={{ width: "5px", height: "5px" }} />
          REALTIME
        </span>
      )}
      {newCount > 0 && (
        <span
          onClick={() => setNewCount(0)}
          style={{
            background: "#e03e3e",
            color: "#fff",
            fontFamily: "var(--font-mono)",
            fontSize: "7px",
            letterSpacing: "0.06em",
            padding: "1px 5px",
            borderRadius: "2px",
            cursor: "pointer",
          }}
        >
          {newCount} NEW
        </span>
      )}
    </span>
  );

  return (
    <PanelShell id="live" title={title} icon="📡">
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
      ) : error ? (
        <div
          style={{
            padding: "20px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              letterSpacing: "0.12em",
              color: "#e03e3e",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            DATA UNAVAILABLE — SOURCE OFFLINE
          </div>
          <button
            onClick={() => { setLoading(true); fetchFeed(); }}
            style={{
              background: "rgba(224,62,62,0.08)",
              border: "1px solid rgba(224,62,62,0.25)",
              borderRadius: "3px",
              cursor: "pointer",
              padding: "6px 16px",
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              letterSpacing: "0.1em",
              color: "#e03e3e",
              textTransform: "uppercase",
            }}
          >
            ↻ Retry
          </button>
        </div>
      ) : clusters.length === 0 ? (
        <div
          style={{
            padding: "28px 20px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "#3d4f63",
              letterSpacing: "0.1em",
            }}
          >
            No events yet
          </div>
          <button
            onClick={fetchFeed}
            style={{
              background: "rgba(96,165,250,0.08)",
              border: "1px solid rgba(96,165,250,0.2)",
              borderRadius: "3px",
              cursor: "pointer",
              padding: "7px 18px",
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.1em",
              color: "#60a5fa",
              textTransform: "uppercase",
              transition: "background 0.12s, border-color 0.12s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(96,165,250,0.14)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(96,165,250,0.35)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(96,165,250,0.08)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(96,165,250,0.2)";
            }}
          >
            ↻ Refresh
          </button>
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
                  <Tooltip text="Source reliability — based on corroboration across multiple feeds">
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
                  </Tooltip>
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
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(30,42,56,0.6)",
            }}
          >
            <button
              onClick={fetchFeed}
              title="Refresh feed"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                letterSpacing: "0.08em",
                color: "#3d4f63",
                padding: "2px 4px",
                transition: "color 0.12s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#60a5fa")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#3d4f63")}
            >
              ↻ Pull
            </button>
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
