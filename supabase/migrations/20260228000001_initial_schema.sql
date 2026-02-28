-- War Scanner — Initial Schema Migration
-- Run: psql -f supabase/migrations/001_initial_schema.sql
-- Or:  supabase db push

-- gen_random_uuid() is built-in since Postgres 13; no extension needed.

-- ─────────────────────────────────────────────
-- 1. sources
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sources (
  id          SERIAL PRIMARY KEY,
  domain      TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  weight      NUMERIC(3,1) NOT NULL DEFAULT 1.0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed known high-quality source domains
INSERT INTO sources (domain, name, weight) VALUES
  ('reuters.com',    'Reuters',         1.5),
  ('bbc.com',        'BBC News',        1.4),
  ('ap.org',         'Associated Press',1.4),
  ('aljazeera.com',  'Al Jazeera',      1.2),
  ('theguardian.com','The Guardian',    1.2),
  ('nytimes.com',    'New York Times',  1.3),
  ('washingtonpost.com','Washington Post',1.2),
  ('reliefweb.int',  'ReliefWeb',       1.3),
  ('france24.com',   'France 24',       1.1),
  ('dw.com',         'Deutsche Welle',  1.1)
ON CONFLICT (domain) DO NOTHING;

-- ─────────────────────────────────────────────
-- 2. raw_items
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS raw_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider      TEXT NOT NULL,          -- 'gdelt' | 'reliefweb'
  provider_id   TEXT NOT NULL,          -- URL or report ID
  title         TEXT NOT NULL,
  snippet       TEXT,                   -- first 500 chars of body, or null
  url           TEXT NOT NULL,
  source_domain TEXT,
  country       TEXT,
  lat           NUMERIC(9,6),
  lon           NUMERIC(9,6),
  published_at  TIMESTAMPTZ,
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload       JSONB,                  -- raw provider response object

  CONSTRAINT raw_items_provider_id UNIQUE (provider, provider_id)
);

CREATE INDEX IF NOT EXISTS idx_raw_items_published_at
  ON raw_items (published_at DESC);

CREATE INDEX IF NOT EXISTS idx_raw_items_country_reported
  ON raw_items (country, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_raw_items_payload
  ON raw_items USING GIN (payload);

-- ─────────────────────────────────────────────
-- 3. event_candidates
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_candidates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_item_id UUID NOT NULL REFERENCES raw_items(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  snippet     TEXT,
  url         TEXT NOT NULL,
  source_domain TEXT,
  country     TEXT,
  lat         NUMERIC(9,6),
  lon         NUMERIC(9,6),
  category    TEXT NOT NULL DEFAULT 'other',
  keywords    TEXT[] NOT NULL DEFAULT '{}',
  actors      TEXT[] NOT NULL DEFAULT '{}',
  happened_at TIMESTAMPTZ,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT event_candidates_raw_item UNIQUE (raw_item_id)
);

CREATE INDEX IF NOT EXISTS idx_candidates_reported_at
  ON event_candidates (reported_at DESC);

CREATE INDEX IF NOT EXISTS idx_candidates_keywords
  ON event_candidates USING GIN (keywords);

CREATE INDEX IF NOT EXISTS idx_candidates_actors
  ON event_candidates USING GIN (actors);

CREATE INDEX IF NOT EXISTS idx_candidates_country
  ON event_candidates (country, reported_at DESC);

-- ─────────────────────────────────────────────
-- 4. clusters
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clusters (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  headline        TEXT NOT NULL,
  summary_know    TEXT[] NOT NULL DEFAULT '{}',   -- "we know" bullets
  summary_unclear TEXT[] NOT NULL DEFAULT '{}',   -- "unclear" bullets
  summary_why     TEXT,                            -- context bullet
  category        TEXT NOT NULL DEFAULT 'other',
  severity        INTEGER NOT NULL DEFAULT 1,      -- 1-5
  confidence      TEXT NOT NULL DEFAULT 'LOW',     -- HIGH|MED|LOW
  score           NUMERIC(6,2) NOT NULL DEFAULT 0,
  country         TEXT,
  lat             NUMERIC(9,6),
  lon             NUMERIC(9,6),
  keywords        TEXT[] NOT NULL DEFAULT '{}',
  actors          TEXT[] NOT NULL DEFAULT '{}',
  sources_count   INTEGER NOT NULL DEFAULT 0,
  first_seen_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clusters_score
  ON clusters (score DESC, last_updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_clusters_country
  ON clusters (country, last_updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_clusters_category
  ON clusters (category);

CREATE INDEX IF NOT EXISTS idx_clusters_active
  ON clusters (is_active, score DESC);

-- ─────────────────────────────────────────────
-- 5. cluster_items  (many-to-many: cluster ↔ event_candidate)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cluster_items (
  cluster_id   UUID NOT NULL REFERENCES clusters(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES event_candidates(id) ON DELETE CASCADE,
  attached_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (cluster_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_cluster_items_candidate
  ON cluster_items (candidate_id);

-- ─────────────────────────────────────────────
-- 6. cluster_sources  (denormalised source links per cluster)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cluster_sources (
  id           SERIAL PRIMARY KEY,
  cluster_id   UUID NOT NULL REFERENCES clusters(id) ON DELETE CASCADE,
  url          TEXT NOT NULL,
  source_name  TEXT,
  domain       TEXT,
  published_at TIMESTAMPTZ,
  added_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT cluster_sources_unique UNIQUE (cluster_id, url)
);

CREATE INDEX IF NOT EXISTS idx_cluster_sources_cluster
  ON cluster_sources (cluster_id, published_at DESC);

-- ─────────────────────────────────────────────
-- 7. feed_cache  (materialised view replacement)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feed_cache (
  key          TEXT PRIMARY KEY,
  payload      JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
