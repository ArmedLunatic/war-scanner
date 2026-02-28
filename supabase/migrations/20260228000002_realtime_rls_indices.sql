-- War Scanner — Migration 002
-- Adds:
--   1. Composite index for escalation / heatmap time-range queries
--   2. Row-Level Security on public tables (read-only via anon key)
--   3. Supabase Realtime publication for `clusters` table
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────
-- 1. Performance indices for new features
-- ─────────────────────────────────────────────

-- Escalation index (/api/escalation): WHERE is_active = true AND first_seen_at >= $1
-- Heatmap page (/heatmap):            same predicate, 90-day window
CREATE INDEX IF NOT EXISTS idx_clusters_active_time
  ON clusters (is_active, first_seen_at DESC);

-- THREATCON meter + escalation panel: ORDER BY first_seen_at DESC with severity/score
CREATE INDEX IF NOT EXISTS idx_clusters_active_score_time
  ON clusters (is_active, score DESC, first_seen_at DESC);

-- ─────────────────────────────────────────────
-- 2. Row-Level Security (RLS)
-- ─────────────────────────────────────────────
-- The service-role key bypasses RLS (used by the pipeline and server-side API routes).
-- The anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY) is used by:
--   - Supabase Realtime subscriptions in the browser (LiveFeedPanel)
--   - Any future client-side direct queries
-- We allow anonymous SELECT on public read-only tables only.

-- clusters ────────────────────────────────────
ALTER TABLE clusters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_clusters" ON clusters;
CREATE POLICY "anon_select_clusters"
  ON clusters FOR SELECT
  TO anon
  USING (is_active = true);

-- feed_cache ──────────────────────────────────
ALTER TABLE feed_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_feed_cache" ON feed_cache;
CREATE POLICY "anon_select_feed_cache"
  ON feed_cache FOR SELECT
  TO anon
  USING (true);

-- cluster_sources ─────────────────────────────
ALTER TABLE cluster_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_cluster_sources" ON cluster_sources;
CREATE POLICY "anon_select_cluster_sources"
  ON cluster_sources FOR SELECT
  TO anon
  USING (true);

-- sources (domain list) ───────────────────────
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sources" ON sources;
CREATE POLICY "anon_select_sources"
  ON sources FOR SELECT
  TO anon
  USING (is_active = true);

-- raw_items / event_candidates / cluster_items — NOT exposed to anon.
-- Service role bypasses RLS; no anon policies needed for these.
ALTER TABLE raw_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cluster_items    ENABLE ROW LEVEL SECURITY;
-- (No SELECT policies = anon has no access → only service role can read them)

-- ─────────────────────────────────────────────
-- 3. Supabase Realtime — enable for `clusters`
-- ─────────────────────────────────────────────
-- The `supabase_realtime` publication must include the table for
-- postgres_changes subscriptions to fire in the browser.
--
-- Only run if the publication already exists (it does in all Supabase projects).
-- `IF NOT EXISTS` isn't supported for ADD TABLE; use DO block for idempotency.

DO $$
BEGIN
  -- Add clusters to the realtime publication if not already there
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND tablename = 'clusters'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE clusters;
  END IF;
END;
$$;

-- ─────────────────────────────────────────────
-- 4. Useful view for escalation queries (optional, for future use)
-- ─────────────────────────────────────────────
-- Materialised daily aggregation — can be refreshed after each ingest run.
-- Named with CREATE OR REPLACE so it's idempotent.

CREATE OR REPLACE VIEW v_daily_escalation AS
  SELECT
    date_trunc('day', first_seen_at)::date AS day,
    count(*)                               AS event_count,
    round(avg(score)::numeric, 2)          AS avg_score,
    round(avg(severity)::numeric, 2)       AS avg_severity,
    max(score)                             AS peak_score
  FROM clusters
  WHERE is_active = true
  GROUP BY 1
  ORDER BY 1 DESC;

-- Allow anon SELECT on the view
GRANT SELECT ON v_daily_escalation TO anon;
