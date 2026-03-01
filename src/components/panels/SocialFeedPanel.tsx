"use client";
import { useEffect, useState, useCallback } from "react";
import { PanelShell } from "./PanelShell";
import { PanelSkeleton } from "./PanelSkeleton";
import type { SocialPost, SocialResponse } from "@/lib/types";
import { timeAgo } from "@/lib/utils/timeAgo";

const REFRESH_MS = 15 * 60 * 1000;

const TYPE_COLORS: Record<string, string> = {
  rss: "#60a5fa",
  reddit: "#f97316",
  news: "#22d3ee",
  twitter: "#94a3b8",
};

export function SocialFeedPanel() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchSocial = useCallback(async () => {
    try {
      const res = await fetch("/api/social", {
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        setError(true);
        return;
      }
      const data: SocialResponse = await res.json();
      setPosts(data.posts);
      setSources(data.sources);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSocial();
    const id = setInterval(fetchSocial, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchSocial]);

  return (
    <PanelShell id="social" title="Social Feed" icon="💬">
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
            onClick={() => { setLoading(true); fetchSocial(); }}
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
          {/* Source tags */}
          {sources.length > 0 && (
            <div
              style={{
                padding: "6px 14px",
                display: "flex",
                gap: "6px",
                flexWrap: "wrap",
                borderBottom: "1px solid rgba(30,42,56,0.6)",
              }}
            >
              {sources.map((s) => (
                <span
                  key={s}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px",
                    letterSpacing: "0.06em",
                    color: "#6b7a8d",
                    background: "rgba(30,42,56,0.6)",
                    borderRadius: "2px",
                    padding: "1px 5px",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {posts.length === 0 ? (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                fontSize: "11px",
                color: "#6b7a8d",
              }}
            >
              No posts available
            </div>
          ) : (
            posts.map((p) => (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", textDecoration: "none" }}
              >
                <div
                  style={{
                    padding: "9px 14px",
                    borderBottom: "1px solid rgba(30,42,56,0.5)",
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
                  {/* Source tag */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "9px",
                        color: TYPE_COLORS[p.type] ?? "#60a5fa",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        fontWeight: 700,
                      }}
                    >
                      {p.sourceTag}
                    </span>
                    {p.score !== undefined && (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "9px",
                          color: "#3d4f63",
                        }}
                      >
                        ▲ {p.score.toLocaleString()}
                      </span>
                    )}
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "9px",
                        color: "#3d4f63",
                        marginLeft: "auto",
                      }}
                    >
                      {timeAgo(p.publishedAt)}
                    </span>
                  </div>

                  {/* Text */}
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      lineHeight: 1.4,
                    }}
                  >
                    {p.text.length > 120 ? p.text.slice(0, 117) + "..." : p.text}
                  </div>
                </div>
              </a>
            ))
          )}
        </div>
      )}
    </PanelShell>
  );
}
