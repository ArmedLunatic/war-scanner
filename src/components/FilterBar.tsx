"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { CATEGORY_LABELS } from "@/lib/constants";

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.delete("page"); // reset page on filter change
      return params.toString();
    },
    [searchParams],
  );

  const handleChange = (name: string, value: string) => {
    router.push(`${pathname}?${createQueryString(name, value)}`);
  };

  const current = {
    category: searchParams.get("category") ?? "",
    confidence: searchParams.get("confidence") ?? "",
    country: searchParams.get("country") ?? "",
  };

  const selectStyle: React.CSSProperties = {
    background: "var(--bg)",
    border: "1px solid var(--border)",
    color: "var(--text-secondary)",
    borderRadius: "var(--radius)",
    padding: "5px 8px",
    fontSize: "11px",
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.04em",
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    paddingRight: "24px",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236b7a8d'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 8px center",
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
      <span
        style={{
          fontSize: "10px",
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-dim)",
        }}
      >
        Filter
      </span>

      {/* Country */}
      <input
        type="text"
        placeholder="Country..."
        value={current.country}
        onChange={(e) => handleChange("country", e.target.value)}
        className="input-dark"
        style={{ width: "120px" }}
      />

      {/* Category */}
      <select
        value={current.category}
        onChange={(e) => handleChange("category", e.target.value)}
        style={selectStyle}
      >
        <option value="">All categories</option>
        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {/* Confidence */}
      <select
        value={current.confidence}
        onChange={(e) => handleChange("confidence", e.target.value)}
        style={selectStyle}
      >
        <option value="">All confidence</option>
        <option value="HIGH">High</option>
        <option value="MED">Medium</option>
        <option value="LOW">Low</option>
      </select>

      {/* Clear */}
      {(current.category || current.confidence || current.country) && (
        <button
          onClick={() => router.push(pathname)}
          style={{
            background: "none",
            border: "none",
            fontSize: "10px",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            cursor: "pointer",
            textDecoration: "underline",
            padding: "5px 0",
          }}
        >
          Clear
        </button>
      )}
    </div>
  );
}
