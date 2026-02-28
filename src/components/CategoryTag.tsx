import { CATEGORY_LABELS } from "@/lib/constants";

interface CategoryTagProps {
  category: string;
}

const CATEGORY_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  strike:       { bg: "rgba(249,115,22,0.1)",  color: "#fb923c", border: "rgba(249,115,22,0.3)" },
  clash:        { bg: "rgba(224,62,62,0.1)",   color: "#f87171", border: "rgba(224,62,62,0.3)" },
  invasion:     { bg: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "rgba(167,139,250,0.3)" },
  humanitarian: { bg: "rgba(96,165,250,0.1)",  color: "#60a5fa", border: "rgba(96,165,250,0.3)" },
  diplomacy:    { bg: "rgba(45,212,191,0.1)",  color: "#2dd4bf", border: "rgba(45,212,191,0.3)" },
  sanctions:    { bg: "rgba(250,204,21,0.1)",  color: "#fbbf24", border: "rgba(250,204,21,0.3)" },
  other:        { bg: "rgba(107,122,141,0.1)", color: "#6b7a8d", border: "rgba(107,122,141,0.3)" },
};

export function CategoryTag({ category }: CategoryTagProps) {
  const label = CATEGORY_LABELS[category] ?? category;
  const s = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.other;
  return (
    <span
      className="tag-mono"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {label}
    </span>
  );
}
