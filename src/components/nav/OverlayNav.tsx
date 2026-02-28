"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePanels } from "@/lib/context/PanelContext";
import type { PanelId } from "@/lib/context/PanelContext";

// ─── THREATCON Meter ─────────────────────────────────────────────────────────
const THREATCON_LABELS = ["", "ALPHA", "BRAVO", "CHARLIE", "DELTA", "ECHO"];
const THREATCON_COLORS = ["", "#22c55e", "#86efac", "#fbbf24", "#f97316", "#e03e3e"];

function ThreatconMeter() {
  const [level, setLevel] = useState<number>(0);

  useEffect(() => {
    fetch("/api/escalation")
      .then((r) => r.json())
      .then((d) => {
        const pts: { count: number; score: number }[] = d.points ?? [];
        const last7 = pts.slice(-7).filter((p) => p.count > 0);
        const avgCount = last7.length
          ? last7.reduce((a, p) => a + p.count, 0) / last7.length
          : 0;
        const avgScore = last7.length
          ? last7.reduce((a, p) => a + p.score, 0) / last7.length
          : 0;
        // Compute composite: 0..100
        const composite = Math.min(100, avgCount * 3 + avgScore * 0.4);
        const lvl = composite < 5 ? 1 : composite < 20 ? 2 : composite < 40 ? 3 : composite < 70 ? 4 : 5;
        setLevel(lvl);
      })
      .catch(() => setLevel(0));
  }, []);

  if (level === 0) return null;

  const color = THREATCON_COLORS[level];

  return (
    <div
      className="desktop-only"
      title={`THREATCON ${THREATCON_LABELS[level]} — Level ${level}/5`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "rgba(10,14,20,0.6)",
        border: `1px solid ${color}33`,
        borderRadius: "3px",
        padding: "3px 8px",
        cursor: "default",
      }}
    >
      {/* 5 bars */}
      <div style={{ display: "flex", gap: "2px", alignItems: "flex-end" }}>
        {[1, 2, 3, 4, 5].map((l) => (
          <div
            key={l}
            style={{
              width: "3px",
              height: `${6 + l * 2}px`,
              borderRadius: "1px",
              background: l <= level ? color : "rgba(30,42,56,0.8)",
              transition: "background 0.3s",
              boxShadow: l <= level && l === level ? `0 0 4px ${color}` : "none",
            }}
          />
        ))}
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "#2d3f54", letterSpacing: "0.1em" }}>
          THREATCON
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", fontWeight: 700, color, letterSpacing: "0.08em", lineHeight: 1 }}>
          {THREATCON_LABELS[level]}
        </div>
      </div>
    </div>
  );
}

// ─── CRT Toggle ──────────────────────────────────────────────────────────────
function CrtToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("warspy:crt");
    if (saved === "1") {
      document.body.classList.add("crt-mode");
      setOn(true);
    }
  }, []);

  const toggle = () => {
    setOn((v) => {
      const next = !v;
      document.body.classList.toggle("crt-mode", next);
      localStorage.setItem("warspy:crt", next ? "1" : "0");
      return next;
    });
  };

  return (
    <button
      className="desktop-only"
      onClick={toggle}
      title={on ? "Disable CRT mode" : "Enable CRT mode"}
      style={{
        background: on ? "rgba(51,255,102,0.08)" : "rgba(30,42,56,0.3)",
        border: `1px solid ${on ? "rgba(51,255,102,0.3)" : "rgba(30,42,56,0.7)"}`,
        borderRadius: "3px",
        cursor: "pointer",
        padding: "4px 8px",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        minHeight: "36px",
        transition: "all 0.15s",
      }}
    >
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: on ? "#33ff66" : "#3d4f63", letterSpacing: "0.08em", textShadow: on ? "0 0 6px #33ff66" : "none" }}>
        CRT
      </span>
    </button>
  );
}

interface PanelToggle {
  id: PanelId;
  icon: string;
  label: string;
}

const PANEL_TOGGLES: PanelToggle[] = [
  { id: "live", icon: "📡", label: "Events" },
  { id: "social", icon: "💬", label: "Social" },
  { id: "brief", icon: "📋", label: "Brief" },
  { id: "escalation", icon: "📈", label: "Escalation" },
];

const NAV_LINKS = [
  { href: "/", label: "Globe" },
  { href: "/focus", label: "FOCUS: Israel–Iran", accent: true },
  { href: "/feed", label: "Feed" },
  { href: "/nuclear", label: "Nuclear" },
  { href: "/strikes", label: "Strike Replay", accent: false },
  { href: "/actors", label: "Actors" },
  { href: "/context", label: "Context" },
  { href: "/brief", label: "Brief" },
  { href: "/heatmap", label: "Heatmap" },
  { href: "/methodology", label: "Methodology" },
];

export function OverlayNav() {
  const { toggle, isOpen } = usePanels();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "48px",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1rem",
          background: "rgba(3,5,8,0.88)",
          borderBottom: "1px solid rgba(96,165,250,0.1)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <span className="live-dot" />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: "12px",
              letterSpacing: "0.2em",
              color: "#e2e8f0",
              textTransform: "uppercase",
            }}
          >
            Warspy
          </span>
        </Link>

        {/* Desktop centered nav */}
        <nav
          className="desktop-only"
          style={{
            display: "flex",
            gap: "1.5rem",
            alignItems: "center",
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: link.accent ? 700 : 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: link.accent ? "var(--accent-red)" : "var(--text-muted)",
                textDecoration: "none",
                whiteSpace: "nowrap",
                transition: "color 0.12s",
              }}
              onMouseEnter={(e) => {
                if (!link.accent)
                  (e.currentTarget as HTMLElement).style.color = "#e2e8f0";
              }}
              onMouseLeave={(e) => {
                if (!link.accent)
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--text-muted)";
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: THREATCON + panel toggles + hamburger */}
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          <ThreatconMeter />
          {/* Panel toggles — always visible */}
          {PANEL_TOGGLES.map((pt) => {
            const active = isOpen(pt.id);
            return (
              <button
                key={pt.id}
                onClick={() => toggle(pt.id)}
                title={pt.label}
                aria-label={`Toggle ${pt.label} panel`}
                style={{
                  background: active
                    ? "rgba(96,165,250,0.15)"
                    : "rgba(30,42,56,0.4)",
                  border: `1px solid ${
                    active ? "rgba(96,165,250,0.4)" : "rgba(30,42,56,0.8)"
                  }`,
                  borderRadius: "3px",
                  cursor: "pointer",
                  padding: "4px 7px",
                  fontSize: "14px",
                  lineHeight: 1,
                  minWidth: "36px",
                  minHeight: "36px",
                  transition: "all 0.12s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                <span>{pt.icon}</span>
                <span
                  className="desktop-only"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "8px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: active ? "#60a5fa" : "#6b7a8d",
                  }}
                >
                  {pt.label}
                </span>
              </button>
            );
          })}

          {/* CRT mode toggle — desktop only */}
          <CrtToggle />

          {/* ⌘K hint — desktop only */}
          <button
            className="desktop-only"
            onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))}
            title="Command Palette"
            style={{
              background: "rgba(30,42,56,0.3)",
              border: "1px solid rgba(30,42,56,0.7)",
              borderRadius: "3px",
              cursor: "pointer",
              padding: "4px 8px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              minHeight: "36px",
            }}
          >
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "#3d4f63", letterSpacing: "0.08em" }}>⌘K</span>
          </button>

          {/* Mobile hamburger */}
          <button
            className="mobile-only"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            style={{
              background: menuOpen ? "rgba(96,165,250,0.1)" : "none",
              border: "1px solid rgba(30,42,56,0.8)",
              borderRadius: "3px",
              cursor: "pointer",
              minWidth: "36px",
              minHeight: "36px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              transition: "background 0.12s",
              padding: "4px 8px",
            }}
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                display: "block",
                width: "15px",
                height: "1.5px",
                background: "#94a3b8",
                borderRadius: "1px",
              }}
            />
            <motion.span
              animate={{ opacity: menuOpen ? 0 : 1 }}
              transition={{ duration: 0.15 }}
              style={{
                display: "block",
                width: "15px",
                height: "1.5px",
                background: "#94a3b8",
                borderRadius: "1px",
              }}
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                display: "block",
                width: "15px",
                height: "1.5px",
                background: "#94a3b8",
                borderRadius: "1px",
              }}
            />
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMenuOpen(false)}
              className="mobile-only"
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                zIndex: 190,
              }}
            />

            {/* Drawer */}
            <motion.nav
              key="nav-drawer"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="mobile-menu-drawer mobile-only"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0 20px",
                    height: "52px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: link.accent ? 700 : 500,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: link.accent
                      ? "var(--accent-red)"
                      : "var(--text-secondary)",
                    textDecoration: "none",
                    borderBottom: "1px solid rgba(30,42,56,0.5)",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
