export interface TimelineEvent {
  date: string;
  year: number;
  label: string;
  description: string;
  category: "nuclear" | "proxy" | "diplomatic" | "military" | "political";
  color: string;
}

export const CONFLICT_TIMELINE: TimelineEvent[] = [
  {
    date: "1979-02",
    year: 1979,
    label: "Islamic Revolution",
    description: "Khomeini seizes power; Iran-Israel alliance ends",
    category: "political",
    color: "#e03e3e",
  },
  {
    date: "1982-07",
    year: 1982,
    label: "Hezbollah Founded",
    description: "IRGC helps found Hezbollah in Lebanon; first proxy arm",
    category: "proxy",
    color: "#d97706",
  },
  {
    date: "2002-08",
    year: 2002,
    label: "Natanz Revealed",
    description: "MEK exposes Iran's secret enrichment facility",
    category: "nuclear",
    color: "#a78bfa",
  },
  {
    date: "2010-09",
    year: 2010,
    label: "Stuxnet",
    description: "US/Israel cyberweapon destroys ~1,000 Iranian centrifuges",
    category: "military",
    color: "#60a5fa",
  },
  {
    date: "2015-07",
    year: 2015,
    label: "JCPOA Signed",
    description: "Iran nuclear deal limits enrichment; Israel opposes",
    category: "diplomatic",
    color: "#22c55e",
  },
  {
    date: "2018-05",
    year: 2018,
    label: "US Withdraws",
    description: "Trump exits JCPOA; 'maximum pressure' campaign begins",
    category: "diplomatic",
    color: "#f97316",
  },
  {
    date: "2020-11",
    year: 2020,
    label: "Fakhrizadeh Killed",
    description: "Top Iranian nuclear scientist assassinated (Mossad)",
    category: "military",
    color: "#e03e3e",
  },
  {
    date: "2023-10-07",
    year: 2023,
    label: "Oct 7 Attack",
    description: "Hamas kills 1,200 Israelis; Iran-backed operation",
    category: "military",
    color: "#e03e3e",
  },
  {
    date: "2024-04-01",
    year: 2024,
    label: "Damascus Strike",
    description: "Israel strikes Iranian consulate; kills 2 IRGC generals",
    category: "military",
    color: "#f97316",
  },
  {
    date: "2024-04-13",
    year: 2024,
    label: "Iran Strikes Israel",
    description: "First direct Iranian attack: 300+ drones & missiles",
    category: "military",
    color: "#e03e3e",
  },
  {
    date: "2024-04-19",
    year: 2024,
    label: "Israel Strikes Iran",
    description: "Israel hits Isfahan air defense; first strike inside Iran",
    category: "military",
    color: "#60a5fa",
  },
  {
    date: "2024-10-01",
    year: 2024,
    label: "Iran Missile Salvo",
    description: "180+ ballistic missiles fired at Israel after Nasrallah killing",
    category: "military",
    color: "#e03e3e",
  },
  {
    date: "2024-10-26",
    year: 2024,
    label: "Israel Strikes Tehran",
    description: "Israel hits military sites in Tehran, Khuzestan, Ilam",
    category: "military",
    color: "#60a5fa",
  },
];
