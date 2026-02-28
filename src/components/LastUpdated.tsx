"use client";

import { useEffect, useState } from "react";

interface LastUpdatedProps {
  generatedAt: string;
}

function formatRelative(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export function LastUpdated({ generatedAt }: LastUpdatedProps) {
  const [relative, setRelative] = useState(formatRelative(generatedAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setRelative(formatRelative(generatedAt));
    }, 30000);
    return () => clearInterval(interval);
  }, [generatedAt]);

  return (
    <p className="text-sm text-gray-500">
      Feed updated{" "}
      <time
        dateTime={generatedAt}
        title={new Date(generatedAt).toLocaleString()}
        className="font-medium text-gray-700"
      >
        {relative}
      </time>
    </p>
  );
}
