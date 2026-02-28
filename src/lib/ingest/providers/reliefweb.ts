import { fetchWithRetry } from "@/lib/utils/fetch";
import { getServerClient } from "@/lib/supabase";
import { stripHtml } from "@/lib/utils/text";

const RELIEFWEB_BASE = "https://api.reliefweb.int/v1/reports";
const PAGE_SIZE = 100;

interface ReliefWebReport {
  id: number;
  fields: {
    title: string;
    "body-html"?: string;
    date?: { created?: string };
    url?: string;
    source?: Array<{ name: string; homepage?: string }>;
    country?: Array<{ name: string; iso3?: string }>;
  };
}

interface ReliefWebResponse {
  data?: ReliefWebReport[];
  totalCount?: number;
}

export async function ingestReliefWeb(): Promise<{ inserted: number; skipped: number }> {
  const supabase = getServerClient();
  const appname = process.env.RELIEFWEB_APPNAME ?? "warspy/1.0";

  let inserted = 0;
  let skipped = 0;

  const requestBody = {
    filter: {
      operator: "AND",
      conditions: [
        {
          field: "theme.name",
          value: ["Security", "Peacekeeping and Peacebuilding", "Conflict and Violence"],
        },
      ],
    },
    fields: {
      include: ["title", "body-html", "date", "url", "source", "country", "file"],
    },
    sort: ["date:desc"],
    limit: PAGE_SIZE,
    offset: 0,
  };

  const url = `${RELIEFWEB_BASE}?appname=${encodeURIComponent(appname)}`;
  const res = await fetchWithRetry(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    },
    3,
    15000,
  );

  if (!res.ok) {
    console.warn(`ReliefWeb API failed: ${res.status}`);
    return { inserted, skipped };
  }

  const data: ReliefWebResponse = await res.json();
  const reports = data.data ?? [];
  console.log(`  ReliefWeb: ${reports.length} reports`);

  for (const report of reports) {
    const f = report.fields;
    if (!f.title?.trim()) continue;

    const rawSnippet = f["body-html"] ? stripHtml(f["body-html"]).slice(0, 500) : null;
    const publishedAt = f.date?.created ?? null;
    const sourceDomain = f.source?.[0]?.homepage
      ? extractDomain(f.source[0].homepage)
      : "reliefweb.int";
    const country = f.country?.[0]?.name ?? null;
    const reportUrl = f.url ?? `https://reliefweb.int/report/${report.id}`;

    const { error } = await supabase.from("raw_items").insert({
      provider: "reliefweb",
      provider_id: String(report.id),
      title: f.title.trim(),
      snippet: rawSnippet,
      url: reportUrl,
      source_domain: sourceDomain,
      country,
      lat: null,
      lon: null,
      published_at: publishedAt,
      payload: {
        id: report.id,
        source: f.source,
        country: f.country,
      } as Record<string, unknown>,
    });

    if (error) {
      if (error.code === "23505") {
        skipped++;
      } else {
        console.error("ReliefWeb insert error:", error.message);
      }
    } else {
      inserted++;
    }
  }

  return { inserted, skipped };
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
