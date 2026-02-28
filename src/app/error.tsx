"use client";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[warspy] Unhandled error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg, #0a0e14)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "24px",
        fontFamily: "var(--font-mono, monospace)",
        padding: "2rem",
      }}
    >
      {/* Scanline overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 4px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: "520px" }}>
        {/* Blinker */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#e03e3e",
              boxShadow: "0 0 12px #e03e3e",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontSize: "9px",
              letterSpacing: "0.2em",
              color: "#e03e3e",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            System Fault Detected
          </span>
        </div>

        <div
          style={{
            fontSize: "clamp(36px, 8vw, 64px)",
            fontWeight: 700,
            color: "#e03e3e",
            lineHeight: 1,
            marginBottom: "12px",
            textShadow: "0 0 32px rgba(224,62,62,0.4)",
            letterSpacing: "-0.02em",
          }}
        >
          SYSTEM ERROR
        </div>

        <div
          style={{
            fontSize: "13px",
            color: "#6b7a8d",
            lineHeight: 1.6,
            marginBottom: "8px",
          }}
        >
          An unhandled exception interrupted the intelligence feed.
        </div>

        {error.message && (
          <div
            style={{
              margin: "16px 0",
              padding: "10px 14px",
              background: "rgba(224,62,62,0.06)",
              border: "1px solid rgba(224,62,62,0.2)",
              borderLeft: "3px solid #e03e3e",
              borderRadius: "3px",
              fontSize: "10px",
              color: "#94a3b8",
              textAlign: "left",
              wordBreak: "break-word",
            }}
          >
            {error.message}
          </div>
        )}

        {error.digest && (
          <div
            style={{
              fontSize: "9px",
              color: "#1e2a38",
              letterSpacing: "0.08em",
              marginBottom: "20px",
            }}
          >
            REF: {error.digest}
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{
              background: "rgba(224,62,62,0.1)",
              border: "1px solid rgba(224,62,62,0.3)",
              borderRadius: "3px",
              cursor: "pointer",
              padding: "10px 24px",
              fontSize: "10px",
              letterSpacing: "0.12em",
              color: "#e03e3e",
              textTransform: "uppercase",
              fontFamily: "inherit",
              transition: "background 0.12s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "rgba(224,62,62,0.18)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "rgba(224,62,62,0.1)")
            }
          >
            ↻ Retry
          </button>
          <a
            href="/"
            style={{
              background: "rgba(96,165,250,0.08)",
              border: "1px solid rgba(96,165,250,0.2)",
              borderRadius: "3px",
              padding: "10px 24px",
              fontSize: "10px",
              letterSpacing: "0.12em",
              color: "#60a5fa",
              textTransform: "uppercase",
              textDecoration: "none",
              fontFamily: "inherit",
            }}
          >
            ← Return to Globe
          </a>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}
