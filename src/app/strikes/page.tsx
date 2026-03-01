"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { GlobeArc } from "@/components/globe/globeData";

const GlobeWrapper = dynamic(() => import("@/components/globe/GlobeWrapper"), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100vw", height: "100vh", background: "#030508" }} />
  ),
});

// ─── Strike data ────────────────────────────────────────────────────────────

interface Wave {
  id: string;
  time: string;         // HH:MM local
  label: string;
  type: "drone" | "ballistic" | "cruise";
  count: number;
  intercepted: number;
  arcs: GlobeArc[];
  description: string;
}

interface Strike {
  id: string;
  name: string;
  date: string;
  subtitle: string;
  color: string;
  pov: { lat: number; lng: number; altitude: number };
  waves: Wave[];
}

const STRIKES: Strike[] = [
  {
    id: "apr13",
    name: "Operation True Promise",
    date: "April 13–14, 2024",
    subtitle: "Iran's first-ever direct attack on Israeli territory — 99% intercepted",
    color: "#e03e3e",
    pov: { lat: 33, lng: 39, altitude: 1.6 },
    waves: [
      {
        id: "apr13-w1",
        time: "22:00",
        label: "Wave 1 — Shahed Drones",
        type: "drone",
        count: 170,
        intercepted: 170,
        description: "170 Shahed-136 kamikaze drones launched from Iranian territory. Slow-moving, intercepted over Jordan and Iraq by US, UK, and Jordanian forces.",
        arcs: [
          { id: "w1-a1", startLat: 35.69, startLng: 51.39, endLat: 31.77, endLng: 35.21, color: "rgba(224,62,62,0.9)", label: "Drones (Tehran → Jerusalem)", dashLength: 0.1, dashGap: 0.08, animateTime: 8000 },
          { id: "w1-a2", startLat: 33.31, startLng: 44.37, endLat: 31.77, endLng: 35.21, color: "rgba(224,62,62,0.7)", label: "Drones (Iraq → Jerusalem)", dashLength: 0.1, dashGap: 0.08, animateTime: 6000 },
          { id: "w1-a3", startLat: 15.37, startLng: 44.19, endLat: 31.5, endLng: 34.47, color: "rgba(251,191,36,0.7)", label: "Drones (Yemen → Gaza axis)", dashLength: 0.1, dashGap: 0.08, animateTime: 9000 },
        ],
      },
      {
        id: "apr13-w2",
        time: "02:00",
        label: "Wave 2 — Cruise Missiles",
        type: "cruise",
        count: 30,
        intercepted: 30,
        description: "30 cruise missiles (Paveh class) launched at multiple Israeli targets. Slower than ballistic — intercepted by Arrow and David's Sling systems.",
        arcs: [
          { id: "w2-a1", startLat: 35.69, startLng: 51.39, endLat: 32.08, endLng: 34.78, color: "rgba(167,139,250,0.9)", label: "Cruise missiles → Tel Aviv", dashLength: 0.2, dashGap: 0.1, animateTime: 5000 },
          { id: "w2-a2", startLat: 35.69, startLng: 51.39, endLat: 31.77, endLng: 35.21, color: "rgba(167,139,250,0.8)", label: "Cruise missiles → Jerusalem", dashLength: 0.2, dashGap: 0.1, animateTime: 5500 },
        ],
      },
      {
        id: "apr13-w3",
        time: "02:30",
        label: "Wave 3 — Ballistic Missiles",
        type: "ballistic",
        count: 120,
        intercepted: 120,
        description: "120 ballistic missiles (Shahab-3, Fattah-1) at Israeli military bases. Most intercepted by Arrow-3 outside the atmosphere. Minor impacts in Negev.",
        arcs: [
          { id: "w3-a1", startLat: 35.69, startLng: 51.39, endLat: 31.77, endLng: 35.21, color: "rgba(249,115,22,0.95)", label: "Ballistic → Jerusalem (Shahab)", dashLength: 0.4, dashGap: 0.05, animateTime: 2500 },
          { id: "w3-a2", startLat: 35.69, startLng: 51.39, endLat: 31.0, endLng: 35.0, color: "rgba(249,115,22,0.9)", label: "Ballistic → Negev bases", dashLength: 0.4, dashGap: 0.05, animateTime: 2800 },
          { id: "w3-a3", startLat: 32.66, startLng: 51.67, endLat: 31.77, endLng: 35.21, color: "rgba(249,115,22,0.8)", label: "Ballistic → Jerusalem (Isfahan)", dashLength: 0.35, dashGap: 0.06, animateTime: 2200 },
        ],
      },
    ],
  },
  {
    id: "oct1",
    name: "Operation True Promise II",
    date: "October 1, 2024",
    subtitle: "~180 ballistic missiles — 32+ reached Israeli airspace, multiple impacts",
    color: "#f97316",
    pov: { lat: 33, lng: 39, altitude: 1.5 },
    waves: [
      {
        id: "oct1-w1",
        time: "19:30",
        label: "Wave 1 — Fattah-1 Hypersonic",
        type: "ballistic",
        count: 90,
        intercepted: 58,
        description: "First wave of Fattah-1 hypersonic ballistic missiles. Faster re-entry than Shahab; harder to intercept. Targets include Nevatim and Tel Nof air bases.",
        arcs: [
          { id: "oct-a1", startLat: 35.69, startLng: 51.39, endLat: 31.23, endLng: 34.89, color: "rgba(249,115,22,0.95)", label: "Fattah-1 → Nevatim AFB", dashLength: 0.45, dashGap: 0.04, animateTime: 2000 },
          { id: "oct-a2", startLat: 35.69, startLng: 51.39, endLat: 31.83, endLng: 34.89, color: "rgba(249,115,22,0.9)", label: "Fattah-1 → Tel Nof AFB", dashLength: 0.45, dashGap: 0.04, animateTime: 2100 },
          { id: "oct-a3", startLat: 35.69, startLng: 51.39, endLat: 31.77, endLng: 35.21, color: "rgba(249,115,22,0.85)", label: "Fattah-1 → Jerusalem area", dashLength: 0.4, dashGap: 0.05, animateTime: 2300 },
        ],
      },
      {
        id: "oct1-w2",
        time: "19:50",
        label: "Wave 2 — Shahab-3 Barrage",
        type: "ballistic",
        count: 90,
        intercepted: 90,
        description: "Second barrage of Shahab-3 missiles across broader Israeli territory. Wider dispersion targeting multiple points to overwhelm air defenses.",
        arcs: [
          { id: "oct-b1", startLat: 35.69, startLng: 51.39, endLat: 32.08, endLng: 34.78, color: "rgba(224,62,62,0.9)", label: "Shahab-3 → Tel Aviv metro", dashLength: 0.4, dashGap: 0.05, animateTime: 2400 },
          { id: "oct-b2", startLat: 32.66, startLng: 51.67, endLat: 32.08, endLng: 34.78, color: "rgba(224,62,62,0.85)", label: "Shahab-3 → Tel Aviv (Isfahan)", dashLength: 0.4, dashGap: 0.05, animateTime: 2600 },
          { id: "oct-b3", startLat: 35.69, startLng: 51.39, endLat: 32.79, endLng: 35.53, color: "rgba(224,62,62,0.8)", label: "Shahab-3 → Haifa", dashLength: 0.35, dashGap: 0.06, animateTime: 2200 },
          { id: "oct-b4", startLat: 35.69, startLng: 51.39, endLat: 31.0, endLng: 35.0, color: "rgba(224,62,62,0.75)", label: "Shahab-3 → Negev", dashLength: 0.35, dashGap: 0.06, animateTime: 2800 },
        ],
      },
    ],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

const typeColor: Record<string, string> = {
  drone: "#fbbf24",
  ballistic: "#e03e3e",
  cruise: "#a78bfa",
};

const typeLabel: Record<string, string> = {
  drone: "DRONE",
  ballistic: "BALLISTIC",
  cruise: "CRUISE",
};

export default function StrikesPage() {
  const [strikeIdx, setStrikeIdx] = useState(0);
  const [waveIdx, setWaveIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [controlExpanded, setControlExpanded] = useState(false);

  const strike = STRIKES[strikeIdx];
  const wave = strike.waves[waveIdx];

  // Auto-advance waves when playing
  useEffect(() => {
    if (!playing) {
      if (intervalRef.current) clearTimeout(intervalRef.current);
      return;
    }
    intervalRef.current = setTimeout(() => {
      if (waveIdx < strike.waves.length - 1) {
        setWaveIdx((i) => i + 1);
      } else {
        setPlaying(false);
      }
    }, 4000);
    return () => { if (intervalRef.current) clearTimeout(intervalRef.current); };
  }, [playing, waveIdx, strike.waves.length]);

  // Reset wave when strike changes
  useEffect(() => {
    setWaveIdx(0);
    setPlaying(false);
  }, [strikeIdx]);

  const totalProjectiles = strike.waves.reduce((a, w) => a + w.count, 0);
  const totalIntercepted = strike.waves.reduce((a, w) => a + w.intercepted, 0);
  const interceptPct = Math.round((totalIntercepted / totalProjectiles) * 100);

  useEffect(() => {
    document.body.classList.add("body-globe-mode");
    return () => document.body.classList.remove("body-globe-mode");
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 769);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse2{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>

      {/* Globe */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "#030508" }}>
        <GlobeWrapper
          initialPov={strike.pov}
          customArcs={wave.arcs}
          hideDefaultArcs
        />
      </div>

      {/* Scanline */}
      <div className="scanline-overlay" />

      {/* Back link */}
      <div
        style={{
          position: "fixed",
          top: "64px",
          left: "1.5rem",
          zIndex: 150,
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
            background: "rgba(10,14,20,0.8)",
            border: "1px solid rgba(30,42,56,0.8)",
            borderRadius: "3px",
            padding: "6px 12px",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          ← Globe
        </Link>
      </div>

      {/* Strike selector */}
      <div
        style={{
          position: "fixed",
          top: "64px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 150,
          display: "flex",
          gap: "8px",
        }}
      >
        {STRIKES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStrikeIdx(i)}
            style={{
              background: i === strikeIdx ? `rgba(${s.color === "#e03e3e" ? "224,62,62" : "249,115,22"},0.15)` : "rgba(10,14,20,0.85)",
              border: `1px solid ${i === strikeIdx ? s.color + "55" : "rgba(30,42,56,0.8)"}`,
              borderRadius: "3px",
              padding: "7px 14px",
              cursor: "pointer",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, color: i === strikeIdx ? s.color : "#6b7a8d", letterSpacing: "0.08em" }}>
              {s.name}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "#3d4f63", marginTop: "2px" }}>
              {s.date}
            </div>
          </button>
        ))}
      </div>

      {/* Bottom control bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 150,
          background: "rgba(6,10,18,0.95)",
          borderTop: `1px solid ${strike.color}33`,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          padding: isMobile ? "10px 16px 14px" : "16px 20px 20px",
        }}
      >
        {isMobile && !controlExpanded ? (
          /* ── Compact mobile strip ── */
          <div
            onClick={() => setControlExpanded(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 700,
                color: "#e2e8f0",
                letterSpacing: "0.04em",
              }}>
                {strike.name}
              </div>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                color: typeColor[wave.type],
                letterSpacing: "0.06em",
              }}>
                Wave {waveIdx + 1}/{strike.waves.length} · {typeLabel[wave.type]}
              </div>
            </div>
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <button
                onClick={(e) => { e.stopPropagation(); setWaveIdx(Math.max(0, waveIdx - 1)); }}
                disabled={waveIdx === 0}
                style={{
                  background: "rgba(30,42,56,0.6)",
                  border: "1px solid rgba(30,42,56,0.8)",
                  borderRadius: "3px",
                  cursor: waveIdx === 0 ? "not-allowed" : "pointer",
                  color: waveIdx === 0 ? "#2d3f54" : "#6b7a8d",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  padding: "6px 8px",
                  minWidth: "32px",
                  minHeight: "32px",
                }}
              >‹</button>
              <button
                onClick={(e) => { e.stopPropagation(); setPlaying((v) => !v); }}
                style={{
                  background: playing ? "rgba(224,62,62,0.1)" : "rgba(30,42,56,0.6)",
                  border: `1px solid ${playing ? "rgba(224,62,62,0.3)" : "rgba(30,42,56,0.8)"}`,
                  borderRadius: "3px",
                  cursor: "pointer",
                  color: playing ? "#e03e3e" : "#94a3b8",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  padding: "6px 10px",
                  minHeight: "32px",
                }}
              >{playing ? "⏸" : "▶"}</button>
              <button
                onClick={(e) => { e.stopPropagation(); setWaveIdx(Math.min(strike.waves.length - 1, waveIdx + 1)); }}
                disabled={waveIdx === strike.waves.length - 1}
                style={{
                  background: "rgba(30,42,56,0.6)",
                  border: "1px solid rgba(30,42,56,0.8)",
                  borderRadius: "3px",
                  cursor: waveIdx === strike.waves.length - 1 ? "not-allowed" : "pointer",
                  color: waveIdx === strike.waves.length - 1 ? "#2d3f54" : "#6b7a8d",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  padding: "6px 8px",
                  minWidth: "32px",
                  minHeight: "32px",
                }}
              >›</button>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "#3d4f63" }}>▲</span>
          </div>
        ) : (
          /* ── Full control bar (desktop always, mobile when expanded) ── */
          <div style={{ position: "relative" }}>
            {isMobile && (
              <button
                onClick={() => setControlExpanded(false)}
                style={{
                  position: "absolute",
                  top: "0px",
                  right: "0px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#3d4f63",
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  padding: "4px 8px",
                  zIndex: 1,
                }}
              >▼ COLLAPSE</button>
            )}

            {/* Strike header */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "14px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: strike.color, boxShadow: `0 0 8px ${strike.color}`, animation: "pulse2 1.5s ease-in-out infinite" }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.04em" }}>
                    {strike.name}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "#3d4f63", letterSpacing: "0.08em" }}>
                    {strike.date}
                  </span>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#6b7a8d", letterSpacing: "0.02em" }}>
                  {strike.subtitle}
                </div>
              </div>

              {/* Overall stats */}
              <div style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
                {[
                  { label: "FIRED", value: totalProjectiles, color: strike.color },
                  { label: "INTERCEPTED", value: `${interceptPct}%`, color: "#22c55e" },
                ].map((s) => (
                  <div key={s.label} style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "18px", fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "#2d3f54", letterSpacing: "0.1em", marginTop: "2px" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wave timeline */}
            <div style={{ display: "flex", gap: "6px", alignItems: "stretch", marginBottom: "14px" }}>
              {strike.waves.map((w, i) => (
                <button
                  key={w.id}
                  onClick={() => { setWaveIdx(i); setPlaying(false); }}
                  style={{
                    flex: 1,
                    background: i === waveIdx ? "rgba(30,42,56,0.8)" : "rgba(15,22,35,0.5)",
                    border: `1px solid ${i === waveIdx ? typeColor[w.type] + "44" : "rgba(30,42,56,0.6)"}`,
                    borderLeft: i === waveIdx ? `3px solid ${typeColor[w.type]}` : "3px solid transparent",
                    borderRadius: "3px",
                    cursor: "pointer",
                    padding: "8px 10px",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: typeColor[w.type], letterSpacing: "0.08em", fontWeight: 700 }}>
                      {typeLabel[w.type]}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "#2d3f54" }}>{w.time}</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: i === waveIdx ? "#94a3b8" : "#3d4f63" }}>
                    {w.count} launched · {w.intercepted} intercepted
                  </div>
                </button>
              ))}
            </div>

            {/* Current wave detail */}
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, color: typeColor[wave.type], letterSpacing: "0.06em", marginBottom: "4px" }}>
                  {wave.label}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#6b7a8d", lineHeight: 1.6, letterSpacing: "0.01em" }}>
                  {wave.description}
                </div>
              </div>

              {/* Playback controls */}
              <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
                <button
                  onClick={() => setWaveIdx(Math.max(0, waveIdx - 1))}
                  disabled={waveIdx === 0}
                  style={{ background: "rgba(30,42,56,0.6)", border: "1px solid rgba(30,42,56,0.8)", borderRadius: "3px", cursor: waveIdx === 0 ? "not-allowed" : "pointer", color: waveIdx === 0 ? "#2d3f54" : "#6b7a8d", fontFamily: "var(--font-mono)", fontSize: "11px", padding: "6px 10px", minWidth: "36px", minHeight: "36px" }}
                >
                  ‹
                </button>
                <button
                  onClick={() => setPlaying((v) => !v)}
                  style={{ background: playing ? "rgba(224,62,62,0.1)" : "rgba(30,42,56,0.6)", border: `1px solid ${playing ? "rgba(224,62,62,0.3)" : "rgba(30,42,56,0.8)"}`, borderRadius: "3px", cursor: "pointer", color: playing ? "#e03e3e" : "#94a3b8", fontFamily: "var(--font-mono)", fontSize: "11px", padding: "6px 14px", minHeight: "36px" }}
                >
                  {playing ? "⏸ PAUSE" : "▶ PLAY"}
                </button>
                <button
                  onClick={() => setWaveIdx(Math.min(strike.waves.length - 1, waveIdx + 1))}
                  disabled={waveIdx === strike.waves.length - 1}
                  style={{ background: "rgba(30,42,56,0.6)", border: "1px solid rgba(30,42,56,0.8)", borderRadius: "3px", cursor: waveIdx === strike.waves.length - 1 ? "not-allowed" : "pointer", color: waveIdx === strike.waves.length - 1 ? "#2d3f54" : "#6b7a8d", fontFamily: "var(--font-mono)", fontSize: "11px", padding: "6px 10px", minWidth: "36px", minHeight: "36px" }}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
