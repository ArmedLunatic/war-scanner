"use client";

import { useState } from "react";
import Link from "next/link";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { CategoryTag } from "./CategoryTag";
import type { ClusterCard } from "@/lib/types";

interface EventCardProps {
  cluster: ClusterCard;
}

function formatRelativeDate(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

const SEVERITY_ACCENT: Record<number, string> = {
  1: "#22c55e",
  2: "#22c55e",
  3: "#d97706",
  4: "#f97316",
  5: "#e03e3e",
};

const SEVERITY_PIP: Record<number, string> = {
  1: "#22c55e",
  2: "#22c55e",
  3: "#d97706",
  4: "#f97316",
  5: "#e03e3e",
};

function SeverityIndicator({ level }: { level: number }) {
  const color = SEVERITY_PIP[level] ?? SEVERITY_PIP[1];
  return (
    <div style={{ display: "flex", gap: "3px", alignItems: "center" }} title={`Severity ${level}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "1px",
            background: i < level ? color : "var(--border-bright)",
            transition: "background 0.1s",
          }}
        />
      ))}
    </div>
  );
}

export function EventCard({ cluster }: EventCardProps) {
  const [expanded, setExpanded] = useState(false);

  const flagEmoji = cluster.country
    ? countryToFlag(cluster.country)
    : "🌐";

  const accent = SEVERITY_ACCENT[cluster.severity] ?? SEVERITY_ACCENT[1];

  return (
    <article
      className={`event-card sev-${cluster.severity}`}
      style={{ borderLeftColor: accent, padding: "1rem 1.25rem" }}
    >
      {/* Location + time row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "14px" }}>{flagEmoji}</span>
          {cluster.country && (
            <span
              style={{
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
              }}
            >
              {cluster.country}
            </span>
          )}
        </div>
        <time
          dateTime={cluster.last_updated_at}
          title={new Date(cluster.last_updated_at).toLocaleString()}
          style={{
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            color: "var(--text-dim)",
            whiteSpace: "nowrap",
          }}
        >
          {formatRelativeDate(cluster.last_updated_at)}
        </time>
      </div>

      {/* Headline */}
      <Link href={`/event/${cluster.id}`}>
        <h2
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "var(--text-primary)",
            lineHeight: 1.4,
            marginBottom: "10px",
            transition: "color 0.12s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLHeadingElement).style.color = "var(--accent-blue)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLHeadingElement).style.color = "var(--text-primary)"; }}
        >
          {cluster.headline}
        </h2>
      </Link>

      {/* Tags + severity row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", marginBottom: "12px" }}>
        <CategoryTag category={cluster.category} />
        <ConfidenceBadge confidence={cluster.confidence} />
        <SeverityIndicator level={cluster.severity} />
        {cluster.actors.length > 0 && (
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-dim)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {cluster.actors.slice(0, 3).join(" · ")}
          </span>
        )}
      </div>

      {/* Know bullets */}
      {cluster.summary_know.length > 0 && (
        <ul style={{ marginBottom: "12px", display: "flex", flexDirection: "column", gap: "5px" }}>
          {(expanded ? cluster.summary_know : cluster.summary_know.slice(0, 2)).map(
            (bullet, i) => (
              <li key={i} style={{ display: "flex", gap: "8px", fontSize: "13px", color: "var(--text-secondary)" }}>
                <span style={{ color: "var(--accent-green)", flexShrink: 0, marginTop: "1px", fontSize: "11px" }}>✓</span>
                <span>{bullet}</span>
              </li>
            ),
          )}
          {cluster.summary_know.length > 2 && (
            <li>
              <button
                onClick={() => setExpanded(!expanded)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--accent-blue)",
                  padding: "0",
                  marginLeft: "16px",
                }}
              >
                {expanded ? "show less" : `+${cluster.summary_know.length - 2} more`}
              </button>
            </li>
          )}
        </ul>
      )}

      {/* Unclear bullets (expanded) */}
      {expanded && cluster.summary_unclear.length > 0 && (
        <div
          style={{
            marginBottom: "12px",
            background: "rgba(217,119,6,0.06)",
            border: "1px solid rgba(217,119,6,0.2)",
            borderRadius: "var(--radius)",
            padding: "10px 12px",
          }}
        >
          <p style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent-amber)", marginBottom: "6px" }}>
            Still unclear
          </p>
          <ul style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {cluster.summary_unclear.map((bullet, i) => (
              <li key={i} style={{ fontSize: "12px", color: "#d97706" }}>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "10px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <Link
          href={`/event/${cluster.id}`}
          style={{
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            transition: "color 0.12s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent-blue)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"; }}
        >
          {cluster.sources_count} source{cluster.sources_count !== 1 ? "s" : ""} · View details →
        </Link>
        <span
          style={{
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            color: "var(--text-dim)",
          }}
        >
          score {Math.round(cluster.score)}
        </span>
      </div>
    </article>
  );
}

/** Convert country name to flag emoji using regional indicator letters */
function countryToFlag(country: string): string {
  // Map common country names to ISO-2 codes
  const MAP: Record<string, string> = {
    Ukraine: "UA", Russia: "RU", Israel: "IL", Iran: "IR",
    Palestine: "PS", Gaza: "PS", Sudan: "SD", Yemen: "YE",
    Syria: "SY", Iraq: "IQ", Afghanistan: "AF", Pakistan: "PK",
    India: "IN", Libya: "LY", Ethiopia: "ET", Somalia: "SO",
    Mali: "ML", France: "FR", Germany: "DE", "United Kingdom": "GB",
    "United States": "US", China: "CN", Turkey: "TR",
    "Saudi Arabia": "SA", Qatar: "QA",
  };
  const iso = MAP[country];
  if (!iso) return "🌐";
  return iso
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e0 + c.charCodeAt(0) - 65))
    .join("");
}
