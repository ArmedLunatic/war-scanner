interface ConfidenceBadgeProps {
  confidence: "HIGH" | "MED" | "LOW";
}

const CONFIG = {
  HIGH: { label: "HIGH", bg: "rgba(34,197,94,0.1)",  color: "#22c55e", border: "rgba(34,197,94,0.3)" },
  MED:  { label: "MED",  bg: "rgba(217,119,6,0.1)",  color: "#d97706", border: "rgba(217,119,6,0.3)" },
  LOW:  { label: "LOW",  bg: "rgba(224,62,62,0.1)",  color: "#e03e3e", border: "rgba(224,62,62,0.3)" },
};

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const c = CONFIG[confidence] ?? CONFIG.LOW;
  return (
    <span
      className="tag-mono"
      style={{ background: c.bg, color: c.color, borderColor: c.border }}
    >
      {c.label}
    </span>
  );
}
