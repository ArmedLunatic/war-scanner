import { getServerClient } from "@/lib/supabase";
import { createHash } from "crypto";
import pLimit from "p-limit";

// ─── Language Detection (zero-dependency Unicode script check) ────────────────

const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g;
const HEBREW_RE = /[\u0590-\u05FF\uFB1D-\uFB4F]/g;
const CYRILLIC_RE = /[\u0400-\u04FF\u0500-\u052F]/g;
const FARSI_EXTRA_RE = /[\u06A9\u06AF\u06C0-\u06CF\u06D0-\u06D5]/g;

const THRESHOLD = 0.3; // >30% non-Latin characters triggers translation

export function needsTranslation(text: string): boolean {
  if (!text || text.length < 4) return false;
  const stripped = text.replace(/\s+/g, "");
  if (stripped.length === 0) return false;

  const arabicCount = (stripped.match(ARABIC_RE) || []).length;
  const hebrewCount = (stripped.match(HEBREW_RE) || []).length;
  const cyrillicCount = (stripped.match(CYRILLIC_RE) || []).length;
  const farsiCount = (stripped.match(FARSI_EXTRA_RE) || []).length;

  const nonLatinCount = arabicCount + hebrewCount + cyrillicCount + farsiCount;
  return nonLatinCount / stripped.length > THRESHOLD;
}

function detectLang(text: string): string {
  const stripped = text.replace(/\s+/g, "");
  const arabic = (stripped.match(ARABIC_RE) || []).length;
  const hebrew = (stripped.match(HEBREW_RE) || []).length;
  const cyrillic = (stripped.match(CYRILLIC_RE) || []).length;

  if (hebrew > arabic && hebrew > cyrillic) return "he";
  if (cyrillic > arabic && cyrillic > hebrew) return "ru";
  return "ar"; // Arabic/Farsi default
}

// ─── Hashing ─────────────────────────────────────────────────────────────────

function hashText(text: string): string {
  return createHash("sha256").update(text.trim()).digest("hex");
}

// ─── Cache Layer (Supabase translation_cache) ────────────────────────────────

async function getCached(
  hashes: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (hashes.length === 0) return map;

  try {
    const supabase = getServerClient();
    // Supabase .in() supports up to 100 items; we chunk if needed
    for (let i = 0; i < hashes.length; i += 100) {
      const batch = hashes.slice(i, i + 100);
      const { data } = await supabase
        .from("translation_cache")
        .select("text_hash, translated_text")
        .in("text_hash", batch);

      if (data) {
        for (const row of data) {
          map.set(row.text_hash, row.translated_text);
        }
      }
    }
  } catch {
    // Cache miss on error — translate anyway
  }

  return map;
}

async function writeCache(
  entries: { hash: string; lang: string; translated: string }[],
): Promise<void> {
  if (entries.length === 0) return;

  try {
    const supabase = getServerClient();
    const rows = entries.map((e) => ({
      text_hash: e.hash,
      source_lang: e.lang,
      translated_text: e.translated,
    }));

    await supabase
      .from("translation_cache")
      .upsert(rows, { onConflict: "text_hash" });
  } catch {
    // Non-critical — cache write failure doesn't block pipeline
  }
}

// ─── Translation APIs ────────────────────────────────────────────────────────

const LINGVA_INSTANCES = [
  "lingva.ml",
  "lingva.thedaviddelta.com",
];

const REQUEST_TIMEOUT = 8000;

async function translateViaLingva(
  text: string,
  sourceLang: string,
): Promise<string | null> {
  const encoded = encodeURIComponent(text);

  for (const host of LINGVA_INSTANCES) {
    try {
      const url = `https://${host}/api/v1/${sourceLang}/en/${encoded}`;
      const res = await fetch(url, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT),
        headers: { "User-Agent": "warspy/1.0" },
      });

      if (!res.ok) continue;

      const json = await res.json();
      if (json.translation && typeof json.translation === "string") {
        return json.translation;
      }
    } catch {
      // Try next instance
    }
  }

  return null;
}

async function translateViaGoogle(
  text: string,
  sourceLang: string,
): Promise<string | null> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://translation.googleapis.com/language/translate/v2`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: "en",
        key: apiKey,
        format: "text",
      }),
    });

    if (!res.ok) return null;

    const json = await res.json();
    const translated =
      json?.data?.translations?.[0]?.translatedText;
    return typeof translated === "string" ? translated : null;
  } catch {
    return null;
  }
}

async function translateSingle(
  text: string,
  sourceLang: string,
): Promise<string> {
  // Try Google first if API key is set, then Lingva as fallback
  const googleResult = await translateViaGoogle(text, sourceLang);
  if (googleResult) return googleResult;

  const lingvaResult = await translateViaLingva(text, sourceLang);
  if (lingvaResult) return lingvaResult;

  // Graceful degradation: return original text
  return text;
}

// ─── Public API ──────────────────────────────────────────────────────────────

const limit = pLimit(5);

/**
 * Translate a single text string to English if it contains non-Latin script.
 * Returns the original text unchanged if no translation is needed or if translation fails.
 */
export async function translateText(text: string): Promise<string> {
  if (!needsTranslation(text)) return text;

  const hash = hashText(text);
  const cached = await getCached([hash]);
  if (cached.has(hash)) return cached.get(hash)!;

  const lang = detectLang(text);
  const translated = await translateSingle(text, lang);

  if (translated !== text) {
    await writeCache([{ hash, lang, translated }]);
  }

  return translated;
}

/**
 * Translate a batch of texts to English. Deduplicates, checks cache,
 * translates uncached via API (5 concurrent requests), writes cache.
 * Returns a Map<originalText, translatedText>.
 * Texts that don't need translation are mapped to themselves.
 */
export async function translateBatch(
  texts: string[],
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (texts.length === 0) return result;

  // Identify texts needing translation, dedup by hash
  const toTranslate = new Map<string, { text: string; lang: string }>();

  for (const text of texts) {
    if (!text || !needsTranslation(text)) {
      result.set(text, text);
      continue;
    }
    const hash = hashText(text);
    if (!toTranslate.has(hash)) {
      toTranslate.set(hash, { text, lang: detectLang(text) });
    }
  }

  if (toTranslate.size === 0) return result;

  // Check cache for all hashes at once
  const hashes = Array.from(toTranslate.keys());
  const cached = await getCached(hashes);

  // Separate cached vs uncached
  const uncached: { hash: string; text: string; lang: string }[] = [];

  for (const [hash, { text, lang }] of toTranslate) {
    if (cached.has(hash)) {
      result.set(text, cached.get(hash)!);
    } else {
      uncached.push({ hash, text, lang });
    }
  }

  if (uncached.length === 0) return result;

  // Translate uncached with concurrency limit
  const translations = await Promise.allSettled(
    uncached.map((item) =>
      limit(async () => {
        const translated = await translateSingle(item.text, item.lang);
        return { ...item, translated };
      }),
    ),
  );

  // Collect successful translations
  const cacheEntries: { hash: string; lang: string; translated: string }[] = [];

  for (const t of translations) {
    if (t.status === "fulfilled") {
      const { text, hash, lang, translated } = t.value;
      result.set(text, translated);
      if (translated !== text) {
        cacheEntries.push({ hash, lang, translated });
      }
    } else {
      // On failure, map text to itself (graceful degradation)
      // Find which item this corresponds to — allSettled preserves order
      const idx = translations.indexOf(t);
      if (idx >= 0 && idx < uncached.length) {
        result.set(uncached[idx].text, uncached[idx].text);
      }
    }
  }

  // Write all new translations to cache in one batch
  await writeCache(cacheEntries);

  return result;
}
