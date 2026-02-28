import levenshtein from "fast-levenshtein";
import { STOPWORDS, ACTOR_DICT } from "@/lib/constants";

/** Lowercase, strip punctuation, split on whitespace, remove stopwords */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/** Jaccard similarity: |A ∩ B| / |A ∪ B| */
export function jaccardSim(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const t of setA) if (setB.has(t)) intersection++;
  const union = setA.size + setB.size - intersection;
  return intersection / union;
}

/** Levenshtein similarity: 1 - editDistance / maxLen */
export function levenshteinSim(a: string, b: string): number {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const dist = levenshtein.get(a, b);
  return 1 - dist / maxLen;
}

/**
 * Combined text similarity for two titles.
 * = 0.6 * jaccard(tokens) + 0.4 * levenshtein(first 80 chars)
 */
export function textSim(titleA: string, titleB: string): number {
  const tokA = tokenize(titleA);
  const tokB = tokenize(titleB);
  const jac = jaccardSim(tokA, tokB);
  const lev = levenshteinSim(titleA.slice(0, 80), titleB.slice(0, 80));
  return 0.6 * jac + 0.4 * lev;
}

/** Extract actor names found in text from a dictionary */
export function extractActors(text: string, dict: string[] = ACTOR_DICT): string[] {
  const lower = text.toLowerCase();
  return dict.filter((actor) => lower.includes(actor.toLowerCase()));
}

/** Extract top N non-stopword tokens by frequency */
export function extractKeywords(text: string, topN = 20): string[] {
  const tokens = tokenize(text);
  const freq = new Map<string, number>();
  for (const t of tokens) {
    freq.set(t, (freq.get(t) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);
}

/** Find the most common bigram (adjacent token pair) in an array of titles */
export function topBigram(titles: string[]): string | null {
  const freq = new Map<string, number>();
  for (const title of titles) {
    const tokens = tokenize(title);
    for (let i = 0; i < tokens.length - 1; i++) {
      const bg = `${tokens[i]} ${tokens[i + 1]}`;
      freq.set(bg, (freq.get(bg) ?? 0) + 1);
    }
  }
  if (freq.size === 0) return null;
  return [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

/** Strip HTML tags from a string */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim();
}
