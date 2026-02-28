import pLimit from "p-limit";
import { fetchWithRetry } from "@/lib/utils/fetch";
import { getServerClient } from "@/lib/supabase";
import { INGEST_WINDOW_HOURS } from "@/lib/constants";

const GDELT_BASE = "https://api.gdeltproject.org/api/v2/doc/doc";
const CONCURRENCY = 2;
const DELAY_MS = 500;

const QUERIES = [
  "war OR airstrike OR missile OR drone OR clash OR invasion OR ceasefire OR sanctions OR artillery",
  '"Israel" "Iran"',
  "Ukraine Russia attack",
  "Sudan conflict humanitarian",
  "Houthis Yemen strike",
];

interface GdeltArticle {
  url: string;
  title: string;
  seendate: string;
  domain: string;
  sourcecountry?: string;
  socialimage?: string;
}

interface GdeltResponse {
  articles?: GdeltArticle[];
}

function gdeltDateParam(hoursAgo: number): string {
  const d = new Date(Date.now() - hoursAgo * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    "00"
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchQuery(
  query: string,
  startDatetime: string,
): Promise<GdeltArticle[]> {
  const params = new URLSearchParams({
    query,
    mode: "artlist",
    maxrecords: "250",
    format: "json",
    startdatetime: startDatetime,
    sort: "DateDesc",
  });

  const url = `${GDELT_BASE}?${params.toString()}`;
  const res = await fetchWithRetry(url, {}, 3, 15000);

  if (!res.ok) {
    console.warn(`GDELT query failed: ${res.status} for query "${query}"`);
    return [];
  }

  const text = await res.text();
  if (!text || text.trim() === "") return [];

  try {
    const data: GdeltResponse = JSON.parse(text);
    return data.articles ?? [];
  } catch {
    console.warn("GDELT JSON parse error");
    return [];
  }
}

export async function ingestGdelt(): Promise<{ inserted: number; skipped: number }> {
  const supabase = getServerClient();
  const limit = pLimit(CONCURRENCY);
  const startDatetime = gdeltDateParam(INGEST_WINDOW_HOURS);

  let inserted = 0;
  let skipped = 0;

  const tasks = QUERIES.map((query, i) =>
    limit(async () => {
      if (i > 0) await sleep(DELAY_MS);
      const articles = await fetchQuery(query, startDatetime);
      console.log(`  GDELT query ${i + 1}: ${articles.length} articles`);

      for (const article of articles) {
        if (!article.title?.trim() || !article.url) continue;

        const providerIdRaw = article.url;
        const publishedAt = article.seendate
          ? parseGdeltDate(article.seendate)
          : null;

        const { error } = await supabase.from("raw_items").insert({
          provider: "gdelt",
          provider_id: providerIdRaw,
          title: article.title.trim(),
          snippet: null,
          url: article.url,
          source_domain: article.domain ?? null,
          country: article.sourcecountry ?? null,
          lat: null,
          lon: null,
          published_at: publishedAt,
          payload: article as unknown as Record<string, unknown>,
        });

        if (error) {
          if (error.code === "23505") {
            skipped++;
          } else {
            console.error("GDELT insert error:", error.message);
          }
        } else {
          inserted++;
        }
      }
    }),
  );

  await Promise.all(tasks);
  return { inserted, skipped };
}

/** Parse GDELT date format: "20240115T120000Z" or "20240115120000" */
function parseGdeltDate(s: string): string | null {
  try {
    // Remove T and Z if present, normalise to YYYYMMDDHHMMSS
    const clean = s.replace(/[TZ]/g, "");
    if (clean.length < 14) return null;
    const year = clean.slice(0, 4);
    const month = clean.slice(4, 6);
    const day = clean.slice(6, 8);
    const hour = clean.slice(8, 10);
    const min = clean.slice(10, 12);
    const sec = clean.slice(12, 14);
    return `${year}-${month}-${day}T${hour}:${min}:${sec}Z`;
  } catch {
    return null;
  }
}
