"use client";

interface Props {
  rows?: number;
}

export function PanelSkeleton({ rows = 4 }: Props) {
  return (
    <div style={{ padding: "4px 0" }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid rgba(30,42,56,0.4)",
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <div
            className="skeleton-pulse"
            style={{
              width: "3px",
              height: "28px",
              borderRadius: "2px",
              background: "rgba(30,42,56,0.6)",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            <div
              className="skeleton-pulse"
              style={{
                height: "8px",
                borderRadius: "2px",
                background: "rgba(30,42,56,0.5)",
                width: `${60 + (i % 3) * 12}%`,
              }}
            />
            <div
              className="skeleton-pulse"
              style={{
                height: "6px",
                borderRadius: "2px",
                background: "rgba(30,42,56,0.3)",
                width: `${35 + (i % 2) * 15}%`,
              }}
            />
          </div>
          <div
            className="skeleton-pulse"
            style={{
              width: "30px",
              height: "8px",
              borderRadius: "2px",
              background: "rgba(30,42,56,0.4)",
              flexShrink: 0,
            }}
          />
        </div>
      ))}
    </div>
  );
}
