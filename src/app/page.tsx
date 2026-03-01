"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { LiveFeedPanel } from "@/components/panels/LiveFeedPanel";
import { SocialFeedPanel } from "@/components/panels/SocialFeedPanel";
import { ContextPanel } from "@/components/panels/ContextPanel";
import { TimelinePanel } from "@/components/panels/TimelinePanel";
import { BriefPanel } from "@/components/panels/BriefPanel";
import { EscalationPanel } from "@/components/panels/EscalationPanel";
import { StatusBar } from "@/components/nav/StatusBar";
import { IconClose } from "@/components/icons";
import { usePanels } from "@/lib/context/PanelContext";
import type { GlobeMarker } from "@/components/globe/globeData";
import WelcomeTour from "@/components/WelcomeTour";

const GlobeWrapper = dynamic(
  () => import("@/components/globe/GlobeWrapper"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#030508",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 0,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "1px solid rgba(96,165,250,0.2)",
              borderTop: "1px solid rgba(96,165,250,0.6)",
              borderRadius: "50%",
              margin: "0 auto 16px",
              animation: "spin 1s linear infinite",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.2em",
              color: "rgba(96,165,250,0.4)",
              textTransform: "uppercase",
            }}
          >
            Initializing Globe...
          </span>
        </div>
      </div>
    ),
  }
);

/** Closes any open panel when user taps backdrop on mobile */
function MobileBackdrop() {
  const { openPanels, closeAll } = usePanels();
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 769
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 769);
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!isMobile || openPanels.size === 0) return null;

  return <div className="panel-backdrop" onClick={closeAll} />;
}

export default function GlobePage() {
  const [selectedMarker, setSelectedMarker] = useState<GlobeMarker | null>(null);

  useEffect(() => {
    document.body.classList.add("body-globe-mode");
    return () => document.body.classList.remove("body-globe-mode");
  }, []);

  return (
    <>
      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Full-screen globe */}
      <div data-tour="step-globe" style={{ position: "fixed", inset: 0, zIndex: 0, background: "#030508" }}>
        <GlobeWrapper onMarkerClick={(m) => setSelectedMarker(m)} />
      </div>

      {/* Scanline atmosphere */}
      <div className="scanline-overlay" />

      {/* Mobile backdrop — closes panel on tap outside */}
      <MobileBackdrop />

      {/* ── Right side panels ── */}
      <div
        style={{
          position: "fixed",
          right: "1.5rem",
          top: "64px",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          maxHeight: "calc(100vh - 140px)",
          pointerEvents: "none",
        }}
      >
        <LiveFeedPanel />
        <SocialFeedPanel />
        <BriefPanel />
        <EscalationPanel />
      </div>

      {/* ── Left panel ── */}
      <div
        style={{
          position: "fixed",
          left: "1.5rem",
          top: "64px",
          zIndex: 100,
          pointerEvents: "none",
        }}
      >
        <ContextPanel />
      </div>

      {/* ── Status bar (desktop only) ── */}
      <StatusBar />

      {/* ── Timeline (bottom) ── */}
      <TimelinePanel />

      {/* ── Selected marker chip ── */}
      <AnimatePresence>
        {selectedMarker && (
          <div
            key="marker-chip-wrap"
            style={{
              position: "fixed",
              top: "64px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 150,
              maxWidth: "calc(100vw - 2rem)",
              width: "max-content",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              style={{
                background: "rgba(10,14,20,0.92)",
                border: `1px solid ${selectedMarker.color}44`,
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
                  padding: 0,
                  minWidth: "44px",
                  minHeight: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                  transition: "color 0.12s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#e2e8f0")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#3d4f63")}
                aria-label="Dismiss"
              >
                <IconClose size={16} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <WelcomeTour />
    </>
  );
}
