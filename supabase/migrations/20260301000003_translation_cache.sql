-- War Scanner — Migration 003
-- Adds translation_cache table for caching non-English → English translations.
-- Keyed on SHA-256 hash of source text. Service role only (no anon access).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS translation_cache (
  text_hash      TEXT PRIMARY KEY,          -- SHA-256 hex of source text
  source_lang    TEXT NOT NULL DEFAULT 'auto',
  translated_text TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for cache cleanup queries (oldest first)
CREATE INDEX IF NOT EXISTS idx_translation_cache_created
  ON translation_cache (created_at ASC);

-- RLS enabled, no anon policies → only service role can read/write
ALTER TABLE translation_cache ENABLE ROW LEVEL SECURITY;
