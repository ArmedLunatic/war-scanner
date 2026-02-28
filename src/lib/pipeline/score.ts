import { getServerClient } from "@/lib/supabase";
import { SEVERITY_TERMS } from "@/lib/constants";
import type { Cluster } from "@/lib/types";

const CASUALTY_PATTERN = /\d+\s*(killed|dead|wounded|died|deaths)/gi;

function scoreSeverity(titles: string[], snippets: string[]): { raw: number; band: number } {
  const allText = [...titles, ...snippets].join(" ").toLowerCase();
  let raw = 30; // baseline

  if (SEVERITY_TERMS.high.some((t) => allText.includes(t.toLowerCase()))) {
    raw += 20;
  }
  if (SEVERITY_TERMS.medium.some((t) => allText.includes(t.toLowerCase()))) {
    raw += 10;
  }

  // Casualty patterns
  const matches = allText.match(CASUALTY_PATTERN) ?? [];
  raw += Math.min(matches.length * 10, 20);

  raw = Math.min(raw, 100);

  let band: number;
  if (raw <= 20) band = 1;
  else if (raw <= 40) band = 2;
  else if (raw <= 60) band = 3;
  else if (raw <= 80) band = 4;
  else band = 5;

  return { raw, band };
}

function scoreCredibility(
  distinctDomains: Set<string>,
  hasReliefWeb: boolean,
  sourceWeights: Map<string, number>,
): number {
  let cred = 0;

  // +10 per domain up to 40
  cred += Math.min(distinctDomains.size * 10, 40);

  // +10 for reliefweb
  if (hasReliefWeb) cred += 10;

  // Weighted bonus from known sources, cap 20
  let weightBonus = 0;
  for (const domain of distinctDomains) {
    const w = sourceWeights.get(domain);
    if (w) weightBonus += (w - 1) * 10; // weight 1.5 → +5 bonus
  }
  cred += Math.min(weightBonus, 20);

  return Math.min(cred, 100);
}

function scoreRecency(lastUpdatedAt: string): number {
  const ageMs = Date.now() - new Date(lastUpdatedAt).getTime();
  const ageHours = ageMs / 3600000;
  return 100 * Math.exp(-ageHours / 10);
}

export async function scoreAllClusters(): Promise<void> {
  const supabase = getServerClient();

  // Load source weight lookup
  const { data: sourcesData } = await supabase
    .from("sources")
    .select("domain, weight");
  const sourceWeights = new Map<string, number>(
    (sourcesData ?? []).map((s: { domain: string; weight: number }) => [s.domain, s.weight]),
  );

  // Load all active clusters
  const { data: clusters, error } = await supabase
    .from("clusters")
    .select("*")
    .eq("is_active", true)
    .gt("sources_count", 0);

  if (error) throw new Error(`scoreAllClusters: ${error.message}`);
  if (!clusters || clusters.length === 0) return;

  for (const cluster of clusters as Cluster[]) {
    // Get cluster members' text
    const { data: items } = await supabase
      .from("cluster_items")
      .select("candidate_id")
      .eq("cluster_id", cluster.id);

    const memberIds = (items ?? []).map((i: { candidate_id: string }) => i.candidate_id);

    let titles: string[] = [cluster.headline];
    let snippets: string[] = [];

    if (memberIds.length > 0) {
      const { data: members } = await supabase
        .from("event_candidates")
        .select("title, snippet")
        .in("id", memberIds);

      titles = (members ?? []).map((m: { title: string }) => m.title);
      snippets = (members ?? [])
        .map((m: { snippet: string | null }) => m.snippet)
        .filter(Boolean) as string[];
    }

    // Get sources
    const { data: clusterSources } = await supabase
      .from("cluster_sources")
      .select("domain")
      .eq("cluster_id", cluster.id);

    const distinctDomains = new Set(
      (clusterSources ?? [])
        .map((s: { domain: string | null }) => s.domain)
        .filter(Boolean) as string[],
    );
    const hasReliefWeb = distinctDomains.has("reliefweb.int");

    // Score components
    const severity = scoreSeverity(titles, snippets);
    const credibility = scoreCredibility(distinctDomains, hasReliefWeb, sourceWeights);
    const recency = scoreRecency(cluster.last_updated_at);

    const score = 0.45 * severity.raw + 0.35 * credibility + 0.20 * recency;

    // Confidence
    let confidence: "HIGH" | "MED" | "LOW";
    if (distinctDomains.size >= 3 || hasReliefWeb) confidence = "HIGH";
    else if (distinctDomains.size === 2) confidence = "MED";
    else confidence = "LOW";

    await supabase
      .from("clusters")
      .update({
        score: Math.round(score * 100) / 100,
        severity: severity.band,
        confidence,
      })
      .eq("id", cluster.id);
  }
}
