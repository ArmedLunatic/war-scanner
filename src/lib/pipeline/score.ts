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

  // 1. Load source weight lookup (1 query)
  const { data: sourcesData } = await supabase
    .from("sources")
    .select("domain, weight");
  const sourceWeights = new Map<string, number>(
    (sourcesData ?? []).map((s: { domain: string; weight: number }) => [s.domain, s.weight]),
  );

  // 2. Load all active clusters (1 query)
  const { data: clusters, error } = await supabase
    .from("clusters")
    .select("*")
    .eq("is_active", true)
    .gt("sources_count", 0);

  if (error) throw new Error(`scoreAllClusters: ${error.message}`);
  if (!clusters || clusters.length === 0) return;

  const clusterList = clusters as Cluster[];
  const clusterIds = clusterList.map((c) => c.id);

  // 3. Batch-load all cluster_items (1 query)
  const { data: allItems } = await supabase
    .from("cluster_items")
    .select("cluster_id, candidate_id")
    .in("cluster_id", clusterIds);

  const itemsByCluster = new Map<string, string[]>();
  for (const item of allItems ?? []) {
    const list = itemsByCluster.get(item.cluster_id) ?? [];
    list.push(item.candidate_id);
    itemsByCluster.set(item.cluster_id, list);
  }

  // 4. Batch-load all candidate text (1 query)
  const allCandidateIds = [...new Set([...(allItems ?? []).map((i) => i.candidate_id)])];
  const candidateTextMap = new Map<string, { title: string; snippet: string | null }>();

  if (allCandidateIds.length > 0) {
    const { data: members } = await supabase
      .from("event_candidates")
      .select("id, title, snippet")
      .in("id", allCandidateIds);

    for (const m of members ?? []) {
      candidateTextMap.set(m.id, { title: m.title, snippet: m.snippet });
    }
  }

  // 5. Batch-load all cluster_sources (1 query)
  const { data: allSources } = await supabase
    .from("cluster_sources")
    .select("cluster_id, domain")
    .in("cluster_id", clusterIds);

  const sourcesByCluster = new Map<string, string[]>();
  for (const s of allSources ?? []) {
    const list = sourcesByCluster.get(s.cluster_id) ?? [];
    if (s.domain) list.push(s.domain);
    sourcesByCluster.set(s.cluster_id, list);
  }

  // 6. Score in-memory and collect updates
  const updates: { id: string; score: number; severity: number; confidence: "HIGH" | "MED" | "LOW" }[] = [];

  for (const cluster of clusterList) {
    const memberIds = itemsByCluster.get(cluster.id) ?? [];

    let titles: string[] = [cluster.headline];
    let snippets: string[] = [];

    if (memberIds.length > 0) {
      titles = memberIds
        .map((id) => candidateTextMap.get(id)?.title)
        .filter(Boolean) as string[];
      snippets = memberIds
        .map((id) => candidateTextMap.get(id)?.snippet)
        .filter(Boolean) as string[];
    }

    const domains = sourcesByCluster.get(cluster.id) ?? [];
    const distinctDomains = new Set(domains);
    const hasReliefWeb = distinctDomains.has("reliefweb.int");

    const severity = scoreSeverity(titles, snippets);
    const credibility = scoreCredibility(distinctDomains, hasReliefWeb, sourceWeights);
    const recency = scoreRecency(cluster.last_updated_at);

    const score = 0.45 * severity.raw + 0.35 * credibility + 0.20 * recency;

    let confidence: "HIGH" | "MED" | "LOW";
    if (distinctDomains.size >= 3 || hasReliefWeb) confidence = "HIGH";
    else if (distinctDomains.size === 2) confidence = "MED";
    else confidence = "LOW";

    updates.push({
      id: cluster.id,
      score: Math.round(score * 100) / 100,
      severity: severity.band,
      confidence,
    });
  }

  // 7. Batch upsert all scores (1 query)
  if (updates.length > 0) {
    await supabase
      .from("clusters")
      .upsert(updates, { onConflict: "id" });
  }
}
