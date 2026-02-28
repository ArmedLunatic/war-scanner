"use client";
import { useEffect, useState } from "react";
import type { StatusResponse } from "@/lib/types";

export function StatusBar() {
  const [status, setStatus] = useState<StatusResponse | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/status");
        if (res.ok) setStatus(await res.json());
      } catch {
        // noop
      }
    }
    fetchStatus();
    const id = setInterval(fetchStatus, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!status) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "62px", // above timeline
        right: "1.5rem",
        zIndex: 150,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontFamily: "var(--font-mono)",
        fontSize: "9px",
        letterSpacing: "0.08em",
        color: "#3d4f63",
        background: "rgba(3,5,8,0.7)",
        border: "1px solid rgba(30,42,56,0.6)",
        borderRadius: "3px",
        padding: "4px 8px",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: status.ok ? "#22c55e" : "#e03e3e",
          flexShrink: 0,
        }}
      />
      <span>{status.totalClusters} events</span>
      <span style={{ color: "#1e2a38" }}>·</span>
      <span>{status.totalRawItems} raw</span>
    </div>
  );
}
