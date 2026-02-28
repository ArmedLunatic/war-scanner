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
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Back to feed
        </Link>
      </div>

      <article>
        {/* Tags row */}
        <div className="flex flex-wrap gap-2 mb-3">
          <CategoryTag category={cluster.category} />
          <ConfidenceBadge confidence={cluster.confidence} />
          <span className="text-xs text-gray-500 self-center">
            Score: {Math.round(cluster.score)}
          </span>
        </div>

        {/* Country + headline */}
        {cluster.country && (
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {cluster.country}
          </p>
        )}
        <h1 className="text-xl font-bold text-gray-900 mb-4 leading-snug">
          {cluster.headline}
        </h1>

        {/* Timeline */}
        <div className="text-xs text-gray-500 mb-6 flex gap-4 flex-wrap">
          <span>First seen: {new Date(cluster.first_seen_at).toLocaleString()}</span>
          <span>Last updated: {new Date(cluster.last_updated_at).toLocaleString()}</span>
        </div>

        {/* Bullets */}
        {cluster.summary_know.length > 0 && (
          <section className="mb-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              What we know
            </h2>
            <ul className="space-y-2">
              {cluster.summary_know.map((bullet, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-800">
                  <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {cluster.summary_unclear.length > 0 && (
          <section className="mb-5 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-amber-800 mb-2 uppercase tracking-wide">
              Still unclear
            </h2>
            <ul className="space-y-1">
              {cluster.summary_unclear.map((bullet, i) => (
                <li key={i} className="text-sm text-amber-900">
                  {bullet}
                </li>
              ))}
            </ul>
          </section>
        )}

        {cluster.summary_why && (
          <section className="mb-5 bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-blue-800 mb-1 uppercase tracking-wide">
              Context
            </h2>
            <p className="text-sm text-blue-900">{cluster.summary_why}</p>
          </section>
        )}

        {/* Sources */}
        <section className="mt-6 pt-4 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Sources ({cluster.sources.length})
          </h2>
          <SourcesList sources={cluster.sources} max={20} />
        </section>

        {/* Keywords / actors */}
        {cluster.keywords.length > 0 && (
          <section className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-1.5">
              {cluster.keywords.slice(0, 15).map((kw) => (
                <span
                  key={kw}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
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
