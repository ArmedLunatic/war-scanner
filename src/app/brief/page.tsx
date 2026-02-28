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
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Top 10 — Last 12 Hours
        </h1>
        <p className="text-sm text-gray-600">
          The highest-scoring conflict events from the past 12 hours, ranked by
          severity, source corroboration, and recency.
        </p>
        {brief && (
          <p className="text-xs text-gray-400 mt-1">
            Generated: {new Date(brief.generatedAt).toLocaleString()}
          </p>
        )}
      </div>

      {!brief || brief.clusters.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg font-medium mb-2">No events in the last 12 hours</p>
          <Link href="/" className="text-blue-600 underline text-sm">
            View all events →
          </Link>
        </div>
      ) : (
        <ol className="space-y-4">
          {brief.clusters.map((cluster, i) => (
            <li key={cluster.id} className="flex gap-4">
              <span className="text-2xl font-bold text-gray-300 w-8 shrink-0 text-right">
                {i + 1}
              </span>
              <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  <CategoryTag category={cluster.category} />
                  <ConfidenceBadge confidence={cluster.confidence} />
                  {cluster.country && (
                    <span className="text-xs text-gray-500 self-center">
                      {cluster.country}
                    </span>
                  )}
                </div>
                <Link
                  href={`/event/${cluster.id}`}
                  className="block font-semibold text-gray-900 hover:text-blue-700 text-sm leading-snug mb-2"
                >
                  {cluster.headline}
                </Link>
                {cluster.summary_know[0] && (
                  <p className="text-xs text-gray-600">{cluster.summary_know[0]}</p>
                )}
                <div className="mt-2 text-xs text-gray-400">
                  {cluster.sources_count} source{cluster.sources_count !== 1 ? "s" : ""} ·{" "}
                  Score: {Math.round(cluster.score)}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
