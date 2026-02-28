import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nuclear Status — Warspy",
  description: "Iran uranium enrichment status, breakout timeline, and IAEA monitoring data.",
};

const ENRICHMENT_LEVEL = 60; // % U-235 (as of 2023 IAEA reports)

const THRESHOLDS = [
  { pct: 0,    label: "Natural",       color: "#22c55e",  desc: "0.7% — natural uranium ore" },
  { pct: 5,    label: "LEU / JCPOA",  color: "#86efac",  desc: "3.67% cap under 2015 deal" },
  { pct: 20,   label: "20%",          color: "#fbbf24",  desc: "IAEA alarm threshold; Feb 2021" },
  { pct: 60,   label: "60% ▼ NOW",    color: "#f97316",  desc: "Current level — April 2021 onward" },
  { pct: 90,   label: "Weapons Grade",color: "#e03e3e",  desc: "HEU — nuclear weapon threshold" },
];

const MILESTONES = [
  { year: "1979", event: "Islamic Revolution — nuclear cooperation with US ended", type: "neutral" },
  { year: "2002", event: "Natanz centrifuge plant revealed by MEK dissident group", type: "warning" },
  { year: "2006", event: "First uranium enrichment at Natanz — 3.5%", type: "warning" },
  { year: "2010", event: "Stuxnet worm destroys ~1,000 centrifuges (US/Israel)", type: "action" },
  { year: "2015", event: "JCPOA signed — enrichment capped at 3.67%, monitors granted", type: "good" },
  { year: "2018", event: "US withdraws from JCPOA; Iran begins exceeding limits", type: "danger" },
  { year: "2021", event: "Iran begins enriching to 20%, then 60% after Natanz attack", type: "danger" },
  { year: "2023", event: "IAEA: Iran has enough 60% material for several bombs if further enriched", type: "danger" },
  { year: "2024", event: "IAEA access severely curtailed; additional centrifuge cascades activated", type: "danger" },
];

const STATS = [
  { label: "Current Enrichment", value: "~60%", sub: "U-235 purity", color: "#f97316" },
  { label: "Weapons Grade", value: "90%", sub: "threshold", color: "#e03e3e" },
  { label: "Breakout Time", value: "~1–2 wks", sub: "est. to enrich to 90%", color: "#fbbf24" },
  { label: "Active Centrifuges", value: "~9,000+", sub: "IR-1, IR-2M, IR-6", color: "#60a5fa" },
  { label: "60% Stockpile", value: "~121 kg", sub: "as of Nov 2023 IAEA", color: "#a78bfa" },
  { label: "Monitoring", value: "CURTAILED", sub: "IAEA cameras removed", color: "#e03e3e" },
];

type MilestoneType = "neutral" | "warning" | "action" | "good" | "danger";

const milestoneColor: Record<MilestoneType, string> = {
  neutral: "#6b7a8d",
  warning: "#fbbf24",
  action: "#60a5fa",
  good: "#22c55e",
  danger: "#e03e3e",
};

export default function NuclearPage() {
  // Compute gradient stops for the bar
  const barGradient =
    "linear-gradient(to right, #22c55e 0%, #86efac 8%, #fbbf24 22%, #f97316 66%, #dc2626 100%)";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        paddingTop: "64px",
        paddingBottom: "4rem",
      }}
    >
      {/* Page header */}
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "2.5rem 1.5rem 0",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.1em",
            color: "var(--text-muted)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            marginBottom: "2rem",
          }}
        >
          ← Globe
        </Link>

        {/* Title block */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#e03e3e",
                boxShadow: "0 0 12px #e03e3e",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.2em",
                color: "#e03e3e",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Active Monitoring
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 700,
              color: "#e2e8f0",
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
              marginBottom: "8px",
            }}
          >
            Iran Nuclear Status
          </h1>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--text-muted)",
              letterSpacing: "0.04em",
            }}
          >
            Uranium enrichment tracking · IAEA reporting · Estimated breakout timeline
          </p>
        </div>

        {/* ── ENRICHMENT BAR ── */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderTop: "2px solid #e03e3e",
            borderRadius: "var(--radius)",
            padding: "2rem 1.5rem",
            marginBottom: "1.5rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background glow */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: `${ENRICHMENT_LEVEL}%`,
              width: "200px",
              height: "200px",
              background: "radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              letterSpacing: "0.16em",
              color: "var(--text-muted)",
              marginBottom: "1.5rem",
              textTransform: "uppercase",
            }}
          >
            Uranium-235 Enrichment Level
          </div>

          {/* Threshold labels */}
          <div
            style={{
              position: "relative",
              height: "20px",
              marginBottom: "6px",
            }}
          >
            {THRESHOLDS.map((t) => (
              <div
                key={t.pct}
                style={{
                  position: "absolute",
                  left: `${t.pct}%`,
                  transform: "translateX(-50%)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "7px",
                  color: t.color,
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
                  fontWeight: t.pct === 60 ? 700 : 400,
                  textShadow: t.pct === 60 ? `0 0 8px ${t.color}` : "none",
                }}
              >
                {t.label}
              </div>
            ))}
          </div>

          {/* The bar */}
          <div
            style={{
              position: "relative",
              height: "12px",
              background: "rgba(10,14,20,0.8)",
              border: "1px solid rgba(30,42,56,0.8)",
              borderRadius: "2px",
              overflow: "hidden",
              marginBottom: "8px",
            }}
          >
            {/* Filled portion */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: `${ENRICHMENT_LEVEL}%`,
                height: "100%",
                background: barGradient,
                borderRadius: "2px 0 0 2px",
              }}
            />

            {/* Pulsing front edge */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: `${ENRICHMENT_LEVEL}%`,
                width: "2px",
                height: "100%",
                background: "#f97316",
                boxShadow: "0 0 8px #f97316, 0 0 16px #f9731688",
              }}
            />

            {/* Threshold tick marks */}
            {THRESHOLDS.slice(1).map((t) => (
              <div
                key={t.pct}
                style={{
                  position: "absolute",
                  top: 0,
                  left: `${t.pct}%`,
                  width: "1px",
                  height: "100%",
                  background: "rgba(0,0,0,0.5)",
                }}
              />
            ))}
          </div>

          {/* Percentage scale */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((n) => (
              <span
                key={n}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "7px",
                  color: n === ENRICHMENT_LEVEL ? "#f97316" : "#1e2a38",
                  fontWeight: n === ENRICHMENT_LEVEL ? 700 : 400,
                }}
              >
                {n}%
              </span>
            ))}
          </div>

          {/* Current level callout */}
          <div
            style={{
              marginTop: "1.25rem",
              padding: "12px 16px",
              background: "rgba(249,115,22,0.08)",
              border: "1px solid rgba(249,115,22,0.2)",
              borderLeft: "3px solid #f97316",
              borderRadius: "3px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "32px",
                fontWeight: 700,
                color: "#f97316",
                lineHeight: 1,
                textShadow: "0 0 24px rgba(249,115,22,0.5)",
              }}
            >
              60%
            </span>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#e2e8f0",
                  letterSpacing: "0.04em",
                }}
              >
                Current Enrichment Level
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  color: "var(--text-muted)",
                  marginTop: "3px",
                }}
              >
                30 percentage points from weapons grade · Est. 1–2 weeks to breakout
              </div>
            </div>
            <div
              style={{
                marginLeft: "auto",
                padding: "6px 12px",
                background: "rgba(224,62,62,0.1)",
                border: "1px solid rgba(224,62,62,0.25)",
                borderRadius: "3px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "8px",
                  color: "#e03e3e",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                30% to weapons grade
              </div>
            </div>
          </div>
        </div>

        {/* ── STATS GRID ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "8px",
            marginBottom: "1.5rem",
          }}
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "14px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "8px",
                  letterSpacing: "0.12em",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: s.color,
                  lineHeight: 1,
                  marginBottom: "3px",
                  textShadow: `0 0 16px ${s.color}44`,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "8px",
                  color: "#3d4f63",
                  letterSpacing: "0.04em",
                }}
              >
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* ── MILESTONE TIMELINE ── */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "1.5rem",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: "1.25rem",
            }}
          >
            Nuclear Program Timeline
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {MILESTONES.map((m, i) => {
              const color = milestoneColor[m.type as MilestoneType];
              return (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1px 1fr",
                    gap: "0 14px",
                    alignItems: "stretch",
                  }}
                >
                  {/* Year */}
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      fontWeight: 700,
                      color,
                      textAlign: "right",
                      paddingTop: "12px",
                      paddingBottom: "12px",
                      lineHeight: 1,
                    }}
                  >
                    {m.year}
                  </div>

                  {/* Timeline spine */}
                  <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div
                      style={{
                        width: "1px",
                        flex: 1,
                        background: i === 0 ? "transparent" : "rgba(30,42,56,0.8)",
                        minHeight: "8px",
                      }}
                    />
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: color,
                        flexShrink: 0,
                        boxShadow: m.type === "danger" ? `0 0 6px ${color}` : "none",
                      }}
                    />
                    <div
                      style={{
                        width: "1px",
                        flex: 1,
                        background: i === MILESTONES.length - 1 ? "transparent" : "rgba(30,42,56,0.8)",
                        minHeight: "8px",
                      }}
                    />
                  </div>

                  {/* Event */}
                  <div
                    style={{
                      paddingTop: "12px",
                      paddingBottom: "12px",
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                    }}
                  >
                    {m.event}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <div
          style={{
            marginTop: "1.25rem",
            fontFamily: "var(--font-mono)",
            fontSize: "8px",
            color: "#1e2a38",
            letterSpacing: "0.06em",
            textAlign: "center",
          }}
        >
          INTELLIGENCE ASSESSMENT · SOURCES: IAEA, SIPRI, ARMS CONTROL ASSOCIATION · DATA AS OF NOV 2023
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
