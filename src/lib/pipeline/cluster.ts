import { getServerClient } from "@/lib/supabase";
import {
  CLUSTER_SIM_THRESHOLD,
  CLUSTER_WINDOW_HOURS,
  INGEST_WINDOW_HOURS,
} from "@/lib/constants";
import { textSim, jaccardSim } from "@/lib/utils/text";
import { haversineKm, geoProximity } from "@/lib/utils/geo";
import type { Cluster, EventCandidate } from "@/lib/types";

interface ClusterWithKeywords extends Cluster {
  memberKeywords: string[];
}

function timeProximity(t1: string, t2: string): number {
  const diffHours = Math.abs(new Date(t1).getTime() - new Date(t2).getTime()) / 3600000;
  return Math.max(0, 1 - diffHours / CLUSTER_WINDOW_HOURS);
}

function scoreCandidate(
  candidate: EventCandidate,
  cluster: ClusterWithKeywords,
): number {
  const ts = textSim(candidate.title, cluster.headline);
  const ks = jaccardSim(candidate.keywords, cluster.memberKeywords);
  const tp = timeProximity(candidate.reported_at, cluster.last_updated_at);

  let gp = 0.5; // neutral if no geo on either side
  if (
    candidate.lat != null && candidate.lon != null &&
    cluster.lat != null && cluster.lon != null
  ) {
    const dKm = haversineKm(candidate.lat, candidate.lon, cluster.lat, cluster.lon);
    gp = geoProximity(dKm);
  }

  return 0.35 * ts + 0.25 * ks + 0.25 * tp + 0.15 * gp;
}

export async function clusterNewCandidates(): Promise<{
  created: number;
  attached: number;
}> {
  const supabase = getServerClient();

  const windowStart = new Date(
    Date.now() - INGEST_WINDOW_HOURS * 3600 * 1000,
  ).toISOString();

  // 1. Load all candidates in window
  const { data: candidates, error: candErr } = await supabase
    .from("event_candidates")
    .select("*")
    .gte("reported_at", windowStart)
    .order("reported_at", { ascending: true });

  if (candErr) throw new Error(`cluster query candidates: ${candErr.message}`);
  if (!candidates || candidates.length === 0) return { created: 0, attached: 0 };

  // 2. Filter out already-clustered candidates (1 query)
  const candIds = candidates.map((c: EventCandidate) => c.id);
  const { data: alreadyClustered } = await supabase
    .from("cluster_items")
    .select("candidate_id")
    .in("candidate_id", candIds);

  const clusteredSet = new Set(
    (alreadyClustered ?? []).map((r: { candidate_id: string }) => r.candidate_id),
  );
  const unclustered = (candidates as EventCandidate[]).filter(
    (c) => !clusteredSet.has(c.id),
  );

  if (unclustered.length === 0) return { created: 0, attached: 0 };

  // 3. Batch-load all active clusters in the cluster window (1 query)
  const clusterWindowStart = new Date(
    Date.now() - (CLUSTER_WINDOW_HOURS + INGEST_WINDOW_HOURS) * 3600 * 1000,
  ).toISOString();

  const { data: allClusters } = await supabase
    .from("clusters")
    .select("*")
    .eq("is_active", true)
    .gte("last_updated_at", clusterWindowStart);

  const activeClusters = (allClusters ?? []) as Cluster[];

  // 4. Batch-load all cluster_items for those clusters (1 query)
  const clusterIds = activeClusters.map((c) => c.id);
  let clusterItemsMap = new Map<string, string[]>(); // cluster_id → candidate_ids

  if (clusterIds.length > 0) {
    const { data: allItems } = await supabase
      .from("cluster_items")
      .select("cluster_id, candidate_id")
      .in("cluster_id", clusterIds);

    for (const item of allItems ?? []) {
      const list = clusterItemsMap.get(item.cluster_id) ?? [];
      list.push(item.candidate_id);
      clusterItemsMap.set(item.cluster_id, list);
    }
  }

  // 5. Batch-load all member keywords for those candidates (1 query)
  const allMemberIds = [...new Set([...clusterItemsMap.values()].flat())];
  let memberKeywordsMap = new Map<string, string[]>(); // candidate_id → keywords

  if (allMemberIds.length > 0) {
    const { data: memberCands } = await supabase
      .from("event_candidates")
      .select("id, keywords")
      .in("id", allMemberIds);

    for (const m of memberCands ?? []) {
      memberKeywordsMap.set(m.id, m.keywords ?? []);
    }
  }

  // 6. Also batch-load raw_items for all unclustered candidates (1 query)
  const unclusteredRawIds = unclustered.map((c) => c.raw_item_id).filter(Boolean);
  let rawItemsMap = new Map<string, { url: string; source_domain: string | null; published_at: string | null }>();

  if (unclusteredRawIds.length > 0) {
    const { data: rawItems } = await supabase
      .from("raw_items")
      .select("id, url, source_domain, published_at")
      .in("id", unclusteredRawIds);

    for (const r of rawItems ?? []) {
      rawItemsMap.set(r.id, { url: r.url, source_domain: r.source_domain, published_at: r.published_at });
    }
  }

  // 7. Build enriched clusters in-memory
  const enrichedClusters: ClusterWithKeywords[] = activeClusters.map((cluster) => {
    const memberIds = clusterItemsMap.get(cluster.id) ?? [];
    const allKeywords = memberIds.flatMap((mid) => memberKeywordsMap.get(mid) ?? []);
    return {
      ...cluster,
      memberKeywords: allKeywords.length > 0 ? allKeywords : (cluster.keywords ?? []),
    };
  });

  let created = 0;
  let attached = 0;

  // Track which clusters were modified for aggregate recompute
  const modifiedClusterIds = new Set<string>();

  // Pending inserts — batch after the loop
  const pendingClusterItems: { cluster_id: string; candidate_id: string }[] = [];
  const pendingClusterSources: {
    cluster_id: string;
    url: string;
    source_name: string | null;
    domain: string | null;
    published_at: string | null;
  }[] = [];

  // In-memory list of newly-created cluster ids so we can add them to enrichedClusters
  // for subsequent candidates in the same run
  const newlyCreated: ClusterWithKeywords[] = [];

  // 8. Process each unclustered candidate in-memory
  for (const candidate of unclustered) {
    // Filter relevant clusters by country (JS-side, same logic as before)
    const candidateClustersPool = [...enrichedClusters, ...newlyCreated].filter(
      (c) => !candidate.country || !c.country || c.country === candidate.country,
    );

    // Also filter by time window relative to this candidate
    const candTime = new Date(candidate.reported_at).getTime();
    const windowMs = CLUSTER_WINDOW_HOURS * 3600 * 1000;
    const relevant = candidateClustersPool.filter((c) => {
      const clusterTime = new Date(c.last_updated_at).getTime();
      return Math.abs(candTime - clusterTime) <= windowMs;
    });

    // Score
    let bestCluster: ClusterWithKeywords | null = null;
    let bestSim = 0;

    for (const cluster of relevant) {
      const sim = scoreCandidate(candidate, cluster);
      if (sim > bestSim) {
        bestSim = sim;
        bestCluster = cluster;
      }
    }

    let clusterId: string;

    if (bestCluster && bestSim >= CLUSTER_SIM_THRESHOLD) {
      clusterId = bestCluster.id;
      attached++;
      // Update in-memory cluster's keywords and time so subsequent candidates benefit
      bestCluster.memberKeywords.push(...(candidate.keywords ?? []));
      bestCluster.last_updated_at = candidate.reported_at;
    } else {
      // Create new cluster (still needs a DB insert for the ID)
      const { data: newCluster, error: createErr } = await supabase
        .from("clusters")
        .insert({
          headline: candidate.title,
          category: candidate.category,
          country: candidate.country ?? null,
          lat: candidate.lat ?? null,
          lon: candidate.lon ?? null,
          keywords: candidate.keywords,
          actors: candidate.actors,
          first_seen_at: candidate.reported_at,
          last_updated_at: candidate.reported_at,
          summary_know: [],
          summary_unclear: [],
        })
        .select("id")
        .single();

      if (createErr || !newCluster) {
        console.error("cluster create error:", createErr?.message);
        continue;
      }

      clusterId = newCluster.id;
      created++;

      // Add to in-memory pool so later candidates in same run can attach to it
      const freshCluster: ClusterWithKeywords = {
        id: clusterId,
        headline: candidate.title,
        category: candidate.category,
        country: candidate.country ?? null,
        lat: candidate.lat ?? null,
        lon: candidate.lon ?? null,
        keywords: candidate.keywords ?? [],
        actors: candidate.actors ?? [],
        first_seen_at: candidate.reported_at,
        last_updated_at: candidate.reported_at,
        created_at: new Date().toISOString(),
        is_active: true,
        score: 0,
        severity: 1,
        confidence: "LOW",
        sources_count: 0,
        summary_know: [],
        summary_unclear: [],
        summary_why: null,
        memberKeywords: candidate.keywords ?? [],
      };
      newlyCreated.push(freshCluster);
    }

    modifiedClusterIds.add(clusterId);
    pendingClusterItems.push({ cluster_id: clusterId, candidate_id: candidate.id });

    const rawItem = rawItemsMap.get(candidate.raw_item_id);
    if (rawItem) {
      pendingClusterSources.push({
        cluster_id: clusterId,
        url: rawItem.url,
        source_name: rawItem.source_domain ?? null,
        domain: rawItem.source_domain ?? null,
        published_at: rawItem.published_at ?? null,
      });
    }
  }

  // 9. Batch-insert cluster_items (1 query)
  if (pendingClusterItems.length > 0) {
    await supabase.from("cluster_items").insert(pendingClusterItems);
  }

  // 10. Batch-insert cluster_sources (1 query)
  if (pendingClusterSources.length > 0) {
    await supabase.from("cluster_sources").insert(pendingClusterSources);
  }

  // 11. Recompute aggregates once per modified cluster (not once per candidate)
  for (const clusterId of modifiedClusterIds) {
    await recomputeClusterAggregates(clusterId);
  }

  return { created, attached };
}

async function recomputeClusterAggregates(clusterId: string): Promise<void> {
  const supabase = getServerClient();

  const { data: items } = await supabase
    .from("cluster_items")
    .select("candidate_id")
    .eq("cluster_id", clusterId);

  if (!items || items.length === 0) return;

  const memberIds = items.map((i: { candidate_id: string }) => i.candidate_id);
  const { data: members } = await supabase
    .from("event_candidates")
    .select("*")
    .in("id", memberIds);

  if (!members || members.length === 0) return;

  // Category majority vote
  const catCount = new Map<string, number>();
  for (const m of members) {
    catCount.set(m.category, (catCount.get(m.category) ?? 0) + 1);
  }
  const category = [...catCount.entries()].sort((a, b) => b[1] - a[1])[0][0];

  // Median lat/lon from members with geo
  const geoMembers = members.filter(
    (m: EventCandidate) => m.lat != null && m.lon != null,
  );
  let lat: number | null = null;
  let lon: number | null = null;
  if (geoMembers.length > 0) {
    const lats = geoMembers.map((m: EventCandidate) => m.lat as number).sort((a, b) => a - b);
    const lons = geoMembers.map((m: EventCandidate) => m.lon as number).sort((a, b) => a - b);
    const mid = Math.floor(lats.length / 2);
    lat = lats[mid];
    lon = lons[mid];
  }

  // Time range
  const reportedTimes = members.map((m: EventCandidate) => m.reported_at).sort();
  const firstSeenAt = reportedTimes[0];
  const lastUpdatedAt = reportedTimes[reportedTimes.length - 1];

  // Merged keywords and actors
  const allKeywords = [...new Set(members.flatMap((m: EventCandidate) => m.keywords))].slice(0, 30);
  const allActors = [...new Set(members.flatMap((m: EventCandidate) => m.actors))].slice(0, 20);

  // Sources count
  const { data: sources } = await supabase
    .from("cluster_sources")
    .select("domain")
    .eq("cluster_id", clusterId);

  const distinctDomains = new Set((sources ?? []).map((s: { domain: string | null }) => s.domain).filter(Boolean));

  await supabase.from("clusters").update({
    category,
    lat,
    lon,
    first_seen_at: firstSeenAt,
    last_updated_at: lastUpdatedAt,
    keywords: allKeywords,
    actors: allActors,
    sources_count: distinctDomains.size,
  }).eq("id", clusterId);
}
