import type { Metadata } from "next";
import { ISRAEL_IRAN_CONTEXT } from "@/lib/conflict/israelIranContext";
import { FOCUS_POV } from "@/components/globe/globeData";
import GlobeWrapper from "@/components/globe/GlobeWrapper";

export const metadata: Metadata = {
  title: "Israel–Iran Focus — Warspy",
  description: "Deep-dive on the Israel–Iran conflict theater: live events, proxy network, nuclear program, and historical timeline.",
};

export default function FocusPage() {
  return (
    <div style={{ paddingTop: "48px" }}>
      {/* Globe — pre-centered on Middle East */}
      <div
        style={{
          position: "relative",
          height: "55vh",
          overflow: "hidden",
          borderBottom: "1px solid rgba(224,62,62,0.2)",
        }}
      >
        <GlobeWrapper initialPov={FOCUS_POV} />

        {/* Overlay title */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "2rem",
            transform: "translateY(-50%)",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(224,62,62,0.7)",
              marginBottom: "6px",
            }}
          >
            Conflict Theater
          </div>
          <h1
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(18px, 3vw, 28px)",
              fontWeight: 700,
              color: "#e2e8f0",
              letterSpacing: "0.04em",
              lineHeight: 1.2,
              margin: 0,
              textShadow: "0 2px 20px rgba(0,0,0,0.8)",
            }}
          >
            Israel – Iran
          </h1>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "#6b7a8d",
              marginTop: "4px",
            }}
          >
            Proxy Network · Nuclear Program · Direct Strikes
          </div>
        </div>
      </div>

      {/* Context sections */}
      <div
        style={{
          maxWidth: "64rem",
          margin: "0 auto",
          padding: "3rem 1.5rem 4rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {ISRAEL_IRAN_CONTEXT.map((section) => (
            <div
              key={section.id}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderLeft: `3px solid ${section.color}`,
                borderRadius: "4px",
                padding: "1.25rem",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: section.color,
                  marginBottom: "4px",
                  opacity: 0.85,
                }}
              >
                {section.period}
              </div>
              <h2
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "10px",
                  lineHeight: 1.3,
                }}
              >
                {section.title}
              </h2>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  lineHeight: 1.6,
                  marginBottom: "12px",
                }}
              >
                {section.summary}
              </p>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                {section.keyFacts.map((fact, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                      paddingLeft: "14px",
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        color: section.color,
                        opacity: 0.6,
                      }}
                    >
                      ›
                    </span>
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <a
            href="/context"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#60a5fa",
              textDecoration: "none",
            }}
          >
            Full Historical Context →
          </a>
        </div>
      </div>
    </div>
  );
}
