import { getServerClient } from "@/lib/supabase";
import type { ClusterCard, Cluster } from "@/lib/types";

function clusterToCard(cluster: Cluster): ClusterCard {
  return {
    id: cluster.id,
    headline: cluster.headline,
    summary_know: cluster.summary_know,
    summary_unclear: cluster.summary_unclear,
    summary_why: cluster.summary_why,
    category: cluster.category,
    severity: cluster.severity,
    confidence: cluster.confidence,
    score: cluster.score,
    country: cluster.country,
    keywords: cluster.keywords,
    actors: cluster.actors,
    sources_count: cluster.sources_count,
    first_seen_at: cluster.first_seen_at,
    last_updated_at: cluster.last_updated_at,
  };
}

export async function publishFeedCache(): Promise<void> {
  const supabase = getServerClient();

  const { data: clusters, error } = await supabase
    .from("clusters")
    .select("*")
    .eq("is_active", true)
    .order("score", { ascending: false })
    .limit(50);

  if (error) throw new Error(`publishFeedCache: ${error.message}`);
  if (!clusters || clusters.length === 0) return;

  const top50 = (clusters as Cluster[]).map(clusterToCard);

  // Write global top feed
  await supabase.from("feed_cache").upsert(
    {
      key: "global:top",
      payload: top50,
      generated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  // Write per-country feeds
  const byCountry = new Map<string, ClusterCard[]>();
  for (const card of top50) {
    if (!card.country) continue;
    const existing = byCountry.get(card.country) ?? [];
    existing.push(card);
    byCountry.set(card.country, existing);
  }

  for (const [country, cards] of byCountry.entries()) {
    const iso = country.toLowerCase().replace(/\s+/g, "-");
    await supabase.from("feed_cache").upsert(
      {
        key: `country:${iso}`,
        payload: cards,
        generated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
  }

  console.log(`  Feed cache written: global:top (${top50.length} clusters), ${byCountry.size} country feeds`);
}
