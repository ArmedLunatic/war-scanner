export interface ContextSection {
  id: string;
  title: string;
  period: string;
  summary: string;
  keyFacts: string[];
  color: string;
}

export const ISRAEL_IRAN_CONTEXT: ContextSection[] = [
  {
    id: "revolution",
    title: "1979 Islamic Revolution",
    period: "1979",
    summary:
      "Iran's revolution ended a 30-year strategic alliance with Israel. The Shah's Iran had been one of Israel's key regional partners; the new theocratic republic declared Israel an illegitimate state and severed all ties.",
    keyFacts: [
      "Iran was the second Muslim-majority country to recognize Israel (1950)",
      "Shah-era Iran supplied ~40% of Israel's oil needs",
      "Ayatollah Khomeini declared Israel an 'enemy of Islam'",
      "Iran began supporting Palestinian militant groups immediately after",
      "Israeli embassy in Tehran converted to Palestinian embassy",
    ],
    color: "#e03e3e",
  },
  {
    id: "proxy-network",
    title: "Iran's Proxy Network",
    period: "1982 – Present",
    summary:
      "Iran built an 'Axis of Resistance' — a network of armed proxies encircling Israel. Hezbollah (Lebanon), Hamas/PIJ (Gaza), Houthis (Yemen), and Iraqi PMF all receive Iranian funding, weapons, and training.",
    keyFacts: [
      "Hezbollah founded 1982 with IRGC support during Israeli invasion of Lebanon",
      "Hamas receives an estimated $70–100M/year from Iran",
      "Houthis (Ansar Allah) declared war on Israel after Oct 7, 2023",
      "Iraqi PMF groups have fired 100+ drones at US bases and Israel since 2023",
      "Iran's 'forward defense' strategy: fight Israel at its borders, not Iran's",
    ],
    color: "#d97706",
  },
  {
    id: "nuclear",
    title: "Iran's Nuclear Program",
    period: "2002 – Present",
    summary:
      "Iran's clandestine enrichment program, revealed in 2002, became the central axis of the Israel-Iran confrontation. Israel has conducted multiple covert operations against Iranian nuclear infrastructure and scientists.",
    keyFacts: [
      "Natanz enrichment facility revealed by opposition group MEK in 2002",
      "Stuxnet worm (attributed to US/Israel) destroyed ~1,000 centrifuges in 2010",
      "Iran enriching to 60% purity — one step below weapons-grade (90%)",
      "Israel assassinated top nuclear scientist Mohsen Fakhrizadeh in 2020",
      "Mossad seized Iran's nuclear archive (100,000 documents) from Tehran in 2018",
    ],
    color: "#a78bfa",
  },
  {
    id: "jcpoa",
    title: "JCPOA & US Withdrawal",
    period: "2015 – 2018",
    summary:
      "The 2015 Iran nuclear deal (JCPOA) limited Iran's enrichment in exchange for sanctions relief. Israel opposed the deal as inadequate. Trump's 2018 US withdrawal accelerated Iran's nuclear program breakout timeline.",
    keyFacts: [
      "JCPOA signed July 2015 — P5+1 (US, UK, France, Russia, China, Germany) + Iran",
      "Iran limited to 3.67% enrichment and 300kg uranium stockpile",
      "Netanyahu addressed US Congress to oppose the deal (March 2015)",
      "Trump withdrew US from JCPOA in May 2018 ('maximum pressure')",
      "Iran now has 60kg of 60%-enriched uranium — enough for ~3 bombs if further enriched",
    ],
    color: "#60a5fa",
  },
  {
    id: "direct-strikes",
    title: "2024 Direct Military Strikes",
    period: "April – October 2024",
    summary:
      "For the first time in history, Iran launched direct ballistic missile and drone strikes on Israeli territory, and Israel struck inside Iran. The conflict escalated from proxy warfare to direct state-on-state exchange.",
    keyFacts: [
      "April 1: Israel struck Iranian consulate in Damascus, killing 13 including 2 IRGC generals",
      "April 13–14: Iran launched 300+ drones, cruise missiles, and ballistic missiles at Israel",
      "99%+ of Iranian projectiles intercepted by Israel, US, UK, Jordan, Saudi Arabia",
      "April 19: Israel struck air defense radar near Isfahan, Iran — first strike inside Iran",
      "October 1: Iran fired 180+ ballistic missiles at Israel after Nasrallah assassination",
      "October 26: Israel struck military sites in Tehran, Khuzestan, and Ilam provinces",
    ],
    color: "#f97316",
  },
];
