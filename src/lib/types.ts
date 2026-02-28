// ─── Database Row Types ─────────────────────────────────────────────────────

export interface Source {
  id: number;
  domain: string;
  name: string;
  weight: number;
  is_active: boolean;
  created_at: string;
}

export interface RawItem {
  id: string;
  provider: "gdelt" | "reliefweb";
  provider_id: string;
  title: string;
  snippet: string | null;
  url: string;
  source_domain: string | null;
  country: string | null;
  lat: number | null;
  lon: number | null;
  published_at: string | null;
  fetched_at: string;
  payload: Record<string, unknown> | null;
}

export interface EventCandidate {
  id: string;
  raw_item_id: string;
  title: string;
  snippet: string | null;
  url: string;
  source_domain: string | null;
  country: string | null;
  lat: number | null;
  lon: number | null;
  category: string;
  keywords: string[];
  actors: string[];
  happened_at: string | null;
  reported_at: string;
  created_at: string;
}

export interface Cluster {
  id: string;
  headline: string;
  summary_know: string[];
  summary_unclear: string[];
  summary_why: string | null;
  category: string;
  severity: number;
  confidence: "HIGH" | "MED" | "LOW";
  score: number;
  country: string | null;
  lat: number | null;
  lon: number | null;
  keywords: string[];
  actors: string[];
  sources_count: number;
  first_seen_at: string;
  last_updated_at: string;
  is_active: boolean;
  created_at: string;
}

export interface ClusterSource {
  id: number;
  cluster_id: string;
  url: string;
  source_name: string | null;
  domain: string | null;
  published_at: string | null;
  added_at: string;
}

export interface FeedCache {
  key: string;
  payload: unknown;
  generated_at: string;
}

// ─── API Response Types ──────────────────────────────────────────────────────

/** Lightweight card for feed listings */
export interface ClusterCard {
  id: string;
  headline: string;
  summary_know: string[];
  summary_unclear: string[];
  summary_why: string | null;
  category: string;
  severity: number;
  confidence: "HIGH" | "MED" | "LOW";
  score: number;
  country: string | null;
  keywords: string[];
  actors: string[];
  sources_count: number;
  first_seen_at: string;
  last_updated_at: string;
}

/** Full detail including source links */
export interface ClusterDetail extends ClusterCard {
  lat: number | null;
  lon: number | null;
  sources: Array<{
    url: string;
    source_name: string | null;
    domain: string | null;
    published_at: string | null;
  }>;
}

export interface FeedResponse {
  clusters: ClusterCard[];
  total: number;
  generatedAt: string;
}

export interface StatusResponse {
  lastIngestAt: string | null;
  totalRawItems: number;
  totalClusters: number;
  feedCacheGeneratedAt: string | null;
  ok: boolean;
}

export interface IngestStats {
  inserted: number;
  skipped: number;
  normalized: number;
  clustersCreated: number;
  clustersUpdated: number;
}

// ─── Social Feed Types ────────────────────────────────────────────────────────

export interface SocialPost {
  id: string;
  text: string;
  source: string;
  sourceTag: string;
  url: string;
  publishedAt: string;
  score?: number;
  type: "rss" | "reddit" | "news" | "twitter";
}

export interface SocialResponse {
  posts: SocialPost[];
  generatedAt: string;
  sources: string[];
}
