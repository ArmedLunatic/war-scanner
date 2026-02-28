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

const SEVERITY_BARS: Record<number, { fill: number; color: string }> = {
  1: { fill: 1, color: "bg-green-400" },
  2: { fill: 2, color: "bg-yellow-400" },
  3: { fill: 3, color: "bg-orange-400" },
  4: { fill: 4, color: "bg-red-400" },
  5: { fill: 5, color: "bg-red-600" },
};

function SeverityIndicator({ level }: { level: number }) {
  const { fill, color } = SEVERITY_BARS[level] ?? SEVERITY_BARS[1];
  return (
    <div className="flex gap-0.5 items-center" title={`Severity ${level}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-sm ${i < fill ? color : "bg-gray-200"}`}
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

  return (
    <article className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap gap-2 items-center">
          <CategoryTag category={cluster.category} />
          <ConfidenceBadge confidence={cluster.confidence} />
          <SeverityIndicator level={cluster.severity} />
        </div>
        <time
          dateTime={cluster.last_updated_at}
          className="text-xs text-gray-400 whitespace-nowrap shrink-0"
          title={new Date(cluster.last_updated_at).toLocaleString()}
        >
          {formatRelativeDate(cluster.last_updated_at)}
        </time>
      </div>

      {/* Country + headline */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-base">{flagEmoji}</span>
          {cluster.country && (
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {cluster.country}
            </span>
          )}
        </div>
        <Link href={`/event/${cluster.id}`} className="group">
          <h2 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 leading-snug">
            {cluster.headline}
          </h2>
        </Link>
      </div>

      {/* Know bullets */}
      {cluster.summary_know.length > 0 && (
        <ul className="mb-3 space-y-1">
          {(expanded ? cluster.summary_know : cluster.summary_know.slice(0, 2)).map(
            (bullet, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="text-gray-400 shrink-0 mt-0.5">•</span>
                <span>{bullet}</span>
              </li>
            ),
          )}
          {cluster.summary_know.length > 2 && (
            <li>
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-blue-600 hover:underline ml-4"
              >
                {expanded ? "Show less" : `+${cluster.summary_know.length - 2} more`}
              </button>
            </li>
          )}
        </ul>
      )}

      {/* Unclear bullets (collapsed by default) */}
      {expanded && cluster.summary_unclear.length > 0 && (
        <div className="mb-3 bg-amber-50 border border-amber-100 rounded p-3">
          <p className="text-xs font-medium text-amber-700 mb-1">Still unclear:</p>
          <ul className="space-y-1">
            {cluster.summary_unclear.map((bullet, i) => (
              <li key={i} className="text-xs text-amber-800">
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <Link
          href={`/event/${cluster.id}`}
          className="text-xs text-gray-500 hover:text-blue-600"
        >
          {cluster.sources_count} source{cluster.sources_count !== 1 ? "s" : ""} →
        </Link>
        <span className="text-xs text-gray-400">
          Score: {Math.round(cluster.score)}
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
