"use client";
import { useEffect, useState, useCallback } from "react";
import { PanelShell } from "./PanelShell";
import { PanelSkeleton } from "./PanelSkeleton";
import type { ClusterCard } from "@/lib/types";

interface BriefItem {
  rank: number;
  headline: string;
  score: number;
  country: string | null;
  severity: number;
  confidence: string;
  id: string;
}

interface BriefResponse {
  clusters: ClusterCard[];
  generatedAt: string;
}

function severityColor(s: number) {
  if (s >= 5) return "#e03e3e";
  if (s >= 4) return "#f97316";
  if (s >= 3) return "#d97706";
  return "#22c55e";
}

export function BriefPanel() {
  const [items, setItems] = useState<BriefItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchBrief = useCallback(async () => {
    try {
      const res = await fetch("/api/brief", {
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        setError(true);
        return;
      }
      const data: BriefResponse = await res.json();
      const mapped = (data.clusters ?? []).slice(0, 10).map((c, i) => ({
        rank: i + 1,
        headline: c.headline,
        score: c.score,
        country: c.country,
        severity: c.severity,
        confidence: c.confidence,
        id: c.id,
      }));
      setItems(mapped);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrief();
  }, [fetchBrief]);

  return (
    <PanelShell id="brief" title="Intelligence Brief" icon="📋">
      {loading ? (
        <PanelSkeleton />
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
            onClick={() => { setLoading(true); fetchBrief(); }}
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
      ) : (
        <div>
          {items.map((item) => (
            <a
              key={item.id}
              href={`/event/${item.id}`}
              style={{ display: "block", textDecoration: "none" }}
            >
              <div
                style={{
                  padding: "9px 14px",
                  borderBottom: "1px solid rgba(30,42,56,0.5)",
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
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
                {/* Rank */}
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#1e2a38",
                    minWidth: "20px",
                    textAlign: "right",
                    lineHeight: 1.3,
                  }}
                >
                  {item.rank.toString().padStart(2, "0")}
                </span>

                <div style={{ flex: 1 }}>
                  {/* Headline */}
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#e2e8f0",
                      lineHeight: 1.4,
                      marginBottom: "4px",
                      fontWeight: 500,
                    }}
                  >
                    {item.headline}
                  </div>

                  {/* Meta */}
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    {item.country && (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "9px",
                          color: "#60a5fa",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        {item.country}
                      </span>
                    )}
                    <div
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: severityColor(item.severity),
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "9px",
                        color: "#3d4f63",
                        marginLeft: "auto",
                      }}
                    >
                      {Math.round(item.score)}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ))}

          {items.length === 0 && (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                fontSize: "11px",
                color: "#6b7a8d",
              }}
            >
              No data — run ingest first
            </div>
          )}

          <div style={{ padding: "8px 14px", textAlign: "center" }}>
            <a
              href="/brief"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                letterSpacing: "0.1em",
                color: "#60a5fa",
                textDecoration: "none",
                textTransform: "uppercase",
              }}
            >
              Full Brief →
            </a>
          </div>
        </div>
      )}
    </PanelShell>
  );
}
