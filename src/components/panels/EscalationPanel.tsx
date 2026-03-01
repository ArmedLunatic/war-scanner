"use client";
import { useEffect, useState } from "react";
import { PanelShell } from "./PanelShell";
import { PanelSkeleton } from "./PanelSkeleton";
import { usePanels } from "@/lib/context/PanelContext";
import type { EscalationPoint } from "@/app/api/escalation/route";

const W = 292;
const H = 88;

function buildPath(pts: { x: number; y: number }[]) {
  if (pts.length === 0) return { line: "", area: "" };
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${H} L${pts[0].x.toFixed(1)},${H} Z`;
  return { line, area };
}

export function EscalationPanel() {
  const { isOpen } = usePanels();
  const [points, setPoints] = useState<EscalationPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const open = isOpen("escalation");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/escalation")
      .then((r) => r.json())
      .then((d) => { setPoints(d.points ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [open]);

  const maxScore = Math.max(...points.map((p) => p.score), 1);

  const svgPts = points.map((p, i) => ({
    x: points.length > 1 ? (i / (points.length - 1)) * W : W / 2,
    y: H - (p.score / maxScore) * (H - 8) - 4,
  }));

  const { line, area } = buildPath(svgPts);

  const today = points[points.length - 1];
  const yesterday = points[points.length - 2];
  const trend = today && yesterday ? today.score - yesterday.score : 0;
  const peak = Math.max(...points.map((p) => p.score), 0);
  const totalEvents = points.reduce((a, p) => a + p.count, 0);
  const activeDays = points.filter((p) => p.count > 0).length;
  const avgPerActiveDay = activeDays > 0 ? Math.round(totalEvents / activeDays) : 0;

  const trendLabel = trend > 8 ? "↑ SURGE" : trend > 2 ? "↑ UP" : trend < -8 ? "↓ DROP" : trend < -2 ? "↓ DOWN" : "→ FLAT";
  const trendColor = trend > 2 ? "#e03e3e" : trend < -2 ? "#22c55e" : "#6b7a8d";

  // 7-day labels
  const dateLabels = [0, 7, 14, 21, 29].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - offset));
    return { offset, label: `${d.getMonth() + 1}/${d.getDate()}` };
  });

  return (
    <PanelShell id="escalation" title="Escalation Index" icon="📈" maxHeight="calc(60vh - 80px)">
      {loading ? (
        <PanelSkeleton rows={3} />
      ) : (
        <div style={{ padding: "12px 14px 14px" }}>
          {/* Score + trend */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "12px" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "36px",
                fontWeight: 700,
                color: "#e03e3e",
                lineHeight: 1,
                textShadow: "0 0 24px rgba(224,62,62,0.4)",
              }}
            >
              {today?.score ?? 0}
            </span>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "#3d4f63", letterSpacing: "0.1em" }}>
                TODAY
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "#3d4f63", letterSpacing: "0.06em" }}>
                AVG SCORE
              </div>
            </div>
            <span
              style={{
                marginLeft: "auto",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: 700,
                color: trendColor,
                letterSpacing: "0.06em",
              }}
            >
              {trendLabel}
            </span>
          </div>

          {/* SVG Sparkline */}
          <div
            style={{
              background: "rgba(10,14,20,0.6)",
              border: "1px solid rgba(30,42,56,0.8)",
              borderRadius: "3px",
              padding: "8px",
              marginBottom: "4px",
            }}
          >
            <svg
              width="100%"
              viewBox={`0 0 ${W} ${H}`}
              style={{ display: "block", overflow: "visible" }}
            >
              <defs>
                <linearGradient id="escalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e03e3e" stopOpacity="0.45" />
                  <stop offset="80%" stopColor="#e03e3e" stopOpacity="0.04" />
                  <stop offset="100%" stopColor="#e03e3e" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="escalLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#7f1d1d" />
                  <stop offset="70%" stopColor="#e03e3e" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>

              {/* Horizontal grid lines */}
              {[0.25, 0.5, 0.75].map((frac) => (
                <line
                  key={frac}
                  x1={0}
                  y1={H - frac * H}
                  x2={W}
                  y2={H - frac * H}
                  stroke="rgba(30,42,56,0.6)"
                  strokeWidth="1"
                />
              ))}

              {/* Area fill */}
              {area && <path d={area} fill="url(#escalGrad)" />}

              {/* Line stroke */}
              {line && (
                <path
                  d={line}
                  fill="none"
                  stroke="url(#escalLine)"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}

              {/* Today indicator */}
              {svgPts.length > 0 && today && today.score > 0 && (
                <>
                  <line
                    x1={svgPts[svgPts.length - 1].x}
                    y1={0}
                    x2={svgPts[svgPts.length - 1].x}
                    y2={H}
                    stroke="rgba(249,115,22,0.35)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx={svgPts[svgPts.length - 1].x}
                    cy={svgPts[svgPts.length - 1].y}
                    r="3"
                    fill="#f97316"
                    style={{ filter: "drop-shadow(0 0 4px #f9731688)" }}
                  />
                </>
              )}

              {/* Zero-data state */}
              {peak === 0 && (
                <text
                  x={W / 2}
                  y={H / 2}
                  textAnchor="middle"
                  fill="#2d3f54"
                  style={{ fontFamily: "monospace", fontSize: "9px" }}
                >
                  NO DATA YET — RUN INGEST
                </text>
              )}
            </svg>
          </div>

          {/* Date labels */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            {dateLabels.map(({ label }) => (
              <span
                key={label}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "7px",
                  color: "#1e2a38",
                  letterSpacing: "0.04em",
                }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: "6px" }}>
            {[
              { label: "30D PEAK", value: peak, unit: "" },
              { label: "EVT/DAY", value: avgPerActiveDay, unit: "" },
              { label: "ACTIVE DAYS", value: activeDays, unit: "/30" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  flex: 1,
                  background: "rgba(15,22,35,0.7)",
                  border: "1px solid rgba(30,42,56,0.8)",
                  borderRadius: "3px",
                  padding: "6px 8px",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "7px",
                    color: "#2d3f54",
                    letterSpacing: "0.1em",
                    marginBottom: "4px",
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#60a5fa",
                  }}
                >
                  {s.value}
                  <span style={{ fontSize: "9px", color: "#3d4f63", fontWeight: 400 }}>
                    {s.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 30-day data note */}
          <div
            style={{
              marginTop: "10px",
              fontFamily: "var(--font-mono)",
              fontSize: "8px",
              color: "#1e2a38",
              letterSpacing: "0.06em",
            }}
          >
            COMPUTED FROM ACTIVE CLUSTER SCORES · 30-DAY WINDOW
          </div>
        </div>
      )}
    </PanelShell>
  );
}
