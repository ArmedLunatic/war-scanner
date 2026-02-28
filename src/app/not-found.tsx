import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg, #0a0e14)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "20px",
        fontFamily: "var(--font-mono, monospace)",
        padding: "2rem",
      }}
    >
      {/* Scanline */}
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

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: "480px" }}>
        <div
          style={{
            fontSize: "9px",
            letterSpacing: "0.2em",
            color: "#3d4f63",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}
        >
          Signal Lost
        </div>

        <div
          style={{
            fontSize: "clamp(48px, 10vw, 80px)",
            fontWeight: 700,
            color: "#1e2a38",
            lineHeight: 1,
            marginBottom: "16px",
            letterSpacing: "-0.02em",
          }}
        >
          404
        </div>

        <div
          style={{
            fontSize: "13px",
            color: "#6b7a8d",
            lineHeight: 1.6,
            marginBottom: "28px",
          }}
        >
          No intelligence record found at this location.
          <br />
          The asset may have been redacted or never existed.
        </div>

        <Link
          href="/"
          style={{
            display: "inline-block",
            background: "rgba(96,165,250,0.08)",
            border: "1px solid rgba(96,165,250,0.2)",
            borderRadius: "3px",
            padding: "10px 28px",
            fontSize: "10px",
            letterSpacing: "0.12em",
            color: "#60a5fa",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          ← Return to Globe
        </Link>
      </div>
    </div>
  );
}
