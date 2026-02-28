"use client";
import { useRef } from "react";
import { CONFLICT_TIMELINE } from "@/lib/conflict/conflictTimeline";

export function TimelinePanel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 110,
        background: "rgba(3,5,8,0.88)",
        borderTop: "1px solid rgba(96,165,250,0.12)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Label */}
      <div
        style={{
          position: "absolute",
          left: "1rem",
          top: "50%",
          transform: "translateY(-50%)",
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#3d4f63",
          userSelect: "none",
          zIndex: 1,
        }}
      >
        Timeline
      </div>

      {/* Scrollable events */}
      <div
        ref={scrollRef}
        style={{
          overflowX: "auto",
          overflowY: "hidden",
          padding: "8px 7rem 8px 6rem",
          display: "flex",
          alignItems: "center",
          gap: "0",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          height: "56px",
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
                  width: "32px",
                  height: "1px",
                  background: "rgba(30,42,56,0.8)",
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
                gap: "3px",
                cursor: "default",
                flexShrink: 0,
                maxWidth: "90px",
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
                  boxShadow: `0 0 6px ${event.color}88`,
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
                  opacity: 0.8,
                  lineHeight: 1,
                }}
              >
                {event.year}
              </span>

              {/* Label */}
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "8px",
                  color: "#6b7a8d",
                  letterSpacing: "0.02em",
                  textAlign: "center",
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "88px",
                }}
              >
                {event.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
