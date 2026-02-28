import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodology — Warspy",
  description: "How Warspy aggregates, clusters, scores, and presents conflict events.",
};

const S = {
  page: {
    maxWidth: "42rem",
    margin: "0 auto",
    padding: "80px 1.5rem 4rem",
  } as React.CSSProperties,
  h1: {
    fontSize: "24px",
    fontWeight: 700,
    color: "var(--text-primary)",
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.02em",
    marginBottom: "2rem",
    textTransform: "uppercase",
  } as React.CSSProperties,
  section: {
    marginBottom: "2.5rem",
  } as React.CSSProperties,
  h2: {
    fontSize: "13px",
    fontWeight: 700,
    color: "var(--text-primary)",
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "10px",
    borderLeft: "3px solid var(--accent-blue)",
    paddingLeft: "10px",
  } as React.CSSProperties,
  p: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    lineHeight: 1.7,
    marginBottom: "10px",
  } as React.CSSProperties,
  ul: {
    margin: "0 0 10px",
    padding: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  } as React.CSSProperties,
  li: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    lineHeight: 1.6,
    paddingLeft: "14px",
    position: "relative",
  } as React.CSSProperties,
  bullet: {
    position: "absolute",
    left: 0,
    color: "var(--accent-blue)",
    opacity: 0.6,
  } as React.CSSProperties,
  codeBlock: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "4px",
    padding: "12px 14px",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "var(--text-secondary)",
    marginBottom: "10px",
    lineHeight: 1.6,
    overflowX: "auto",
  } as React.CSSProperties,
  note: {
    fontSize: "11px",
    color: "var(--text-muted)",
    lineHeight: 1.6,
    fontStyle: "italic",
    marginTop: "4px",
  } as React.CSSProperties,
};

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "3px",
        fontSize: "10px",
        fontFamily: "var(--font-mono)",
        fontWeight: 700,
        letterSpacing: "0.06em",
        background: `${color}18`,
        color,
        border: `1px solid ${color}44`,
        flexShrink: 0,
        marginTop: "2px",
      }}
    >
      {children}
    </span>
  );
}

export default function MethodologyPage() {
  return (
    <div style={S.page}>
      <h1 style={S.h1}>Methodology</h1>

      <section style={S.section}>
        <h2 style={S.h2}>Data Sources</h2>
        <p style={S.p}>Warspy ingests from two free, public APIs:</p>
        <ul style={S.ul}>
          <li style={S.li}>
            <span style={S.bullet}>›</span>
            <strong style={{ color: "var(--text-primary)" }}>GDELT 2.1 DOC API</strong> — A global
            media monitoring system that indexes news articles from thousands of outlets worldwide.
            We query for conflict-related keywords and collect article titles and URLs. No full
            article text is fetched.
          </li>
          <li style={S.li}>
            <span style={S.bullet}>›</span>
            <strong style={{ color: "var(--text-primary)" }}>ReliefWeb</strong> — UN OCHA&apos;s
            humanitarian information platform. Reports tagged with Security, Conflict and Violence,
            or Peacekeeping themes. Snippet = first 500 characters of body text only.
          </li>
        </ul>
        <p style={S.note}>
          We store only titles, URLs, metadata, and brief snippets. No full article content is
          reproduced. All outbound links open the original publisher.
        </p>
      </section>

      <section style={S.section}>
        <h2 style={S.h2}>Deduplication &amp; Clustering</h2>
        <p style={S.p}>
          Multiple sources often report the same event. We cluster overlapping reports
          deterministically using a weighted similarity score:
        </p>
        <div style={S.codeBlock}>
          sim = 0.35 × textSim(title, clusterHeadline)<br />
          &nbsp;&nbsp;&nbsp;&nbsp;+ 0.25 × jaccardSim(keywords, clusterKeywords)<br />
          &nbsp;&nbsp;&nbsp;&nbsp;+ 0.25 × timeProximity(reportedAt, clusterUpdated)<br />
          &nbsp;&nbsp;&nbsp;&nbsp;+ 0.15 × geoProximity(distanceKm)
        </div>
        <p style={S.p}>
          If similarity ≥ 0.70, the report is attached to the existing cluster. Otherwise a new
          cluster is created. No machine learning is used.
        </p>
      </section>

      <section style={S.section}>
        <h2 style={S.h2}>Scoring Formula</h2>
        <p style={S.p}>Each cluster is assigned a score (0–100):</p>
        <div style={S.codeBlock}>
          score = 0.45 × severity + 0.35 × credibility + 0.20 × recency
        </div>
        <ul style={S.ul}>
          <li style={S.li}>
            <span style={S.bullet}>›</span>
            <strong style={{ color: "var(--text-primary)" }}>Severity (0–100):</strong> Based on
            keywords in titles/snippets. High-severity terms (mass casualty, nuclear, etc.) +20.
            Medium terms (killed, attack, etc.) +10. Casualty count patterns +10 each up to +20.
          </li>
          <li style={S.li}>
            <span style={S.bullet}>›</span>
            <strong style={{ color: "var(--text-primary)" }}>Credibility (0–100):</strong> Number
            of distinct source domains (+10 each, max 40), bonus for known high-quality sources
            (Reuters, BBC, AP, etc.), +10 for ReliefWeb presence.
          </li>
          <li style={S.li}>
            <span style={S.bullet}>›</span>
            <strong style={{ color: "var(--text-primary)" }}>Recency (0–100):</strong> Exponential
            decay: 100 × e^(−ageHours/10). An event 10 hours old scores ~37 on recency.
          </li>
        </ul>
      </section>

      <section style={S.section}>
        <h2 style={S.h2}>Confidence Labels</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <Badge color="var(--accent-green)">High</Badge>
            <p style={{ ...S.p, margin: 0 }}>
              ≥3 distinct source domains, or ReliefWeb (UN-verified) is among the sources. Does{" "}
              <strong>not</strong> mean the event is verified — it means multiple independent
              outlets have reported it.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <Badge color="var(--accent-amber)">Med</Badge>
            <p style={{ ...S.p, margin: 0 }}>
              2 distinct source domains. Corroborated but limited.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <Badge color="var(--accent-red)">Low</Badge>
            <p style={{ ...S.p, margin: 0 }}>
              Single source. Treat with caution; may be preliminary or unverified.
            </p>
          </div>
        </div>
      </section>

      <section style={S.section}>
        <h2 style={S.h2}>Summaries</h2>
        <p style={S.p}>
          All summaries are extractive only — sentences are drawn directly from article titles and
          the first 500 characters of ReliefWeb body text. No language model or paraphrasing is
          applied. &quot;According to [source]&quot; prefixes identify which outlet provided each
          sentence.
        </p>
      </section>

      <section style={S.section}>
        <h2 style={S.h2}>Limitations</h2>
        <ul style={S.ul}>
          <li style={S.li}>
            <span style={S.bullet}>›</span>
            Coverage is limited to outlets indexed by GDELT and to ReliefWeb reports. Local-language
            media may be underrepresented.
          </li>
          <li style={S.li}>
            <span style={S.bullet}>›</span>
            Clustering is heuristic. Distinct events in the same country and timeframe may be
            incorrectly merged, or the same event may appear as multiple clusters.
          </li>
          <li style={S.li}>
            <span style={S.bullet}>›</span>
            Severity scoring uses keyword matching and cannot assess context (e.g., historical vs.
            active operations).
          </li>
          <li style={S.li}>
            <span style={S.bullet}>›</span>
            No editorial review. All data is automated. Do not use for life-safety decisions.
          </li>
        </ul>
      </section>

      <section style={S.section}>
        <h2 style={S.h2}>Legal Note</h2>
        <p style={S.p}>
          Warspy is an aggregator. We store only titles, URLs, and brief metadata. No full article
          content is cached or reproduced. All article links open the original publisher. GDELT data
          is published under an open license. ReliefWeb content is provided under Creative Commons.
        </p>
      </section>
    </div>
  );
}
