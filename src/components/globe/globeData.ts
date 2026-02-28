export interface GlobeMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  subLabel: string;
  color: string;
  radius: number;
  altitude: number;
}

export interface GlobeArc {
  id: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  label: string;
  dashLength: number;
  dashGap: number;
  animateTime: number;
}

export const FOCUS_MARKERS: GlobeMarker[] = [
  {
    id: "jerusalem",
    lat: 31.7683,
    lng: 35.2137,
    label: "Jerusalem",
    subLabel: "IDF HQ / Capital",
    color: "#60a5fa",
    radius: 0.5,
    altitude: 0.01,
  },
  {
    id: "tel-aviv",
    lat: 32.0853,
    lng: 34.7818,
    label: "Tel Aviv",
    subLabel: "Israel — Military Center",
    color: "#60a5fa",
    radius: 0.4,
    altitude: 0.01,
  },
  {
    id: "tehran",
    lat: 35.6892,
    lng: 51.389,
    label: "Tehran",
    subLabel: "Iran — IRGC HQ",
    color: "#e03e3e",
    radius: 0.55,
    altitude: 0.01,
  },
  {
    id: "beirut",
    lat: 33.8938,
    lng: 35.5018,
    label: "Beirut",
    subLabel: "Lebanon — Hezbollah",
    color: "#d97706",
    radius: 0.4,
    altitude: 0.01,
  },
  {
    id: "gaza",
    lat: 31.5,
    lng: 34.47,
    label: "Gaza Strip",
    subLabel: "Hamas / PIJ",
    color: "#f97316",
    radius: 0.35,
    altitude: 0.01,
  },
  {
    id: "sanaa",
    lat: 15.3694,
    lng: 44.191,
    label: "Sanaa",
    subLabel: "Yemen — Houthis",
    color: "#fbbf24",
    radius: 0.4,
    altitude: 0.01,
  },
  {
    id: "baghdad",
    lat: 33.3152,
    lng: 44.3661,
    label: "Baghdad",
    subLabel: "Iraq — PMF",
    color: "#d97706",
    radius: 0.4,
    altitude: 0.01,
  },
  {
    id: "damascus",
    lat: 33.5102,
    lng: 36.2913,
    label: "Damascus",
    subLabel: "Syria — IRGC presence",
    color: "#a78bfa",
    radius: 0.4,
    altitude: 0.01,
  },
  {
    id: "isfahan",
    lat: 32.6539,
    lng: 51.668,
    label: "Isfahan",
    subLabel: "Iran — Natanz nuclear site",
    color: "#e03e3e",
    radius: 0.35,
    altitude: 0.01,
  },
];

// Animated conflict arcs between actors
export const CONFLICT_ARCS: GlobeArc[] = [
  {
    id: "iran-israel",
    startLat: 35.6892,
    startLng: 51.389,
    endLat: 31.7683,
    endLng: 35.2137,
    color: "rgba(224,62,62,0.8)",
    label: "Iran → Israel (Ballistic corridor)",
    dashLength: 0.3,
    dashGap: 0.15,
    animateTime: 3000,
  },
  {
    id: "lebanon-israel",
    startLat: 33.8938,
    startLng: 35.5018,
    endLat: 32.0853,
    endLng: 34.7818,
    color: "rgba(217,119,6,0.85)",
    label: "Hezbollah → Israel (Rockets)",
    dashLength: 0.4,
    dashGap: 0.1,
    animateTime: 1500,
  },
  {
    id: "gaza-israel",
    startLat: 31.5,
    startLng: 34.47,
    endLat: 31.7683,
    endLng: 35.2137,
    color: "rgba(249,115,22,0.85)",
    label: "Hamas → Israel (Rockets)",
    dashLength: 0.5,
    dashGap: 0.1,
    animateTime: 1200,
  },
  {
    id: "iran-yemen",
    startLat: 35.6892,
    startLng: 51.389,
    endLat: 15.3694,
    endLng: 44.191,
    color: "rgba(224,62,62,0.45)",
    label: "Iran → Houthis (Arms supply)",
    dashLength: 0.25,
    dashGap: 0.2,
    animateTime: 5000,
  },
  {
    id: "iran-iraq",
    startLat: 35.6892,
    startLng: 51.389,
    endLat: 33.3152,
    endLng: 44.3661,
    color: "rgba(224,62,62,0.4)",
    label: "Iran → PMF (Arms supply)",
    dashLength: 0.25,
    dashGap: 0.2,
    animateTime: 4500,
  },
  {
    id: "iran-syria",
    startLat: 35.6892,
    startLng: 51.389,
    endLat: 33.5102,
    endLng: 36.2913,
    color: "rgba(224,62,62,0.4)",
    label: "Iran → Syria (Supply corridor)",
    dashLength: 0.25,
    dashGap: 0.2,
    animateTime: 4000,
  },
  {
    id: "yemen-redsea",
    startLat: 15.3694,
    startLng: 44.191,
    endLat: 15.0,
    endLng: 42.5,
    color: "rgba(251,191,36,0.7)",
    label: "Houthis → Red Sea (Shipping attacks)",
    dashLength: 0.35,
    dashGap: 0.15,
    animateTime: 2000,
  },
];

// Country numeric IDs from Natural Earth / world-atlas for polygon highlights
// ISO 3166-1 numeric codes
export const HIGHLIGHT_COUNTRY_IDS = new Set([
  376, // Israel
  364, // Iran
  422, // Lebanon
  887, // Yemen
  368, // Iraq
  760, // Syria
  275, // Palestinian Territory
  682, // Saudi Arabia (context)
]);

// Initial point of view for homepage
export const HOME_POV = { lat: 32, lng: 40, altitude: 2.2 };
// Focus point of view for /focus page
export const FOCUS_POV = { lat: 32, lng: 37, altitude: 1.8 };
