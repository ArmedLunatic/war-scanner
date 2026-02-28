// ─── Named Entities Dictionary ───────────────────────────────────────────────

export const ACTOR_DICT: string[] = [
  // Countries / states
  "Russia", "Ukraine", "Israel", "Iran", "Palestine", "Gaza", "Hamas", "Hezbollah",
  "United States", "US", "USA", "China", "NATO", "EU", "UN",
  "Sudan", "Yemen", "Houthis", "Syria", "Iraq", "Afghanistan", "Pakistan",
  "India", "Pakistan", "Libya", "Ethiopia", "Somalia", "Mali",
  "France", "Germany", "UK", "Britain", "Turkey", "Saudi Arabia", "Qatar",
  // Groups
  "ISIS", "ISIL", "Al-Qaeda", "Wagner Group", "IDF", "Pentagon",
  "Zelensky", "Putin", "Netanyahu", "Khamenei", "Biden", "Trump",
];

// ─── Category Keywords ───────────────────────────────────────────────────────

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  strike: [
    "airstrike", "air strike", "missile strike", "bombing", "bombed",
    "drone strike", "drone attack", "rocket attack", "shelling", "artillery",
    "bombardment", "warplane", "fighter jet",
  ],
  clash: [
    "clash", "clashes", "fighting", "firefight", "gunfire", "battle",
    "skirmish", "ground assault", "offensive", "counteroffensive",
    "combat", "troops", "soldiers killed",
  ],
  invasion: [
    "invasion", "invaded", "crossing", "territory", "occupation",
    "ceasefire", "truce", "withdrawal", "retreat", "advance",
  ],
  humanitarian: [
    "humanitarian", "aid", "refugee", "displaced", "evacuation",
    "famine", "starvation", "siege", "blockade", "hospital",
    "civilian casualties", "civilian", "civilian deaths",
  ],
  diplomacy: [
    "diplomacy", "diplomatic", "talks", "negotiations", "summit",
    "agreement", "deal", "treaty", "envoy", "ambassador",
    "sanctions", "embargo", "peace deal",
  ],
  sanctions: [
    "sanctions", "sanction", "embargo", "blacklist", "asset freeze",
    "travel ban", "financial", "export controls",
  ],
};

// ─── Severity Terms ──────────────────────────────────────────────────────────

export const SEVERITY_TERMS = {
  high: [
    "mass casualty", "hundreds killed", "thousands killed",
    "major offensive", "full-scale invasion", "nuclear",
    "chemical weapon", "war crime", "genocide", "catastrophic",
    "widespread destruction", "city destroyed", "civilian massacre",
  ],
  medium: [
    "killed", "dead", "wounded", "injured", "casualties",
    "destroyed", "explosion", "attack", "assault", "offensive",
    "strike", "bombing", "shelling",
  ],
  low: [
    "tensions", "warning", "threat", "alert", "escalation",
    "mobilization", "deployment", "military exercise",
  ],
};

// ─── Stopwords ───────────────────────────────────────────────────────────────

export const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "can", "this", "that", "these",
  "those", "it", "its", "as", "not", "no", "into", "over", "after",
  "about", "than", "up", "also", "out", "if", "he", "she", "they",
  "we", "you", "i", "his", "her", "their", "our", "your", "my",
  "who", "which", "what", "when", "where", "how", "all", "more",
  "some", "any", "two", "one", "new", "amid", "says", "said",
  "report", "reports", "reported", "amid", "amid", "following",
  "according", "officials", "official", "government", "state",
]);

// ─── Category Labels ─────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<string, string> = {
  strike: "Strike",
  clash: "Clash",
  invasion: "Invasion/Ceasefire",
  humanitarian: "Humanitarian",
  diplomacy: "Diplomacy",
  sanctions: "Sanctions",
  other: "Other",
};

// ─── Pipeline Config ─────────────────────────────────────────────────────────

export const CLUSTER_SIM_THRESHOLD = 0.70;
export const CLUSTER_WINDOW_HOURS = 8;
export const MAX_CLUSTER_AGE_HOURS = 72;
export const INGEST_WINDOW_HOURS = parseInt(process.env.INGEST_WINDOW_HOURS ?? "24", 10);
