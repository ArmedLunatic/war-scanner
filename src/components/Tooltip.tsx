"use client";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

export function Tooltip({ text, children }: TooltipProps) {
  return (
    <span
      style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
      className="warspy-tooltip-wrap"
    >
      {children}
      <span
        className="warspy-tooltip"
        style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(10,14,20,0.95)",
          border: "1px solid rgba(96,165,250,0.25)",
          borderRadius: "4px",
          padding: "6px 10px",
          fontFamily: "var(--font-sans)",
          fontSize: "11px",
          fontWeight: 400,
          lineHeight: 1.4,
          letterSpacing: "0.01em",
          color: "#94a3b8",
          whiteSpace: "normal",
          maxWidth: "280px",
          width: "max-content",
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity 0.15s ease",
          zIndex: 300,
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "5px solid rgba(96,165,250,0.25)",
          }}
        />
        {text}
      </span>
    </span>
  );
}
