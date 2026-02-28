"use client";
import { CONFLICT_TIMELINE } from "@/lib/conflict/conflictTimeline";

export function TimelinePanel() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 110,
        background: "rgba(3,5,8,0.90)",
        borderTop: "1px solid rgba(96,165,250,0.1)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        // iOS safe area
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Label — desktop only */}
      <div
        className="desktop-only"
        style={{
          position: "absolute",
          left: "1rem",
          top: "50%",
          transform: "translateY(-50%)",
          fontFamily: "var(--font-mono)",
          fontSize: "8px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#3d4f63",
          userSelect: "none",
          zIndex: 1,
          pointerEvents: "none",
        }}
      >
        Timeline
      </div>

      {/* Scrollable events */}
      <div
        style={{
          overflowX: "auto",
          overflowY: "hidden",
          padding: "6px 1rem 6px 5.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          height: "52px",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch" as any,
        }}
      >
        {CONFLICT_TIMELINE.map((event, i) => (
          <div
            key={event.date}
            style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
          >
            {/* Connector line */}
            {i > 0 && (
              <div
                style={{
                  width: "28px",
                  height: "1px",
                  background: "rgba(30,42,56,0.9)",
                  flexShrink: 0,
                }}
              />
            )}

            {/* Event node */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                flexShrink: 0,
                width: "76px",
                scrollSnapAlign: "center",
                padding: "0 4px",
              }}
              title={event.description}
            >
              {/* Dot */}
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: event.color,
                  boxShadow: `0 0 5px ${event.color}88`,
                  flexShrink: 0,
                }}
              />

              {/* Year */}
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "8px",
                  color: event.color,
                  letterSpacing: "0.04em",
                  opacity: 0.85,
                  lineHeight: 1,
                }}
              >
                {event.year}
              </span>

              {/* Label */}
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "7px",
                  color: "#6b7a8d",
                  letterSpacing: "0.01em",
                  textAlign: "center",
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "72px",
                }}
              >
                {event.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Hide scrollbar via CSS */}
      <style>{`.timeline-scroll::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}
