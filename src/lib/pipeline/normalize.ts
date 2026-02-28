import { getServerClient } from "@/lib/supabase";
import { CATEGORY_KEYWORDS, ACTOR_DICT, INGEST_WINDOW_HOURS } from "@/lib/constants";
import { extractKeywords, extractActors } from "@/lib/utils/text";
import type { RawItem } from "@/lib/types";

const CHUNK_SIZE = 50;

function classifyCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [cat, terms] of Object.entries(CATEGORY_KEYWORDS)) {
    if (terms.some((t) => lower.includes(t))) return cat;
  }
  return "other";
}

export async function normalizeNewItems(): Promise<number> {
  const supabase = getServerClient();

  // Find raw_items within the ingest window that don't yet have an event_candidate
  const windowStart = new Date(
    Date.now() - INGEST_WINDOW_HOURS * 3600 * 1000,
  ).toISOString();

  const { data: rawItems, error } = await supabase
    .from("raw_items")
    .select("*")
    .gte("fetched_at", windowStart)
    .order("fetched_at", { ascending: false })
    .limit(500);

  if (error) throw new Error(`normalizeNewItems query: ${error.message}`);
  if (!rawItems || rawItems.length === 0) return 0;

  // Get IDs already in event_candidates
  const rawIds = rawItems.map((r: RawItem) => r.id);
  const { data: existing } = await supabase
    .from("event_candidates")
    .select("raw_item_id")
    .in("raw_item_id", rawIds);

  const existingIds = new Set((existing ?? []).map((e: { raw_item_id: string }) => e.raw_item_id));
  const toNormalize = (rawItems as RawItem[]).filter((r) => !existingIds.has(r.id));

  if (toNormalize.length === 0) return 0;

  let normalized = 0;

  // Process in chunks
  for (let i = 0; i < toNormalize.length; i += CHUNK_SIZE) {
    const chunk = toNormalize.slice(i, i + CHUNK_SIZE);

    const candidates = chunk.map((raw) => {
      const fullText = [raw.title, raw.snippet].filter(Boolean).join(" ");
      const category = classifyCategory(fullText);
      const keywords = extractKeywords(fullText, 20);
      const actors = extractActors(fullText, ACTOR_DICT);

      return {
        raw_item_id: raw.id,
        title: raw.title,
        snippet: raw.snippet ?? null,
        url: raw.url,
        source_domain: raw.source_domain ?? null,
        country: raw.country ?? null,
        lat: raw.lat ?? null,
        lon: raw.lon ?? null,
        category,
        keywords,
        actors,
        happened_at: raw.published_at ?? null,
        reported_at: raw.fetched_at,
      };
    });

    const { error: insertErr } = await supabase
      .from("event_candidates")
      .insert(candidates);

    if (insertErr) {
      // May have partial conflicts — try one by one on conflict
      for (const candidate of candidates) {
        const { error: e } = await supabase
          .from("event_candidates")
          .insert(candidate);
        if (!e) normalized++;
      }
    } else {
      normalized += candidates.length;
    }
  }

  return normalized;
}
