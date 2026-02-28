"use client";
import Link from "next/link";
import { usePanels } from "@/lib/context/PanelContext";
import type { PanelId } from "@/lib/context/PanelContext";

interface PanelToggle {
  id: PanelId;
  icon: string;
  label: string;
}

const PANEL_TOGGLES: PanelToggle[] = [
  { id: "live", icon: "📡", label: "Events" },
  { id: "social", icon: "💬", label: "Social" },
  { id: "brief", icon: "📋", label: "Brief" },
];

const NAV_LINKS = [
  { href: "/", label: "Globe" },
  { href: "/focus", label: "FOCUS: Israel–Iran", accent: true },
  { href: "/feed", label: "Feed" },
  { href: "/context", label: "Context" },
  { href: "/brief", label: "Brief" },
];

export function OverlayNav() {
  const { toggle, isOpen } = usePanels();

  return (
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
        padding: "0 1.25rem",
        background: "rgba(3,5,8,0.82)",
        borderBottom: "1px solid rgba(96,165,250,0.1)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
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

      {/* Nav links */}
      <nav
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
              padding: "4px 0",
              transition: "color 0.12s",
            }}
            onMouseEnter={(e) => {
              if (!link.accent)
                (e.currentTarget as HTMLElement).style.color = "#e2e8f0";
            }}
            onMouseLeave={(e) => {
              if (!link.accent)
                (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            }}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Panel toggle buttons */}
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        {PANEL_TOGGLES.map((pt) => {
          const active = isOpen(pt.id);
          return (
            <button
              key={pt.id}
              onClick={() => toggle(pt.id)}
              title={pt.label}
              style={{
                background: active
                  ? "rgba(96,165,250,0.15)"
                  : "rgba(30,42,56,0.4)",
                border: `1px solid ${active ? "rgba(96,165,250,0.4)" : "rgba(30,42,56,0.8)"}`,
                borderRadius: "3px",
                cursor: "pointer",
                padding: "4px 8px",
                fontSize: "13px",
                lineHeight: 1,
                transition: "all 0.12s",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(96,165,250,0.08)";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(96,165,250,0.25)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(30,42,56,0.4)";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(30,42,56,0.8)";
                }
              }}
            >
              <span>{pt.icon}</span>
              <span
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
      </div>
    </header>
  );
}
