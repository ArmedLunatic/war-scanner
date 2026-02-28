import type { Metadata } from "next";
import Link from "next/link";
import { getServerClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Activity Heatmap — Warspy",
  description: "90-day severity and event density heatmap for the Israel-Iran conflict theater.",
};

export const revalidate = 600; // 10 min cache

interface DayData {
  date: string;
  count: number;
  avgScore: number;
  avgSeverity: number;
}

async function getHeatmapData(): Promise<DayData[]> {
  const supabase = getServerClient();
  const since = new Date();
  since.setDate(since.getDate() - 90);

  const { data } = await supabase
    .from("clusters")
    .select("score, severity, first_seen_at")
    .eq("is_active", true)
    .gte("first_seen_at", since.toISOString());

  const byDate = new Map<string, { scores: number[]; severities: number[] }>();
  for (const row of data ?? []) {
    const date = (row.first_seen_at as string).slice(0, 10);
    if (!byDate.has(date)) byDate.set(date, { scores: [], severities: [] });
    byDate.get(date)!.scores.push(row.score ?? 0);
    byDate.get(date)!.severities.push(row.severity ?? 0);
  }

  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const days: DayData[] = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const entry = byDate.get(date);
    if (entry?.scores.length) {
      days.push({ date, count: entry.scores.length, avgScore: Math.round(avg(entry.scores)), avgSeverity: Math.round(avg(entry.severities) * 10) / 10 });
    } else {
      days.push({ date, count: 0, avgScore: 0, avgSeverity: 0 });
    }
  }
  return days;
}

function intensityColor(count: number, maxCount: number): string {
  if (count === 0) return "rgba(30,42,56,0.4)";
  const t = Math.min(count / Math.max(maxCount, 1), 1);
  // Gradient: dark-blue → amber → red
  if (t < 0.33) {
    const a = t / 0.33;
    return `rgba(${Math.round(30 + a * 210)}, ${Math.round(42 + a * 119)}, ${Math.round(56 - a * 22)}, ${0.5 + a * 0.5})`;
  } else if (t < 0.66) {
    const a = (t - 0.33) / 0.33;
    return `rgba(${Math.round(240)}, ${Math.round(161 - a * 99)}, ${Math.round(34 - a * 34)}, 0.9)`;
  } else {
    const a = (t - 0.66) / 0.34;
    return `rgba(${Math.round(240 - a * 16)}, ${Math.round(62 - a * 30)}, ${Math.round(a * 10)}, ${0.9 + a * 0.1})`;
  }
}

export default async function HeatmapPage() {
  const days = await getHeatmapData();
  const maxCount = Math.max(...days.map((d) => d.count), 1);
  const totalEvents = days.reduce((a, d) => a + d.count, 0);
  const activeDays = days.filter((d) => d.count > 0).length;
  const peakDay = days.reduce((best, d) => d.count > best.count ? d : best, days[0]);
  const avgPerActive = activeDays > 0 ? Math.round(totalEvents / activeDays) : 0;

  // Group into weeks (columns of 7)
  const weeks: DayData[][] = [];
  // Pad start so first day lines up with its day-of-week
  const firstDate = new Date(days[0].date);
  const startPad = firstDate.getDay(); // 0=Sun
  const paddedDays: (DayData | null)[] = [
    ...Array(startPad).fill(null),
    ...days,
  ];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7) as DayData[]);
  }

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Month labels (show month name at start of each month)
  const monthLabels: { col: number; label: string }[] = [];
  weeks.forEach((week, col) => {
    const firstReal = week.find((d) => d !== null);
    if (firstReal) {
      const date = new Date(firstReal.date);
      if (date.getDate() <= 7) {
        monthLabels.push({
          col,
          label: date.toLocaleString("en-US", { month: "short" }),
        });
      }
    }
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: "64px", paddingBottom: "4rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2.5rem 1.5rem 0" }}>
        <Link
          href="/"
          style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.1em", color: "var(--text-muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "2rem" }}
        >
          ← Globe
        </Link>

        <h1 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, color: "#e2e8f0", marginBottom: "6px" }}>
          Conflict Activity Heatmap
        </h1>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: "2rem" }}>
          90-day event density · darker = more incidents
        </p>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px", marginBottom: "2rem" }}>
          {(
            [
              { label: "Total Events", value: totalEvents, color: "#60a5fa" },
              { label: "Active Days", value: `${activeDays}/90`, color: "#22c55e" },
              { label: "Avg / Active Day", value: avgPerActive, color: "#fbbf24" },
              { label: "Peak Day", value: peakDay.count > 0 ? `${peakDay.count} evt` : "—", color: "#e03e3e", sub: peakDay.count > 0 ? peakDay.date : "" },
            ] as { label: string; value: string | number; color: string; sub?: string }[]
          ).map((s) => (
            <div key={s.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "12px 14px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", letterSpacing: "0.12em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>{s.label}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
              {s.sub && <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "#3d4f63", marginTop: "3px" }}>{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.5rem", overflowX: "auto" }}>
          <div style={{ minWidth: "600px" }}>
            {/* Month labels */}
            <div style={{ display: "flex", marginBottom: "4px", paddingLeft: "28px", position: "relative", height: "16px" }}>
              {monthLabels.map(({ col, label }) => (
                <div
                  key={`${col}-${label}`}
                  style={{
                    position: "absolute",
                    left: `calc(28px + ${col * 13}px)`,
                    fontFamily: "var(--font-mono)",
                    fontSize: "8px",
                    color: "#3d4f63",
                    letterSpacing: "0.06em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0" }}>
              {/* Day-of-week labels */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginRight: "4px", paddingTop: "1px" }}>
                {dayLabels.map((d) => (
                  <div
                    key={d}
                    style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "#2d3f54", lineHeight: "11px", height: "11px", display: "flex", alignItems: "center" }}
                  >
                    {d[0]}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div style={{ display: "flex", gap: "2px" }}>
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {week.map((day, dIdx) => {
                      if (!day) {
                        return <div key={dIdx} style={{ width: "11px", height: "11px" }} />;
                      }
                      const bg = intensityColor(day.count, maxCount);
                      const fmt = new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                      return (
                        <div
                          key={dIdx}
                          title={`${fmt}: ${day.count} events, avg score ${day.avgScore}`}
                          style={{
                            width: "11px",
                            height: "11px",
                            borderRadius: "2px",
                            background: bg,
                            cursor: day.count > 0 ? "pointer" : "default",
                            border: day.count > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                            flexShrink: 0,
                          }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px", justifyContent: "flex-end" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "#2d3f54" }}>Less</span>
              {[0, 0.15, 0.35, 0.6, 0.85, 1.0].map((t) => (
                <div
                  key={t}
                  style={{
                    width: "11px",
                    height: "11px",
                    borderRadius: "2px",
                    background: t === 0 ? "rgba(30,42,56,0.4)" : intensityColor(Math.round(t * maxCount), maxCount),
                  }}
                />
              ))}
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "#2d3f54" }}>More</span>
            </div>
          </div>
        </div>

        {/* Recent hot days */}
        {activeDays > 0 && (
          <div style={{ marginTop: "1.5rem" }}>
            <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem" }}>
              Most Active Days
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {[...days]
                .filter((d) => d.count > 0)
                .sort((a, b) => b.count - a.count)
                .slice(0, 7)
                .map((d) => (
                  <div key={d.date} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "3px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", minWidth: "80px" }}>
                      {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <div style={{ flex: 1, height: "6px", background: "rgba(10,14,20,0.6)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${(d.count / maxCount) * 100}%`, height: "100%", background: intensityColor(d.count, maxCount), borderRadius: "3px" }} />
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, color: "#e03e3e", minWidth: "50px", textAlign: "right" }}>
                      {d.count} evt
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "#3d4f63", minWidth: "60px", textAlign: "right" }}>
                      score {d.avgScore}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
