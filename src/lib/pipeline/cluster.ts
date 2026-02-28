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

  // Find candidates not yet in any cluster
  const windowStart = new Date(
    Date.now() - INGEST_WINDOW_HOURS * 3600 * 1000,
  ).toISOString();

  const { data: candidates, error: candErr } = await supabase
    .from("event_candidates")
    .select("*")
    .gte("reported_at", windowStart)
    .order("reported_at", { ascending: true });

  if (candErr) throw new Error(`cluster query candidates: ${candErr.message}`);
  if (!candidates || candidates.length === 0) return { created: 0, attached: 0 };

  // Filter out already-clustered candidates
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

  let created = 0;
  let attached = 0;

  for (const candidate of unclustered) {
    // Find candidate clusters: same country, recent
    const clusterWindowStart = new Date(
      new Date(candidate.reported_at).getTime() - CLUSTER_WINDOW_HOURS * 3600 * 1000,
    ).toISOString();

    const { data: nearClusters } = await supabase
      .from("clusters")
      .select("*")
      .eq("is_active", true)
      .gte("last_updated_at", clusterWindowStart);

    // Filter by country in JS to avoid PostgREST escaping issues with multi-word names
    const relevant = (nearClusters ?? []).filter((c) =>
      !candidate.country || !c.country || c.country === candidate.country
    );

    // Fetch keywords from cluster members
    const enrichedClusters: ClusterWithKeywords[] = [];
    for (const cluster of relevant) {
      const { data: items } = await supabase
        .from("cluster_items")
        .select("candidate_id")
        .eq("cluster_id", cluster.id);

      if (items && items.length > 0) {
        const memberIds = items.map((i: { candidate_id: string }) => i.candidate_id);
        const { data: members } = await supabase
          .from("event_candidates")
          .select("keywords")
          .in("id", memberIds);
        const allKeywords = (members ?? []).flatMap(
          (m: { keywords: string[] }) => m.keywords,
        );
        enrichedClusters.push({ ...cluster, memberKeywords: allKeywords });
      } else {
        enrichedClusters.push({ ...cluster, memberKeywords: cluster.keywords ?? [] });
      }
    }

    // Score each cluster
    let bestCluster: ClusterWithKeywords | null = null;
    let bestSim = 0;

    for (const cluster of enrichedClusters) {
      const sim = scoreCandidate(candidate, cluster);
      if (sim > bestSim) {
        bestSim = sim;
        bestCluster = cluster;
      }
    }

    let clusterId: string;

    if (bestCluster && bestSim >= CLUSTER_SIM_THRESHOLD) {
      // Attach to existing cluster
      clusterId = bestCluster.id;
      attached++;
    } else {
      // Create new cluster
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
    }

    // Attach candidate to cluster
    await supabase.from("cluster_items").insert({
      cluster_id: clusterId,
      candidate_id: candidate.id,
    });

    // Upsert cluster source
    const { data: rawItem } = await supabase
      .from("raw_items")
      .select("url, source_domain, published_at")
      .eq("id", candidate.raw_item_id)
      .single();

    if (rawItem) {
      await supabase.from("cluster_sources").insert({
        cluster_id: clusterId,
        url: rawItem.url,
        source_name: rawItem.source_domain ?? null,
        domain: rawItem.source_domain ?? null,
        published_at: rawItem.published_at ?? null,
      });
    }

    // Recompute cluster aggregates
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
