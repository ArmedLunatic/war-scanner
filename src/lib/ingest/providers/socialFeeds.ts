import type { SocialPost } from "@/lib/types";

// Keywords for RSS/Google News filtering
// Includes Arabic, Hebrew, Russian, and Farsi variants to catch non-English posts
const KEYWORDS = [
  // English
  "israel", "iran", "idf", "irgc", "hezbollah", "hamas", "houthi",
  "gaza", "nuclear", "missile", "netanyahu", "tehran", "tel aviv",
  "beirut", "sanaa", "ballistic", "drone", "airstrike",
  // Arabic
  "\u0625\u0633\u0631\u0627\u0626\u064A\u0644",       // إسرائيل
  "\u0625\u064A\u0631\u0627\u0646",                     // إيران
  "\u063A\u0632\u0629",                                 // غزة
  "\u062D\u0645\u0627\u0633",                           // حماس
  "\u062D\u0632\u0628 \u0627\u0644\u0644\u0647",       // حزب الله
  "\u0627\u0644\u062D\u0648\u062B\u064A",               // الحوثي
  "\u0635\u0627\u0631\u0648\u062E",                     // صاروخ (missile)
  "\u0647\u062C\u0648\u0645",                           // هجوم (attack)
  "\u0646\u0648\u0648\u064A",                           // نووي (nuclear)
  "\u0637\u0647\u0631\u0627\u0646",                     // طهران (Tehran)
  // Hebrew
  "\u05D9\u05E9\u05E8\u05D0\u05DC",                     // ישראל
  "\u05D0\u05D9\u05E8\u05D0\u05DF",                     // איראן
  "\u05E2\u05D6\u05D4",                                 // עזה (Gaza)
  "\u05D7\u05DE\u05D0\u05E1",                           // חמאס
  "\u05D7\u05D9\u05D6\u05D1\u05D0\u05DC\u05D4",         // חיזבאלה
  "\u05E6\u05D4\u05F4\u05DC",                           // צה״ל (IDF)
  "\u05D8\u05D9\u05DC",                                 // טיל (missile)
  "\u05D2\u05E8\u05E2\u05D9\u05E0\u05D9",               // גרעיני (nuclear)
  // Russian
  "\u0418\u0437\u0440\u0430\u0438\u043B\u044C",         // Израиль
  "\u0418\u0440\u0430\u043D",                           // Иран
  "\u0413\u0430\u0437\u0430",                           // Газа
  "\u0425\u0430\u043C\u0430\u0441",                     // Хамас
  "\u0425\u0435\u0437\u0431\u043E\u043B\u043B\u0430",   // Хезболла
  "\u0440\u0430\u043A\u0435\u0442\u0430",               // ракета (missile)
  "\u044F\u0434\u0435\u0440\u043D\u044B\u0439",         // ядерный (nuclear)
  "\u0422\u0435\u0433\u0435\u0440\u0430\u043D",         // Тегеран (Tehran)
  // Farsi
  "\u0627\u0633\u0631\u0627\u0626\u06CC\u0644",         // اسرائیل (Israel, Farsi)
  "\u0627\u06CC\u0631\u0627\u0646",                     // ایران (Iran, Farsi)
  "\u0645\u0648\u0634\u06A9",                           // موشک (missile, Farsi)
  "\u0647\u0633\u062A\u0647\u200C\u0627\u06CC",         // هسته‌ای (nuclear, Farsi)
];

function matchesKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return KEYWORDS.some((kw) => lower.includes(kw));
}

// ─── A. RSS XML Parser ────────────────────────────────────────────────────────

function parseRssItems(xml: string, sourceName: string, sourceTag: string): SocialPost[] {
  const items: SocialPost[] = [];
  // Extract <item> blocks
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = extractTag(block, "title") ?? "";
    const link = extractTag(block, "link") ?? extractTag(block, "guid") ?? "";
    const pubDate = extractTag(block, "pubDate") ?? extractTag(block, "dc:date") ?? "";

    const cleanTitle = stripCdata(title).trim();
    if (!cleanTitle || !matchesKeywords(cleanTitle)) continue;

    const publishedAt = pubDate
      ? new Date(pubDate.trim()).toISOString()
      : new Date().toISOString();

    items.push({
      id: `rss-${sourceTag}-${Buffer.from(cleanTitle).toString("base64").slice(0, 16)}`,
      text: cleanTitle,
      source: sourceName,
      sourceTag,
      url: stripCdata(link).trim(),
      publishedAt,
      type: "rss",
    });
  }
  return items;
}

function extractTag(xml: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = re.exec(xml);
  return m ? m[1] : null;
}

function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "").trim();
}

// ─── B. RSS Sources ───────────────────────────────────────────────────────────

const RSS_SOURCES = [
  { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", tag: "AJ" },
  { name: "BBC Middle East", url: "http://feeds.bbci.co.uk/news/world/middle_east/rss.xml", tag: "BBC" },
  { name: "Jerusalem Post", url: "https://www.jpost.com/Rss/RssFeedsHeadlines.aspx", tag: "JPost" },
  { name: "Iran International", url: "https://www.iranintl.com/en/rss", tag: "IranIntl" },
  { name: "Reuters World", url: "https://feeds.reuters.com/Reuters/worldNews", tag: "Reuters" },
];

async function fetchRssSources(): Promise<SocialPost[]> {
  const results = await Promise.allSettled(
    RSS_SOURCES.map(async (src) => {
      const res = await fetch(src.url, {
        headers: { "User-Agent": "warspy/1.0" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return [];
      const xml = await res.text();
      return parseRssItems(xml, src.name, src.tag).slice(0, 8);
    })
  );
  return results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => (r as PromiseFulfilledResult<SocialPost[]>).value);
}

// ─── C. Google News RSS ───────────────────────────────────────────────────────

async function fetchGoogleNews(): Promise<SocialPost[]> {
  try {
    const url =
      "https://news.google.com/rss/search?q=Israel+Iran+war+military&hl=en-US&gl=US&ceid=US:en";
    const res = await fetch(url, {
      headers: { "User-Agent": "warspy/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRssItems(xml, "Google News", "GNews").slice(0, 10);
  } catch {
    return [];
  }
}

// ─── D. Reddit JSON ───────────────────────────────────────────────────────────

const REDDIT_SOURCES = [
  {
    url: "https://www.reddit.com/r/worldnews/search.json?q=israel+iran&sort=new&limit=10&restrict_sr=1",
    tag: "r/worldnews",
  },
  {
    url: "https://www.reddit.com/r/geopolitics/new.json?limit=10",
    tag: "r/geopolitics",
  },
  {
    url: "https://www.reddit.com/r/MiddleEastNews/new.json?limit=10",
    tag: "r/MENNews",
  },
];

async function fetchReddit(): Promise<SocialPost[]> {
  const results = await Promise.allSettled(
    REDDIT_SOURCES.map(async (src) => {
      const res = await fetch(src.url, {
        headers: {
          "User-Agent": "warspy/1.0 (conflict monitor)",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return [];
      const json = await res.json();
      const children = json?.data?.children ?? [];
      const posts: SocialPost[] = [];
      for (const child of children) {
        const d = child.data;
        if (!d || d.is_self === false || !matchesKeywords(d.title ?? "")) {
          // For non-self posts still check title
          if (!d || !matchesKeywords(d.title ?? "")) continue;
        }
        posts.push({
          id: `reddit-${d.id}`,
          text: d.title,
          source: src.tag,
          sourceTag: src.tag,
          url: `https://reddit.com${d.permalink}`,
          publishedAt: new Date(d.created_utc * 1000).toISOString(),
          score: d.score,
          type: "reddit",
        });
      }
      return posts.slice(0, 5);
    })
  );
  return results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => (r as PromiseFulfilledResult<SocialPost[]>).value);
}

// ─── D2. Telegram Channels via RSSHub ────────────────────────────────────────
// Public Telegram channels exposed as RSS through rsshub.app (open-source, free)

const TELEGRAM_CHANNELS = [
  { channel: "israelwarroom",     tag: "ILWarRoom",  name: "Israel War Room"    },
  { channel: "intelslava",        tag: "IntelSlava", name: "Intel Slava Z"      },
  { channel: "MiddleEastSpectator", tag: "MESpect", name: "ME Spectator"        },
  { channel: "OsintDefender",     tag: "OSINT",      name: "OSINT Defender"     },
];

async function fetchTelegramChannels(): Promise<SocialPost[]> {
  const results = await Promise.allSettled(
    TELEGRAM_CHANNELS.map(async (ch) => {
      const url = `https://rsshub.app/telegram/channel/${ch.channel}`;
      const res = await fetch(url, {
        headers: { "User-Agent": "warspy/1.0" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return [];
      const xml = await res.text();
      return parseRssItems(xml, ch.name, ch.tag)
        .slice(0, 5)
        .map((p) => ({ ...p, type: "rss" as const }));
    })
  );
  return results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => (r as PromiseFulfilledResult<SocialPost[]>).value);
}

// ─── E. NewsAPI (optional) ────────────────────────────────────────────────────

async function fetchNewsApi(): Promise<SocialPost[]> {
  const key = process.env.NEWSAPI_KEY;
  if (!key) return [];
  try {
    const url =
      `https://newsapi.org/v2/everything?q=Israel+Iran&language=en&sortBy=publishedAt&pageSize=10`;
    const res = await fetch(url, {
      headers: { Authorization: key },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.articles ?? []).map((a: any) => ({
      id: `news-${Buffer.from(a.url ?? a.title).toString("base64").slice(0, 16)}`,
      text: a.title,
      source: a.source?.name ?? "NewsAPI",
      sourceTag: (a.source?.name ?? "NEWS").slice(0, 8),
      url: a.url,
      publishedAt: a.publishedAt ?? new Date().toISOString(),
      type: "news" as const,
    }));
  } catch {
    return [];
  }
}

// ─── F. X / Twitter (optional) ───────────────────────────────────────────────

async function fetchTwitter(): Promise<SocialPost[]> {
  const token = process.env.TWITTER_BEARER_TOKEN;
  if (!token) return [];
  try {
    const query = encodeURIComponent(
      "(Israel Iran) OR (IDF IRGC) OR (Hezbollah Israel) -is:retweet lang:en"
    );
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=10&tweet.fields=created_at,public_metrics`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []).map((t: any) => ({
      id: `twitter-${t.id}`,
      text: t.text,
      source: "X (Twitter)",
      sourceTag: "X",
      url: `https://x.com/i/web/status/${t.id}`,
      publishedAt: t.created_at ?? new Date().toISOString(),
      score: t.public_metrics?.like_count,
      type: "twitter" as const,
    }));
  } catch {
    return [];
  }
}

// ─── Aggregate ────────────────────────────────────────────────────────────────

export interface SocialFetchResult {
  posts: SocialPost[];
  activeSources: string[];
}

export async function fetchAllSocialSources(): Promise<SocialFetchResult> {
  const [rss, google, reddit, telegram, newsapi, twitter] = await Promise.all([
    fetchRssSources().catch(() => [] as SocialPost[]),
    fetchGoogleNews().catch(() => [] as SocialPost[]),
    fetchReddit().catch(() => [] as SocialPost[]),
    fetchTelegramChannels().catch(() => [] as SocialPost[]),
    fetchNewsApi().catch(() => [] as SocialPost[]),
    fetchTwitter().catch(() => [] as SocialPost[]),
  ]);

  const all = [...rss, ...google, ...reddit, ...telegram, ...newsapi, ...twitter];

  // Deduplicate by URL
  const seen = new Set<string>();
  const deduped = all.filter((p) => {
    if (seen.has(p.url)) return false;
    seen.add(p.url);
    return true;
  });

  // Sort by recency
  deduped.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const activeSources = Array.from(
    new Set(deduped.map((p) => p.sourceTag))
  );

  return { posts: deduped.slice(0, 30), activeSources };
}
