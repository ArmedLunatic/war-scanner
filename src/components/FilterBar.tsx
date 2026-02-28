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

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <span className="text-sm font-medium text-gray-700">Filter:</span>

      {/* Country */}
      <input
        type="text"
        placeholder="Country..."
        value={current.country}
        onChange={(e) => handleChange("country", e.target.value)}
        className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
      />

      {/* Category */}
      <select
        value={current.category}
        onChange={(e) => handleChange("category", e.target.value)}
        className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
