"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LiveFeedPanel } from "@/components/panels/LiveFeedPanel";
import { SocialFeedPanel } from "@/components/panels/SocialFeedPanel";
import { ContextPanel } from "@/components/panels/ContextPanel";
import { TimelinePanel } from "@/components/panels/TimelinePanel";
import { BriefPanel } from "@/components/panels/BriefPanel";
import { StatusBar } from "@/components/nav/StatusBar";
import type { GlobeMarker } from "@/components/globe/globeData";

const GlobeWrapper = dynamic(
  () => import("@/components/globe/GlobeWrapper"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "var(--bg-globe, #030508)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.15em",
            color: "rgba(96,165,250,0.4)",
            textTransform: "uppercase",
          }}
        >
          Initializing Globe...
        </span>
      </div>
    ),
  }
);

export default function GlobePage() {
  const [selectedMarker, setSelectedMarker] = useState<GlobeMarker | null>(null);

  // Lock body scroll for full-screen globe
  useEffect(() => {
    document.body.classList.add("body-globe-mode");
    return () => document.body.classList.remove("body-globe-mode");
  }, []);

  return (
    <>
      {/* Full-screen globe */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background: "#030508",
        }}
      >
        <GlobeWrapper onMarkerClick={(m) => setSelectedMarker(m)} />
      </div>

      {/* Scanline atmosphere overlay */}
      <div className="scanline-overlay" />

      {/* ── Right panels ── */}
      <div
        style={{
          position: "fixed",
          right: "1.5rem",
          top: "64px",
          zIndex: "var(--panel-z)" as any,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          maxHeight: "calc(100vh - 140px)",
        }}
      >
        <LiveFeedPanel />
        <SocialFeedPanel />
        <BriefPanel />
      </div>

      {/* ── Left panel ── */}
      <div
        style={{
          position: "fixed",
          left: "1.5rem",
          top: "64px",
          zIndex: "var(--panel-z)" as any,
        }}
      >
        <ContextPanel />
      </div>

      {/* ── Status bar (bottom-right, above timeline) ── */}
      <StatusBar />

      {/* ── Timeline (bottom) ── */}
      <TimelinePanel />

      {/* ── Selected marker info ── */}
      {selectedMarker && (
        <div
          style={{
            position: "fixed",
            top: "64px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 150,
            background: "rgba(10,14,20,0.92)",
            border: `1px solid ${selectedMarker.color}55`,
            borderLeft: `3px solid ${selectedMarker.color}`,
            borderRadius: "4px",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                fontWeight: 700,
                color: selectedMarker.color,
                letterSpacing: "0.04em",
              }}
            >
              {selectedMarker.label}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "#6b7a8d",
                marginTop: "2px",
              }}
            >
              {selectedMarker.subLabel}
            </div>
          </div>
          <button
            onClick={() => setSelectedMarker(null)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#3d4f63",
              fontSize: "16px",
              padding: "0 4px",
              lineHeight: 1,
              marginLeft: "8px",
            }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
