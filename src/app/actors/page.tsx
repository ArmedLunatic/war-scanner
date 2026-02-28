import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conflict Actors — Warspy",
  description: "Intelligence profiles for key actors in the Israel-Iran conflict theater.",
};

interface Actor {
  id: string;
  name: string;
  fullName: string;
  country: string;
  type: "state" | "proxy" | "intel";
  color: string;
  strength: number;       // 1–10 military strength
  capability: string;     // one-line capability
  personnel: string;
  founded: string;
  leadership: string;
  ideology: string;
  keyCapabilities: string[];
  recentActivity: string;
  threat: "CRITICAL" | "HIGH" | "MED" | "LOW";
}

const ACTORS: Actor[] = [
  {
    id: "idf",
    name: "IDF",
    fullName: "Israel Defense Forces",
    country: "Israel",
    type: "state",
    color: "#60a5fa",
    strength: 9,
    capability: "Advanced multi-domain warfare, nuclear-armed",
    personnel: "~170,000 active + 465,000 reserve",
    founded: "1948",
    leadership: "Chief of Staff: Lt. Gen. Eyal Zamir (Mar 2025)",
    ideology: "Deterrence-based defense doctrine (Dahiya)",
    keyCapabilities: [
      "F-35I Adir stealth fighters (50+ aircraft)",
      "Arrow-3, David's Sling, Iron Dome layered defense",
      "Submarine-launched cruise missiles (Dolphin-class)",
      "Cyber Unit 8200 — world-class offensive capabilities",
      "Mossad joint operations for preemptive strikes",
    ],
    recentActivity: "Oct 2024: Extensive airstrikes on Iran's air defense radars in Isfahan. Jan 2025: Gaza ceasefire phase 1 entered; hostage-for-prisoner exchange ongoing. Ongoing northern border operations post-ceasefire with Hezbollah.",
    threat: "CRITICAL",
  },
  {
    id: "irgc",
    name: "IRGC",
    fullName: "Islamic Revolutionary Guard Corps",
    country: "Iran",
    type: "state",
    color: "#e03e3e",
    strength: 8,
    capability: "Ballistic missile arsenal, proxy network controller",
    personnel: "~125,000 active + Basij militia",
    founded: "1979",
    leadership: "Commander: Maj. Gen. Hossein Salami",
    ideology: "Velayat-e faqih (Guardian of the Islamic Jurist)",
    keyCapabilities: [
      "2,000+ ballistic/cruise missiles (Shahab, Fattah, Paveh)",
      "Shahed-136/238 loitering munitions (drones)",
      "Quds Force — proxy coordination across region",
      "Underground missile cities (hardened silos)",
      "70%+ enriched uranium stockpile as leverage",
    ],
    recentActivity: "Apr 2024: First direct attack on Israel (True Promise I) — 320+ projectiles. Oct 2024: True Promise II — 180 ballistic missiles. Ongoing Quds Force support to Hezbollah, Hamas, Houthis.",
    threat: "CRITICAL",
  },
  {
    id: "mossad",
    name: "Mossad",
    fullName: "HaMossad leModi'in uleTafkidim Meyuḥadim",
    country: "Israel",
    type: "intel",
    color: "#a78bfa",
    strength: 10,
    capability: "World's premier foreign intelligence & covert action",
    personnel: "~7,000 (est.)",
    founded: "1949",
    leadership: "Director: Eli Cohen (2025)",
    ideology: "Active prevention — 'Never Again' through intelligence superiority",
    keyCapabilities: [
      "HUMINT networks inside Iran, Lebanon, Gaza",
      "Assassination operations (Haniyeh, IRGC scientists)",
      "Sabotage of Iranian nuclear infrastructure (Natanz)",
      "Pegasus-class cyber intelligence collection",
      "Supply chain interdiction of missile components",
    ],
    recentActivity: "Jul 2024: Hamas chief Haniyeh killed in Tehran. Sep 2024: Pager/radio detonation devastated Hezbollah command. Jan 2025: Ceasefire mediation for Gaza hostage deal. Ongoing IRGC supply-line interdiction in Syria.",
    threat: "CRITICAL",
  },
  {
    id: "hezbollah",
    name: "Hezbollah",
    fullName: "Ḥizb Allāh — Party of God",
    country: "Lebanon",
    type: "proxy",
    color: "#d97706",
    strength: 7,
    capability: "150,000+ rockets; state-within-a-state in Lebanon",
    personnel: "~100,000 fighters",
    founded: "1982",
    leadership: "Secretary-General: Naim Qassem (post-Nasrallah)",
    ideology: "Shi'a Islamism; Iranian-aligned resistance axis",
    keyCapabilities: [
      "150,000–200,000 rockets and missiles",
      "Precision-guided munitions (Fateh-110 from Iran)",
      "Drone fleet including attack UAVs",
      "Tunnel network in southern Lebanon",
      "Battle-hardened from Syrian Civil War",
    ],
    recentActivity: "Sep 2024: Secretary-General Nasrallah killed in IDF airstrike on Beirut suburb. Thousands of fighters killed. Pager attack devastated command structure. Ongoing rocket fire at northern Israel.",
    threat: "HIGH",
  },
  {
    id: "hamas",
    name: "Hamas",
    fullName: "Ḥarakat al-Muqāwamah al-ʾIslāmiyyah",
    country: "Gaza Strip",
    type: "proxy",
    color: "#f97316",
    strength: 5,
    capability: "Urban warfare, tunnel network, Oct 7 breakthrough",
    personnel: "~30,000–40,000 (pre-war est.)",
    founded: "1987",
    leadership: "Military Wing: Mohammed Deif (killed Jul 2024); post-Sinwar leadership restructuring",
    ideology: "Sunni Islamism; Palestinian nationalism",
    keyCapabilities: [
      "Extensive tunnel network under Gaza",
      "Qassam rockets (short-range, mass production)",
      "Anti-tank guided missiles (RPG-29, Kornet)",
      "IED manufacturing and urban ambush tactics",
      "Hostage-taking as strategic leverage",
    ],
    recentActivity: "Oct 7, 2023: Mass attack on Israel — 1,200 killed, 251 taken hostage. Oct 2024: Sinwar killed in Rafah. Jan 2025: Phase 1 ceasefire with hostage-prisoner exchange. Leadership structure significantly degraded; political bureau reconstituting.",
    threat: "HIGH",
  },
  {
    id: "houthis",
    name: "Houthis",
    fullName: "Ansar Allah — Supporters of God",
    country: "Yemen",
    type: "proxy",
    color: "#fbbf24",
    strength: 5,
    capability: "Anti-ship missiles, drone swarms, Red Sea control threat",
    personnel: "~200,000 fighters",
    founded: "1992",
    leadership: "Supreme Commander: Abdul-Malik al-Houthi",
    ideology: "Zaidiyyah Shi'a Islamism; anti-US, anti-Israel",
    keyCapabilities: [
      "Anti-ship ballistic missiles (Asef / Nusuk)",
      "Shahed-pattern drones from Iran",
      "Control of Bab-el-Mandeb strait (Red Sea chokepoint)",
      "Kamikaze USVs (unmanned surface vehicles)",
      "Land forces experienced from Yemeni civil war",
    ],
    recentActivity: "Nov 2023–present: 100+ attacks on commercial shipping in Red Sea. 2025: US military strikes on Houthi leadership and infrastructure intensified under Operation Rough Rider; multiple senior commanders killed. Continued long-range ballistic missiles toward Israel.",
    threat: "MED",
  },
  {
    id: "pmf",
    name: "PMF",
    fullName: "Popular Mobilization Forces (Hashd al-Shaabi)",
    country: "Iraq",
    type: "proxy",
    color: "#22d3ee",
    strength: 5,
    capability: "Drone and rocket attacks on US/Israel assets from Iraq",
    personnel: "~200,000 across factions",
    founded: "2014",
    leadership: "Abu Mahdi al-Muhandis killed 2020; multiple faction commanders",
    ideology: "Shi'a Islamism; Iranian-aligned; Iraqi sovereignty",
    keyCapabilities: [
      "Drone swarms targeting US bases in Iraq/Syria",
      "Katyusha rocket batteries",
      "Cross-border attack facilitation for IRGC",
      "Intelligence collection on US/Israeli assets",
      "Deep political integration into Iraqi state",
    ],
    recentActivity: "Oct 2023–present: Hundreds of drone attacks on US forces in Iraq and Syria. Jan 2024: Tower 22 attack in Jordan killed 3 US soldiers. US retaliatory strikes on PMF leadership.",
    threat: "MED",
  },
];

const threatColors: Record<string, string> = {
  CRITICAL: "#e03e3e",
  HIGH: "#f97316",
  MED: "#fbbf24",
  LOW: "#22c55e",
};

const typeLabel: Record<string, string> = {
  state: "STATE MILITARY",
  proxy: "PROXY FORCE",
  intel: "INTELLIGENCE",
};

export default function ActorsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: "64px", paddingBottom: "4rem" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "2.5rem 1.5rem 0" }}>
        <Link
          href="/"
          style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.1em", color: "var(--text-muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "2rem" }}
        >
          ← Globe
        </Link>

        <h1 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, color: "#e2e8f0", marginBottom: "6px" }}>
          Conflict Actors
        </h1>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: "2rem" }}>
          Intelligence profiles · {ACTORS.length} key actors in the Israel–Iran conflict theater
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))", gap: "12px" }}>
          {ACTORS.map((actor) => (
            <div
              key={actor.id}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderTop: `2px solid ${actor.color}`,
                borderRadius: "var(--radius)",
                padding: "1.25rem",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Background glow */}
              <div
                style={{
                  position: "absolute",
                  top: "-20px",
                  right: "-20px",
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${actor.color}08 0%, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />

              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "18px", fontWeight: 700, color: actor.color, letterSpacing: "0.04em" }}>
                      {actor.name}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", letterSpacing: "0.12em", color: actor.color, background: `${actor.color}15`, border: `1px solid ${actor.color}33`, borderRadius: "2px", padding: "1px 5px" }}>
                      {typeLabel[actor.type]}
                    </span>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "#3d4f63", letterSpacing: "0.04em" }}>
                    {actor.fullName}
                  </div>
                </div>

                {/* Threat badge */}
                <div
                  style={{
                    marginLeft: "auto",
                    flexShrink: 0,
                    padding: "4px 10px",
                    background: `${threatColors[actor.threat]}15`,
                    border: `1px solid ${threatColors[actor.threat]}33`,
                    borderRadius: "3px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "#3d4f63", letterSpacing: "0.1em" }}>THREAT</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 700, color: threatColors[actor.threat], letterSpacing: "0.08em" }}>{actor.threat}</div>
                </div>
              </div>

              {/* Strength bar */}
              <div style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "#2d3f54", letterSpacing: "0.1em" }}>COMBAT STRENGTH</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: actor.color, fontWeight: 700 }}>{actor.strength}/10</span>
                </div>
                <div style={{ height: "4px", background: "rgba(10,14,20,0.6)", borderRadius: "2px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${actor.strength * 10}%`,
                      height: "100%",
                      background: `linear-gradient(to right, ${actor.color}99, ${actor.color})`,
                      borderRadius: "2px",
                    }}
                  />
                </div>
              </div>

              {/* Quick facts */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "12px" }}>
                {[
                  { label: "Country", value: actor.country },
                  { label: "Founded", value: actor.founded },
                  { label: "Personnel", value: actor.personnel },
                  { label: "Leadership", value: actor.leadership },
                ].map((f) => (
                  <div key={f.label} style={{ background: "rgba(10,14,20,0.5)", borderRadius: "3px", padding: "6px 8px" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "#2d3f54", letterSpacing: "0.1em", marginBottom: "2px" }}>{f.label.toUpperCase()}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "#94a3b8", lineHeight: 1.4 }}>{f.value}</div>
                  </div>
                ))}
              </div>

              {/* Key capabilities */}
              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", letterSpacing: "0.12em", color: "#2d3f54", textTransform: "uppercase", marginBottom: "6px" }}>Key Capabilities</div>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "3px" }}>
                  {actor.keyCapabilities.slice(0, 4).map((cap, i) => (
                    <li key={i} style={{ display: "flex", gap: "8px", fontFamily: "var(--font-mono)", fontSize: "9px", color: "#6b7a8d", lineHeight: 1.5 }}>
                      <span style={{ color: actor.color, flexShrink: 0, marginTop: "1px" }}>›</span>
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recent activity */}
              <div
                style={{
                  padding: "8px 10px",
                  background: "rgba(10,14,20,0.6)",
                  border: `1px solid rgba(${actor.color === "#60a5fa" ? "96,165,250" : actor.color === "#e03e3e" ? "224,62,62" : "30,42,56"},0.15)`,
                  borderRadius: "3px",
                  borderLeft: `2px solid ${actor.color}`,
                }}
              >
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "#2d3f54", letterSpacing: "0.1em", marginBottom: "4px" }}>RECENT ACTIVITY</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "#6b7a8d", lineHeight: 1.6 }}>{actor.recentActivity}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "1.5rem", fontFamily: "var(--font-mono)", fontSize: "8px", color: "#1e2a38", letterSpacing: "0.06em", textAlign: "center" }}>
          OPEN-SOURCE INTELLIGENCE ASSESSMENT · SOURCES: IISS, CSIS, ACLED, SIPRI · UPDATED FEB 2026
        </div>
      </div>
    </div>
  );
}
