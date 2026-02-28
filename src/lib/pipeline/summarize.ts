import { getServerClient } from "@/lib/supabase";
import { jaccardSim, tokenize, topBigram } from "@/lib/utils/text";
import type { Cluster, EventCandidate } from "@/lib/types";

const WHY_MAP: Record<string, string> = {
  strike:
    "This category of event is typically part of ongoing military operations in the region.",
  clash:
    "Armed clashes in this area have been reported across multiple time periods.",
  invasion:
    "This event relates to territorial conflict or ceasefire dynamics in an active conflict zone.",
  diplomacy:
    "Diplomatic activity in this region reflects ongoing international engagement.",
  sanctions:
    "Sanctions measures are part of the broader international response to the conflict.",
  humanitarian:
    "The humanitarian situation in this area has drawn international attention.",
  other:
    "Context for this event requires further reporting.",
};

function sentencesFromSnippet(snippet: string): string[] {
  return snippet
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 300);
}

export async function summarizeAllClusters(): Promise<void> {
  const supabase = getServerClient();

  const { data: clusters, error } = await supabase
    .from("clusters")
    .select("*")
    .eq("is_active", true);

  if (error) throw new Error(`summarizeAllClusters: ${error.message}`);
  if (!clusters || clusters.length === 0) return;

  for (const cluster of clusters as Cluster[]) {
    const { data: items } = await supabase
      .from("cluster_items")
      .select("candidate_id")
      .eq("cluster_id", cluster.id);

    const memberIds = (items ?? []).map((i: { candidate_id: string }) => i.candidate_id);
    if (memberIds.length === 0) continue;

    const { data: members } = await supabase
      .from("event_candidates")
      .select("title, snippet, actors, source_domain")
      .in("id", memberIds);

    if (!members || members.length === 0) continue;

    const typedMembers = members as Pick<EventCandidate, "title" | "snippet" | "actors" | "source_domain">[];
    const titles = typedMembers.map((m) => m.title);
    const snippets = typedMembers.map((m) => m.snippet).filter(Boolean) as string[];

    // ── Headline ──────────────────────────────────────────────────────────────
    const bigram = topBigram(titles);
    let headline = cluster.headline; // default: first title

    if (bigram) {
      // Find shortest title containing the top bigram
      const matching = titles.filter((t) => t.toLowerCase().includes(bigram));
      if (matching.length > 0) {
        const shortest = matching.sort((a, b) => a.length - b.length)[0];
        headline = shortest.length <= 120 ? shortest : `${bigram.toUpperCase()} — ${cluster.country ?? cluster.category}`;
      }
    }

    // ── Know bullets ─────────────────────────────────────────────────────────
    const knowBullets: string[] = [];
    const usedTokenSets: string[][] = [];

    for (const snippet of snippets) {
      if (knowBullets.length >= 4) break;
      const sentences = sentencesFromSnippet(snippet);
      for (const sentence of sentences) {
        if (knowBullets.length >= 4) break;
        const tokens = tokenize(sentence);
        const isDuplicate = usedTokenSets.some(
          (existing) => jaccardSim(tokens, existing) > 0.7,
        );
        if (!isDuplicate) {
          const sourceLabel = typedMembers.find((m) => m.snippet?.includes(snippet))?.source_domain;
          const prefix = sourceLabel
            ? `According to ${sourceLabel}, `
            : "Reports indicate that ";
          knowBullets.push(`${prefix}${sentence.charAt(0).toLowerCase() + sentence.slice(1)}`);
          usedTokenSets.push(tokens);
        }
      }
    }

    // Fallback if no snippets
    if (knowBullets.length === 0 && titles.length > 0) {
      knowBullets.push(`Reports indicate that ${titles[0].toLowerCase()}`);
    }

    // ── Unclear bullets ───────────────────────────────────────────────────────
    const unclearBullets: string[] = [];

    const allActors = typedMembers.flatMap((m) => m.actors);
    const actorSet = new Set(allActors);
    if (actorSet.size === 0 || snippets.length === 0) {
      unclearBullets.push("Casualty figures remain unconfirmed.");
    }

    if (snippets.length === 0) {
      unclearBullets.push("Further details are not yet available from current sources.");
    }

    if (!cluster.lat || !cluster.lon) {
      unclearBullets.push("Exact location has not been independently verified.");
    }

    // ── Why bullet ────────────────────────────────────────────────────────────
    const why = WHY_MAP[cluster.category] ?? WHY_MAP.other;

    await supabase
      .from("clusters")
      .update({
        headline,
        summary_know: knowBullets,
        summary_unclear: unclearBullets.slice(0, 2),
        summary_why: why,
      })
      .eq("id", cluster.id);
  }
}
