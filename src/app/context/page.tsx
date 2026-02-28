import type { Metadata } from "next";
import { ISRAEL_IRAN_CONTEXT } from "@/lib/conflict/israelIranContext";
import { CONFLICT_TIMELINE } from "@/lib/conflict/conflictTimeline";

export const metadata: Metadata = {
  title: "Historical Context — Warspy",
  description: "Full historical context of the Israel–Iran conflict from the 1979 Islamic Revolution to the 2024 direct strikes.",
};

// Facts matching these keywords get the redacted "classified" treatment
const CLASSIFIED_KEYWORDS = [
  "assassin", "stuxnet", "attributed", "seized", "mossad", "100,000",
  "april 19", "october 26", "april 1:", "struck", "killed", "destroyed",
];

function isClassified(fact: string): boolean {
  const lower = fact.toLowerCase();
  return CLASSIFIED_KEYWORDS.some((kw) => lower.includes(kw));
}

export default function ContextPage() {
  return (
    <div
      style={{
        maxWidth: "52rem",
        margin: "0 auto",
        padding: "80px 1.5rem 4rem",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "3rem" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--accent-red)",
            marginBottom: "8px",
            opacity: 0.8,
          }}
        >
          Historical Intelligence
        </div>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "var(--text-primary)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.02em",
            marginBottom: "10px",
          }}
        >
          Israel – Iran: Root Causes
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.7 }}>
          The Israel–Iran conflict is not a simple bilateral dispute. It is a proxy war,
          an ideological confrontation, and a nuclear standoff — all running simultaneously.
          This page traces how we got here.
        </p>
      </div>

      {/* Timeline bar */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          padding: "1.25rem",
          marginBottom: "3rem",
          overflowX: "auto",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--text-dim)",
            marginBottom: "1rem",
          }}
        >
          Key Events
        </div>

        <div style={{ position: "relative", minWidth: "600px" }}>
          {/* Horizontal line */}
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: 0,
              right: 0,
              height: "1px",
              background: "var(--border)",
            }}
          />

          <div style={{ display: "flex", gap: "0", overflowX: "auto" }}>
            {CONFLICT_TIMELINE.map((event, i) => (
              <div
                key={event.date}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: "90px",
                  paddingTop: "0",
                }}
                title={event.description}
              >
                {/* Dot */}
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: event.color,
                    boxShadow: `0 0 8px ${event.color}88`,
                    flexShrink: 0,
                    marginBottom: "8px",
                    zIndex: 1,
                    position: "relative",
                  }}
                />
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "8px",
                    color: event.color,
                    letterSpacing: "0.04em",
                    marginBottom: "3px",
                    opacity: 0.9,
                  }}
                >
                  {event.year}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "8px",
                    color: "var(--text-muted)",
                    textAlign: "center",
                    lineHeight: 1.3,
                    maxWidth: "80px",
                  }}
                >
                  {event.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Context sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        {ISRAEL_IRAN_CONTEXT.map((section, i) => (
          <section key={section.id}>
            {/* Section header */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "12px" }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: section.color,
                  opacity: 0.9,
                  flexShrink: 0,
                }}
              >
                {section.period}
              </span>
              <div style={{ flex: 1, height: "1px", background: `${section.color}22` }} />
            </div>

            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "12px",
                borderLeft: `3px solid ${section.color}`,
                paddingLeft: "12px",
              }}
            >
              {section.title}
            </h2>

            <p
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                lineHeight: 1.75,
                marginBottom: "16px",
              }}
            >
              {section.summary}
            </p>

            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "1rem 1.25rem",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  marginBottom: "10px",
                }}
              >
                Key Facts
              </div>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {section.keyFacts.map((fact, j) => (
                  <li
                    key={j}
                    style={{
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                      paddingLeft: "16px",
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        color: section.color,
                        fontWeight: 700,
                      }}
                    >
                      ›
                    </span>
                    {isClassified(fact) ? (
                      <span className="classified" title="Hover to reveal">{fact}</span>
                    ) : (
                      fact
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "3rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid var(--border)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            color: "var(--text-dim)",
            fontFamily: "var(--font-mono)",
            lineHeight: 1.6,
          }}
        >
          Context is based on publicly documented historical events.
          Sources include UN reports, IAEA records, and established news archives.
        </p>
        <div style={{ marginTop: "1rem", display: "flex", gap: "1.5rem", justifyContent: "center" }}>
          <a href="/" style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#60a5fa", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}>← Globe</a>
          <a href="/focus" style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#60a5fa", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}>Focus View</a>
          <a href="/feed" style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#60a5fa", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}>Live Feed</a>
        </div>
      </div>
    </div>
  );
}
