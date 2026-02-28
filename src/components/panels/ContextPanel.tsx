"use client";
import { PanelShell } from "./PanelShell";
import { ISRAEL_IRAN_CONTEXT } from "@/lib/conflict/israelIranContext";

export function ContextPanel() {
  return (
    <PanelShell id="context" title="Why It's Happening" icon="🧭" width={380}>
      <div>
        {ISRAEL_IRAN_CONTEXT.map((section) => (
          <div
            key={section.id}
            style={{
              padding: "12px 14px",
              borderBottom: "1px solid rgba(30,42,56,0.6)",
              borderLeft: `3px solid ${section.color}66`,
            }}
          >
            {/* Period badge + title */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "8px",
                marginBottom: "6px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  color: section.color,
                  letterSpacing: "0.06em",
                  opacity: 0.9,
                  flexShrink: 0,
                }}
              >
                {section.period}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#e2e8f0",
                  lineHeight: 1.3,
                }}
              >
                {section.title}
              </span>
            </div>

            {/* Summary */}
            <p
              style={{
                fontSize: "10px",
                color: "#6b7a8d",
                lineHeight: 1.55,
                margin: "0 0 8px",
              }}
            >
              {section.summary}
            </p>

            {/* Key facts */}
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "3px",
              }}
            >
              {section.keyFacts.map((fact, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: "10px",
                    color: "#94a3b8",
                    lineHeight: 1.45,
                    paddingLeft: "12px",
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

        {/* Footer link */}
        <div style={{ padding: "8px 14px", textAlign: "center" }}>
          <a
            href="/context"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              letterSpacing: "0.1em",
              color: "#60a5fa",
              textDecoration: "none",
              textTransform: "uppercase",
            }}
          >
            Full Historical Context →
          </a>
        </div>
      </div>
    </PanelShell>
  );
}
