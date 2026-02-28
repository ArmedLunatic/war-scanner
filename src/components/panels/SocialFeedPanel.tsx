"use client";
import { useEffect, useState, useCallback } from "react";
import { PanelShell } from "./PanelShell";
import type { SocialPost, SocialResponse } from "@/lib/types";

const REFRESH_MS = 15 * 60 * 1000;

const TYPE_COLORS: Record<string, string> = {
  rss: "#60a5fa",
  reddit: "#f97316",
  news: "#22d3ee",
  twitter: "#94a3b8",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function SocialFeedPanel() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSocial = useCallback(async () => {
    try {
      const res = await fetch("/api/social", { cache: "no-store" });
      if (!res.ok) return;
      const data: SocialResponse = await res.json();
      setPosts(data.posts);
      setSources(data.sources);
    } catch {
      // noop
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
