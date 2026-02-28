interface ConfidenceBadgeProps {
  confidence: "HIGH" | "MED" | "LOW";
}

const CONFIG = {
  HIGH: { label: "High Confidence", classes: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  MED: { label: "Med Confidence", classes: "bg-amber-100 text-amber-800 border-amber-200" },
  LOW: { label: "Low Confidence", classes: "bg-red-100 text-red-800 border-red-200" },
};

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const { label, classes } = CONFIG[confidence] ?? CONFIG.LOW;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${classes}`}
    >
      {label}
    </span>
  );
}
