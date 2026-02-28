import { CATEGORY_LABELS } from "@/lib/constants";

interface CategoryTagProps {
  category: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  strike: "bg-orange-100 text-orange-800",
  clash: "bg-red-100 text-red-800",
  invasion: "bg-purple-100 text-purple-800",
  humanitarian: "bg-blue-100 text-blue-800",
  diplomacy: "bg-teal-100 text-teal-800",
  sanctions: "bg-yellow-100 text-yellow-800",
  other: "bg-gray-100 text-gray-700",
};

export function CategoryTag({ category }: CategoryTagProps) {
  const label = CATEGORY_LABELS[category] ?? category;
  const colors = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.other;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors}`}>
      {label}
    </span>
  );
}
