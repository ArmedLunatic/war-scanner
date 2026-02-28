import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const title = searchParams.get("title") ?? "Warspy — Conflict Intelligence";
  const sub = searchParams.get("sub") ?? "Real-time Israel–Iran conflict monitor";
  const category = searchParams.get("category") ?? "";
  const confidence = searchParams.get("confidence") ?? "";
  const score = searchParams.get("score") ?? "";
  const country = searchParams.get("country") ?? "";

  const categoryColors: Record<string, string> = {
    strike: "#e03e3e",
    political: "#60a5fa",
    nuclear: "#f97316",
    humanitarian: "#22c55e",
    military: "#e03e3e",
    diplomatic: "#a78bfa",
    economic: "#fbbf24",
  };
  const catColor = categoryColors[category.toLowerCase()] ?? "#60a5fa";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#030508",
          display: "flex",
          flexDirection: "column",
          fontFamily: "monospace",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(30,42,56,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(30,42,56,0.3) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Glow blob */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${catColor}18 0%, transparent 70%)`,
          }}
        />

        {/* Top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: `linear-gradient(to right, transparent, ${catColor}, transparent)`,
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "52px 64px",
            flex: 1,
            position: "relative",
          }}
        >
          {/* Logo row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#e03e3e",
                boxShadow: "0 0 12px #e03e3e",
              }}
            />
            <span
              style={{
                fontSize: "12px",
                letterSpacing: "0.25em",
                color: "#e2e8f0",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              WARSPY
            </span>
            <div style={{ width: "1px", height: "14px", background: "#1e2a38", margin: "0 8px" }} />
            <span style={{ fontSize: "10px", color: "#3d4f63", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              CONFLICT INTELLIGENCE
            </span>
          </div>

          {/* Tags */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            {category && (
              <div
                style={{
                  background: `${catColor}18`,
                  border: `1px solid ${catColor}44`,
                  borderRadius: "3px",
                  padding: "4px 10px",
                  fontSize: "10px",
                  letterSpacing: "0.15em",
                  color: catColor,
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                {category}
              </div>
            )}
            {confidence && (
              <div
                style={{
                  background: "rgba(30,42,56,0.8)",
                  border: "1px solid rgba(30,42,56,0.9)",
                  borderRadius: "3px",
                  padding: "4px 10px",
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  color: "#6b7a8d",
                  textTransform: "uppercase",
                }}
              >
                {confidence} CONFIDENCE
              </div>
            )}
            {country && (
              <div
                style={{
                  background: "rgba(30,42,56,0.8)",
                  border: "1px solid rgba(30,42,56,0.9)",
                  borderRadius: "3px",
                  padding: "4px 10px",
                  fontSize: "10px",
                  color: "#3d4f63",
                  letterSpacing: "0.08em",
                }}
              >
                {country}
              </div>
            )}
          </div>

          {/* Main title */}
          <div
            style={{
              fontSize: title.length > 80 ? "26px" : title.length > 50 ? "32px" : "38px",
              fontWeight: 700,
              color: "#e2e8f0",
              lineHeight: 1.3,
              maxWidth: "900px",
              marginBottom: "20px",
              letterSpacing: "-0.01em",
            }}
          >
            {title.length > 120 ? title.slice(0, 117) + "..." : title}
          </div>

          {/* Sub */}
          <div
            style={{
              fontSize: "14px",
              color: "#6b7a8d",
              letterSpacing: "0.04em",
              maxWidth: "700px",
              lineHeight: 1.5,
            }}
          >
            {sub}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 64px",
            borderTop: "1px solid rgba(30,42,56,0.8)",
            background: "rgba(10,14,20,0.6)",
          }}
        >
          <span style={{ fontSize: "10px", color: "#2d3f54", letterSpacing: "0.1em" }}>
            warspy.vercel.app
          </span>
          {score && (
            <span style={{ fontSize: "10px", color: "#3d4f63", letterSpacing: "0.08em" }}>
              SCORE {score}
            </span>
          )}
          <span style={{ fontSize: "10px", color: "#2d3f54", letterSpacing: "0.1em" }}>
            REAL-TIME CONFLICT MONITOR
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
