# War Scanner

Near-real-time global conflict event monitor. Aggregates, deduplicates, and ranks reports from **GDELT 2.1** and **ReliefWeb**. No LLM inference. No full article storage.

---

## Features

- **Deterministic clustering** — overlapping reports merged via weighted text/geo/time similarity (threshold 0.70)
- **Scoring** — severity × credibility × recency formula, ranked feed
- **Confidence labels** — HIGH / MED / LOW based on source corroboration count
- **Extractive summaries** — sentences taken directly from titles + snippets (no paraphrasing)
- **Link-out only** — stores URL + title + first 500 chars of snippet; all links open the original publisher

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### 2. Clone and install

```bash
git clone <repo>
cd war-scanner
npm install
```

### 3. Set up environment

```bash
cp .env.local.example .env.local
# Edit .env.local and fill in:
#   SUPABASE_URL
#   SUPABASE_SERVICE_ROLE_KEY
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   WAR_SCANNER_ADMIN_TOKEN   (any secret string)
```

### 4. Run the database migration

In your Supabase dashboard → SQL Editor, paste and run the contents of:

```
supabase/migrations/001_initial_schema.sql
```

Or using the Supabase CLI:

```bash
supabase db push
```

### 5. Run first ingest

```bash
npm run ingest
```

This runs the full pipeline:
1. Fetch from GDELT 2.1 + ReliefWeb
2. Normalize raw items → event candidates
3. Cluster candidates deterministically
4. Score all clusters
5. Generate extractive summaries
6. Publish to feed cache

### 6. Start the dev server

```bash
npm run dev
# → http://localhost:3000
```

---

## Pages

| Path | Description |
|------|-------------|
| `/` | Main ranked conflict feed with filters |
| `/brief` | Top-10 digest for the last 12 hours |
| `/event/:id` | Full cluster detail with bullet summaries + source links |
| `/methodology` | Scoring formula, confidence label definitions, limitations |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/events` | Paginated feed. Params: `country`, `category`, `confidence`, `page`, `limit` |
| `GET` | `/api/events/:id` | Full cluster detail with source links |
| `GET` | `/api/brief?hours=12` | Top 10 from last N hours (max 48) |
| `GET` | `/api/status` | Health check + ingest stats |
| `POST` | `/api/admin/run-ingest` | Trigger full pipeline (Bearer token required) |

### Trigger ingest via API

```bash
curl -X POST http://localhost:3000/api/admin/run-ingest \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Confidence Labels

| Label | Meaning |
|-------|---------|
| **HIGH** | ≥3 distinct source domains, or ReliefWeb (UN-verified) is present |
| **MED** | 2 distinct source domains |
| **LOW** | Single source — treat as preliminary |

Confidence reflects **corroboration**, not editorial verification.

---

## Scoring Formula

```
score = 0.45 × severity + 0.35 × credibility + 0.20 × recency

severity:    keyword-based (high/medium terms, casualty patterns), 0–100
credibility: distinct domains (+10 each, max 40) + source quality bonuses, 0–100
recency:     100 × exp(−ageHours / 10), 0–100
```

---

## Limitations

- Coverage limited to GDELT-indexed outlets and ReliefWeb reports
- Clustering is heuristic — may merge distinct events or split one event into multiple clusters
- Severity scoring is keyword-based; cannot assess context
- No editorial review — automated pipeline only
- **Do not use for life-safety decisions**

---

## Legal

War Scanner stores only titles, URLs, and brief metadata snippets. No full article text is cached or reproduced. All source links open the original publisher. GDELT is open-licensed; ReliefWeb content is Creative Commons.
