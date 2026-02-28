import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodology — War Scanner",
  description: "How War Scanner aggregates, clusters, scores, and presents conflict events.",
};

export default function MethodologyPage() {
  return (
    <div className="max-w-2xl mx-auto prose prose-sm">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Methodology</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Data Sources</h2>
        <p className="text-gray-700 text-sm mb-3">
          War Scanner ingests from two free, public APIs:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>
            <strong>GDELT 2.1 DOC API</strong> — A global media monitoring system that indexes
            news articles from thousands of outlets worldwide. We query for conflict-related
            keywords and collect article titles and URLs. No full article text is fetched.
          </li>
          <li>
            <strong>ReliefWeb</strong> — UN OCHA&apos;s humanitarian information platform.
            Reports tagged with Security, Conflict and Violence, or Peacekeeping themes.
            Snippet = first 500 characters of body text only.
          </li>
        </ul>
        <p className="text-xs text-gray-500 mt-2">
          We store only titles, URLs, metadata, and brief snippets. No full article
          content is reproduced. All outbound links open the original publisher.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Deduplication & Clustering</h2>
        <p className="text-sm text-gray-700 mb-3">
          Multiple sources often report the same event. We cluster overlapping reports
          deterministically using a weighted similarity score:
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded p-3 font-mono text-xs mb-3">
          sim = 0.35 × textSim(title, clusterHeadline)<br />
          &nbsp;&nbsp;&nbsp;&nbsp;+ 0.25 × jaccardSim(keywords, clusterKeywords)<br />
          &nbsp;&nbsp;&nbsp;&nbsp;+ 0.25 × timeProximity(reportedAt, clusterUpdated)<br />
          &nbsp;&nbsp;&nbsp;&nbsp;+ 0.15 × geoProximity(distanceKm)
        </div>
        <p className="text-sm text-gray-700">
          If similarity ≥ 0.70, the report is attached to the existing cluster.
          Otherwise a new cluster is created. No machine learning is used.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Scoring Formula</h2>
        <p className="text-sm text-gray-700 mb-3">
          Each cluster is assigned a score (0–100):
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded p-3 font-mono text-xs mb-3">
          score = 0.45 × severity + 0.35 × credibility + 0.20 × recency
        </div>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
          <li>
            <strong>Severity (0–100):</strong> Based on keywords in titles/snippets.
            High-severity terms (mass casualty, nuclear, etc.) +20. Medium terms
            (killed, attack, etc.) +10. Casualty count patterns +10 each up to +20.
          </li>
          <li>
            <strong>Credibility (0–100):</strong> Number of distinct source domains (+10 each,
            max 40), bonus for known high-quality sources (Reuters, BBC, AP, etc.),
            +10 for ReliefWeb presence.
          </li>
          <li>
            <strong>Recency (0–100):</strong> Exponential decay: 100 × e^(−ageHours/10).
            An event 10 hours old scores ~37 on recency.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Confidence Labels</h2>
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 mt-0.5">
              High Confidence
            </span>
            <p className="text-sm text-gray-700">
              ≥3 distinct source domains, or ReliefWeb (UN-verified) is among the sources.
              Does <strong>not</strong> mean the event is verified — it means multiple
              independent outlets have reported it.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200 shrink-0 mt-0.5">
              Med Confidence
            </span>
            <p className="text-sm text-gray-700">
              2 distinct source domains. Corroborated but limited.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200 shrink-0 mt-0.5">
              Low Confidence
            </span>
            <p className="text-sm text-gray-700">
              Single source. Treat with caution; may be preliminary or unverified.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Summaries</h2>
        <p className="text-sm text-gray-700">
          All summaries are extractive only — sentences are drawn directly from
          article titles and the first 500 characters of ReliefWeb body text.
          No language model or paraphrasing is applied. &quot;According to [source]&quot;
          prefixes identify which outlet provided each sentence.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Limitations</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
          <li>Coverage is limited to outlets indexed by GDELT and to ReliefWeb reports. Local-language media may be underrepresented.</li>
          <li>Clustering is heuristic. Distinct events in the same country and timeframe may be incorrectly merged, or the same event may appear as multiple clusters.</li>
          <li>Severity scoring uses keyword matching and cannot assess context (e.g., historical vs. active operations).</li>
          <li>No editorial review. All data is automated. Do not use for life-safety decisions.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Legal Note</h2>
        <p className="text-sm text-gray-700">
          War Scanner is an aggregator. We store only titles, URLs, and brief metadata.
          No full article content is cached or reproduced. All article links open
          the original publisher. GDELT data is published under an open license.
          ReliefWeb content is provided under Creative Commons.
        </p>
      </section>
    </div>
  );
}
