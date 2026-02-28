import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getServerClient } from "@/lib/supabase";

export interface EscalationPoint {
  date: string;    // YYYY-MM-DD
  score: number;   // avg score for that day
  count: number;   // event count
  severity: number; // avg severity
}

const getEscalationData = unstable_cache(
  async (): Promise<{ points: EscalationPoint[]; generatedAt: string }> => {
    const supabase = getServerClient();

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const { data, error } = await supabase
      .from("clusters")
      .select("score, severity, first_seen_at")
      .eq("is_active", true)
      .gte("first_seen_at", since.toISOString())
      .order("first_seen_at", { ascending: true });

    if (error) throw new Error("DB error");

    // Group by calendar date
    const byDate = new Map<string, { scores: number[]; severities: number[] }>();
    for (const row of data ?? []) {
      const date = (row.first_seen_at as string).slice(0, 10);
      if (!byDate.has(date)) byDate.set(date, { scores: [], severities: [] });
      byDate.get(date)!.scores.push(row.score ?? 0);
      byDate.get(date)!.severities.push(row.severity ?? 0);
    }

    const avg = (arr: number[]) =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    // Build full 30-day series (fill gaps with 0)
    const points: EscalationPoint[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const date = d.toISOString().slice(0, 10);
      const entry = byDate.get(date);
      if (entry && entry.scores.length > 0) {
        points.push({
          date,
          score: Math.round(avg(entry.scores)),
          count: entry.scores.length,
          severity: Math.round(avg(entry.severities) * 10) / 10,
        });
      } else {
        points.push({ date, score: 0, count: 0, severity: 0 });
      }
    }

    return { points, generatedAt: new Date().toISOString() };
  },
  ["escalation-data"],
  { revalidate: 600 }, // 10 min
);

export async function GET() {
  try {
    const result = await getEscalationData();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
