"use client";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { usePanels } from "@/lib/context/PanelContext";
import { FOCUS_MARKERS } from "@/components/globe/globeData";
import { ISRAEL_IRAN_CONTEXT } from "@/lib/conflict/israelIranContext";
import type { PanelId } from "@/lib/context/PanelContext";

type Category = "navigate" | "globe" | "panels" | "intel";

interface Command {
  id: string;
  label: string;
  sub?: string;
  category: Category;
  icon?: string;
  color?: string;
  keywords?: string[];
  action: (ctx: { router: ReturnType<typeof useRouter>; togglePanel: (id: PanelId) => void }) => void;
}

const CATEGORY_LABELS: Record<Category, string> = {
  navigate: "Navigate",
  globe: "Fly To",
  panels: "Panels",
  intel: "Intelligence",
};

const CATEGORY_ORDER: Category[] = ["navigate", "globe", "panels", "intel"];

function buildCommands(): Command[] {
  const nav: Command[] = [
    { id: "nav-globe", label: "Globe", sub: "Full-screen 3D conflict theater", category: "navigate", icon: "🌍", keywords: ["home", "map", "globe"], action: ({ router }) => router.push("/") },
    { id: "nav-focus", label: "Israel–Iran Focus", sub: "Middle East theater view", category: "navigate", icon: "⚔️", color: "#e03e3e", keywords: ["focus", "israel", "iran", "middle east"], action: ({ router }) => router.push("/focus") },
    { id: "nav-feed", label: "Live Feed", sub: "All global conflict events", category: "navigate", icon: "📰", keywords: ["events", "news", "feed", "all"], action: ({ router }) => router.push("/feed") },
    { id: "nav-context", label: "Historical Context", sub: "1979 → 2024 background", category: "navigate", icon: "📜", keywords: ["history", "background", "why", "context"], action: ({ router }) => router.push("/context") },
    { id: "nav-brief", label: "Intelligence Brief", sub: "Top 10 last 12 hours", category: "navigate", icon: "📋", keywords: ["brief", "top", "ranked", "best"], action: ({ router }) => router.push("/brief") },
    { id: "nav-nuclear", label: "Nuclear Status", sub: "Iran enrichment · breakout timeline", category: "navigate", icon: "☢️", color: "#f97316", keywords: ["nuclear", "iran", "enrichment", "uranium", "iaea", "bomb", "natanz", "centrifuge"], action: ({ router }) => router.push("/nuclear") },
    { id: "nav-strikes", label: "Strike Replay", sub: "April 13 & Oct 1, 2024 barrages", category: "navigate", icon: "🚀", color: "#e03e3e", keywords: ["strike", "replay", "april", "october", "barrage", "missile", "drone", "attack", "ttp", "true promise"], action: ({ router }) => router.push("/strikes") },
    { id: "nav-actors", label: "Conflict Actors", sub: "IDF, IRGC, Mossad, Hezbollah, Hamas...", category: "navigate", icon: "🎯", keywords: ["actors", "idf", "irgc", "mossad", "hezbollah", "hamas", "houthis", "pmf", "military", "profiles"], action: ({ router }) => router.push("/actors") },
    { id: "nav-heatmap", label: "Activity Heatmap", sub: "90-day event density calendar", category: "navigate", icon: "🟥", keywords: ["heatmap", "calendar", "activity", "density", "history", "days", "grid"], action: ({ router }) => router.push("/heatmap") },
    { id: "nav-methodology", label: "Methodology", sub: "How data is sourced & scored", category: "navigate", icon: "⚙️", keywords: ["docs", "about", "how", "algorithm"], action: ({ router }) => router.push("/methodology") },
  ];

  const globe: Command[] = FOCUS_MARKERS.map((m) => ({
    id: `globe-${m.id}`,
    label: m.label,
    sub: m.subLabel,
    category: "globe" as Category,
    color: m.color,
    keywords: [m.label.toLowerCase(), m.subLabel.toLowerCase(), m.id],
    action: ({ router }) => {
      // Store intent; ConflictGlobe picks it up on mount if not yet rendered
      sessionStorage.setItem("warspy:flyto", JSON.stringify({ lat: m.lat, lng: m.lng, altitude: 1.2 }));
      // If globe is already live, dispatch immediately
      window.dispatchEvent(new CustomEvent("warspy:flyto", { detail: { lat: m.lat, lng: m.lng, altitude: 1.2 } }));
      router.push("/");
    },
  }));

  const panels: Command[] = [
    { id: "panel-live", label: "Toggle Live Events", sub: "Real-time event feed", category: "panels", icon: "📡", keywords: ["live", "events", "feed", "toggle"], action: ({ togglePanel }) => togglePanel("live") },
    { id: "panel-social", label: "Toggle Social Feed", sub: "RSS · Reddit · News", category: "panels", icon: "💬", keywords: ["social", "rss", "reddit", "twitter", "news"], action: ({ togglePanel }) => togglePanel("social") },
    { id: "panel-context", label: "Toggle Context Panel", sub: "Why it's happening", category: "panels", icon: "🧭", keywords: ["context", "history", "why", "panel"], action: ({ togglePanel }) => togglePanel("context") },
    { id: "panel-brief", label: "Toggle Brief Panel", sub: "Top intelligence items", category: "panels", icon: "📋", keywords: ["brief", "top", "intel", "panel"], action: ({ togglePanel }) => togglePanel("brief") },
  ];

  const intel: Command[] = ISRAEL_IRAN_CONTEXT.map((s) => ({
    id: `intel-${s.id}`,
    label: s.title,
    sub: s.period,
    category: "intel" as Category,
    color: s.color,
    keywords: [s.title.toLowerCase(), s.period, s.id, ...s.keyFacts.slice(0, 2).map((f) => f.toLowerCase())],
    action: ({ router }) => router.push(`/context#${s.id}`),
  }));

  return [...nav, ...globe, ...panels, ...intel];
}

const ALL_COMMANDS = buildCommands();

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toggle: togglePanel } = usePanels();

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
        setSelectedIdx(0);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40);
  }, [open]);

  // Filter
  const filtered = useMemo(() => {
    if (!query.trim()) return ALL_COMMANDS;
    const q = query.toLowerCase();
    return ALL_COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.sub?.toLowerCase().includes(q) ||
        c.keywords?.some((k) => k.includes(q))
    );
  }, [query]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<Category, Command[]>();
    for (const cmd of filtered) {
      if (!map.has(cmd.category)) map.set(cmd.category, []);
      map.get(cmd.category)!.push(cmd);
    }
    return CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => ({
      category: c,
      commands: map.get(c)!,
    }));
  }, [filtered]);

  // Flat list for keyboard nav
  const flat = useMemo(() => grouped.flatMap((g) => g.commands), [grouped]);

  const execute = useCallback(
    (cmd: Command) => {
      setOpen(false);
      setQuery("");
      cmd.action({ router, togglePanel });
    },
    [router, togglePanel]
  );

  // Arrow key + Enter navigation
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, flat.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
      else if (e.key === "Enter") { e.preventDefault(); if (flat[selectedIdx]) execute(flat[selectedIdx]); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, flat, selectedIdx, execute]);

  // Scroll selected into view
  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${selectedIdx}"]`)?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  // Reset selection on query change
  useEffect(() => { setSelectedIdx(0); }, [query]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", zIndex: 300 }}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              top: "12%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(600px, calc(100vw - 2rem))",
              zIndex: 301,
              background: "rgba(6, 10, 18, 0.98)",
              border: "1px solid rgba(96,165,250,0.22)",
              borderRadius: "8px",
              boxShadow: "0 0 0 1px rgba(96,165,250,0.06), 0 32px 80px rgba(0,0,0,0.9), 0 0 80px rgba(96,165,250,0.05)",
              overflow: "hidden",
            }}
          >
            {/* Input row */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", borderBottom: "1px solid rgba(96,165,250,0.1)" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.35 }}>
                <circle cx="6" cy="6" r="4.5" stroke="#60a5fa" strokeWidth="1.2" />
                <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search intel, locations, panels..."
                style={{ flex: 1, background: "none", border: "none", outline: "none", fontFamily: "var(--font-mono)", fontSize: "13px", color: "#e2e8f0", letterSpacing: "0.02em" }}
              />
              <kbd style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "#3d4f63", background: "rgba(30,42,56,0.5)", border: "1px solid rgba(30,42,56,0.9)", borderRadius: "3px", padding: "2px 6px", flexShrink: 0 }}>
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} style={{ maxHeight: "400px", overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "#1e2a38 transparent", padding: "4px 0 6px" }}>
              {flat.length === 0 ? (
                <div style={{ padding: "28px", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "10px", color: "#3d4f63", letterSpacing: "0.1em" }}>
                  NO RESULTS — TRY "TEHRAN" OR "NUCLEAR"
                </div>
              ) : (
                grouped.map(({ category, commands }) => {
                  const groupOffset = flat.indexOf(commands[0]);
                  return (
                    <div key={category}>
                      <div style={{ padding: "10px 16px 4px", fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#2d3f54", userSelect: "none" }}>
                        {CATEGORY_LABELS[category]}
                      </div>
                      {commands.map((cmd, i) => {
                        const idx = groupOffset + i;
                        const sel = idx === selectedIdx;
                        return (
                          <div
                            key={cmd.id}
                            data-idx={idx}
                            onClick={() => execute(cmd)}
                            onMouseEnter={() => setSelectedIdx(idx)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              padding: "7px 16px",
                              cursor: "pointer",
                              background: sel ? "rgba(96,165,250,0.07)" : "transparent",
                              borderLeft: `2px solid ${sel ? (cmd.color ?? "#60a5fa") : "transparent"}`,
                              transition: "background 0.06s, border-color 0.06s",
                            }}
                          >
                            {/* Icon or color dot */}
                            <div style={{ flexShrink: 0, width: "20px", display: "flex", justifyContent: "center" }}>
                              {cmd.icon
                                ? <span style={{ fontSize: "12px" }}>{cmd.icon}</span>
                                : <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: cmd.color ?? "#60a5fa", boxShadow: sel ? `0 0 6px ${cmd.color ?? "#60a5fa"}99` : "none" }} />
                              }
                            </div>

                            {/* Text */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: sel ? "#e2e8f0" : "#94a3b8", fontWeight: sel ? 600 : 400, letterSpacing: "0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", transition: "color 0.06s" }}>
                                {cmd.label}
                              </div>
                              {cmd.sub && (
                                <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "#2d3f54", letterSpacing: "0.04em", marginTop: "1px" }}>
                                  {cmd.sub}
                                </div>
                              )}
                            </div>

                            {/* Enter key hint */}
                            {sel && (
                              <kbd style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "#60a5fa", background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: "3px", padding: "2px 6px", flexShrink: 0 }}>
                                ↵
                              </kbd>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer hints */}
            <div style={{ padding: "7px 16px", borderTop: "1px solid rgba(30,42,56,0.6)", display: "flex", alignItems: "center", gap: "14px" }}>
              {[["↑↓", "navigate"], ["↵", "select"], ["esc", "close"]].map(([k, l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <kbd style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "#6b7a8d", background: "rgba(30,42,56,0.5)", border: "1px solid rgba(30,42,56,0.9)", borderRadius: "2px", padding: "1px 5px" }}>{k}</kbd>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "#2d3f54", letterSpacing: "0.04em" }}>{l}</span>
                </div>
              ))}
              <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: "8px", color: "#1e2a38", letterSpacing: "0.06em" }}>
                {flat.length} result{flat.length !== 1 ? "s" : ""}
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
