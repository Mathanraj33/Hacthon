import type {
  AlertItem,
  Kpi,
  ModulePayload,
  PriorityRecommendation,
  ReportRecord,
  ScoreBreakdownRow,
  SeriesPoint,
  UserSettings,
} from "@/types/modules";
import { getLiveAirQuality } from "@/providers/live-air-quality.server";

/**
 * Mock data layer for the module pages. Each getter is async so a real API
 * client (or Lovable Cloud query) can replace the body without touching UI.
 */

const PRIMARY = "var(--color-primary)";
const SECONDARY = "var(--color-secondary)";
const ACCENT = "var(--color-accent)";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

function series(values: Record<string, number[]>): SeriesPoint[] {
  return months.map((name, i) => {
    const point: SeriesPoint = { name };
    for (const [key, arr] of Object.entries(values)) point[key] = arr[i] ?? 0;
    return point;
  });
}

function kpi(
  id: string,
  label: string,
  value: number,
  unit: string,
  change: number,
  status: Kpi["status"],
  description: string,
  progress: number,
): Kpi {
  return {
    id,
    label,
    value,
    unit,
    change,
    trend: change > 0 ? "up" : change < 0 ? "down" : "flat",
    status,
    description,
    progress,
  };
}

const airQuality: ModulePayload = {
  kpis: [
    kpi("aqi", "AQI Overview", 62, "AQI", -8.4, "moderate", "Citywide average across 24 stations.", 62),
    kpi("pm25", "PM2.5", 34, "ug/m3", -5.2, "moderate", "24h rolling mean, WHO guideline 15.", 55),
    kpi("pm10", "PM10", 58, "ug/m3", -2.1, "moderate", "Coarse particulate concentration.", 48),
    kpi("co2", "CO2", 438, "ppm", 1.6, "poor", "Ambient carbon dioxide near traffic corridors.", 38),
  ],
  trend: {
    title: "Pollution trend",
    description: "Monthly average concentration by pollutant.",
    kind: "line",
    data: series({
      pm25: [46, 44, 41, 39, 38, 36, 35, 34, 34],
      pm10: [72, 70, 66, 64, 62, 60, 59, 58, 58],
      aqi: [78, 75, 72, 70, 68, 66, 64, 63, 62],
    }),
    series: [
      { key: "pm25", label: "PM2.5", color: PRIMARY },
      { key: "pm10", label: "PM10", color: SECONDARY },
      { key: "aqi", label: "AQI", color: ACCENT },
    ],
  },
  table: {
    title: "Monitoring stations",
    description: "Latest readings from connected air quality sensors.",
    columns: ["Station", "Zone", "AQI", "PM2.5", "Status"],
    rows: [
      { id: "st-1", cells: ["ST-01 Civic Center", "Central Business", "72", "41 ug/m3"], status: "moderate" },
      { id: "st-2", cells: ["ST-04 Riverside Park", "Riverside", "38", "18 ug/m3"], status: "good" },
      { id: "st-3", cells: ["ST-09 North Works", "North Industrial", "118", "77 ug/m3"], status: "poor" },
      { id: "st-4", cells: ["ST-12 Greenbelt", "Greenbelt", "44", "21 ug/m3"], status: "good" },
      { id: "st-5", cells: ["ST-17 Harbour Road", "Port", "89", "52 ug/m3"], status: "moderate" },
    ],
  },
  suggestions: [
    "Extend the low-emission zone to the east corridor to cut peak PM2.5 by ~11%.",
    "Schedule street washing in North Industrial on days forecast above AQI 100.",
    "Add two reference-grade sensors near the port to reduce interpolation error.",
  ],
};

const water: ModulePayload = {
  kpis: [
    kpi("consumption", "Water Consumption", 168, "L/person/day", -3.1, "good", "Domestic demand per resident.", 68),
    kpi("quality", "Water Quality Index", 91, "WQI", 2.4, "good", "Composite of turbidity, pH and coliform.", 91),
    kpi("leakage", "Leakage / NRW", 14.6, "% loss", -1.8, "moderate", "Non-revenue water across the network.", 54),
    kpi("reservoir", "Reservoir Levels", 72, "% capacity", -4.5, "moderate", "Combined storage of 5 reservoirs.", 72),
  ],
  trend: {
    title: "Consumption and losses",
    description: "Monthly demand versus distribution losses.",
    kind: "area",
    data: series({
      consumption: [182, 179, 176, 174, 172, 171, 170, 169, 168],
      losses: [19, 18.4, 17.8, 17, 16.4, 15.8, 15.2, 14.9, 14.6],
    }),
    series: [
      { key: "consumption", label: "Consumption (L/p/d)", color: PRIMARY },
      { key: "losses", label: "Losses (%)", color: ACCENT },
    ],
  },
  secondaryTrend: {
    title: "Reservoir levels",
    description: "Storage capacity by month.",
    kind: "bar",
    data: series({ level: [88, 86, 84, 81, 79, 77, 75, 74, 72] }),
    series: [{ key: "level", label: "Capacity (%)", color: SECONDARY }],
  },
  table: {
    title: "Leakage detection",
    description: "Pressure anomalies flagged by the network model.",
    columns: ["Segment", "District", "Estimated loss", "Detected", "Status"],
    rows: [
      { id: "lk-1", cells: ["Main 14B", "District 3", "42 m3/day", "2 days ago"], status: "poor" },
      { id: "lk-2", cells: ["Feeder 7", "Riverside", "11 m3/day", "5 days ago"], status: "moderate" },
      { id: "lk-3", cells: ["Main 2A", "Old Town", "4 m3/day", "1 week ago"], status: "good" },
    ],
  },
  suggestions: [
    "Prioritise repair of Main 14B; payback is under six weeks at current tariffs.",
    "Install district metering in Old Town to localise residual losses.",
  ],
};

const waste: ModulePayload = {
  kpis: [
    kpi("recycling", "Recycling Rate", 71, "% diverted", 5.1, "good", "Recycled or composted municipal waste.", 71),
    kpi("collection", "Collection Status", 96, "% on time", 1.2, "good", "Routes completed within window.", 96),
    kpi("generation", "Waste Generation", 1.14, "kg/person/day", -2.4, "moderate", "Household waste generated daily.", 58),
    kpi("landfill", "Landfill Diversion", 29, "% to landfill", -4.8, "moderate", "Residual share sent to landfill.", 64),
  ],
  trend: {
    title: "Waste generation vs recycling",
    description: "Monthly tonnage and diversion rate.",
    kind: "bar",
    data: series({
      generated: [9800, 9720, 9650, 9600, 9540, 9480, 9420, 9380, 9330],
      recycled: [6100, 6180, 6250, 6360, 6480, 6520, 6600, 6650, 6720],
    }),
    series: [
      { key: "generated", label: "Generated (t)", color: PRIMARY },
      { key: "recycled", label: "Recycled (t)", color: SECONDARY },
    ],
  },
  table: {
    title: "Disposal analytics",
    description: "Stream-level destination and processing cost.",
    columns: ["Stream", "Volume", "Destination", "Cost / tonne", "Status"],
    rows: [
      { id: "ws-1", cells: ["Organics", "2,410 t", "Composting", "$38"], status: "good" },
      { id: "ws-2", cells: ["Paper & card", "1,880 t", "MRF", "$26"], status: "good" },
      { id: "ws-3", cells: ["Mixed residual", "2,700 t", "Landfill", "$74"], status: "poor" },
      { id: "ws-4", cells: ["Plastics", "1,340 t", "MRF", "$52"], status: "moderate" },
    ],
  },
  suggestions: [
    "Add four organic drop-off hubs to push diversion above the 75% benchmark.",
    "Re-route district 7 collection to cut idle mileage by 12%.",
  ],
};

const energy: ModulePayload = {
  kpis: [
    kpi("consumption", "Energy Consumption", 412, "GWh", -3.7, "moderate", "Monthly citywide consumption.", 58),
    kpi("renewable", "Renewable Share", 34, "%", 4.2, "moderate", "Solar, wind and hydro in the mix.", 34),
    kpi("intensity", "Grid Intensity", 268, "gCO2/kWh", -6.1, "moderate", "Average carbon intensity of supply.", 62),
    kpi("peak", "Peak Demand", 918, "MW", 1.1, "poor", "Highest half-hourly load this month.", 44),
  ],
  trend: {
    title: "Monthly energy trend",
    description: "Total consumption and renewable generation.",
    kind: "area",
    data: series({
      total: [448, 441, 436, 430, 426, 422, 419, 415, 412],
      renewable: [112, 118, 124, 129, 133, 136, 138, 140, 142],
    }),
    series: [
      { key: "total", label: "Total (GWh)", color: PRIMARY },
      { key: "renewable", label: "Renewable (GWh)", color: SECONDARY },
    ],
  },
  table: {
    title: "Building energy comparison",
    description: "Municipal portfolio ranked by intensity.",
    columns: ["Building", "Use", "kWh/m2/yr", "Change", "Status"],
    rows: [
      { id: "bd-1", cells: ["Central Hospital", "Healthcare", "312", "-4%"], status: "moderate" },
      { id: "bd-2", cells: ["City Hall", "Office", "148", "-9%"], status: "good" },
      { id: "bd-3", cells: ["Northside Depot", "Industrial", "388", "+3%"], status: "poor" },
      { id: "bd-4", cells: ["Public Library", "Civic", "96", "-12%"], status: "good" },
    ],
  },
  suggestions: [
    "Retrofit street lighting in districts 3 and 7 for ~6.2 GWh annual savings.",
    "Shift depot compressor load off peak to lower demand charges.",
  ],
};

const traffic: ModulePayload = {
  kpis: [
    kpi("congestion", "Congestion Level", 43, "% index", 6.2, "poor", "Delay versus free-flow travel.", 43),
    kpi("transit", "Public Transport Usage", 38, "% modal share", 2.7, "moderate", "Trips taken on transit.", 38),
    kpi("travel", "Average Travel Time", 27, "min", 4.1, "poor", "Peak-hour commute, primary corridors.", 41),
    kpi("incidents", "Road Incidents", 62, "this month", -9.4, "moderate", "Reported collisions and blockages.", 66),
  ],
  trend: {
    title: "Congestion and transit trend",
    description: "Monthly congestion index against transit share.",
    kind: "line",
    data: series({
      congestion: [36, 37, 38, 39, 40, 41, 42, 43, 43],
      transit: [31, 32, 33, 34, 35, 36, 37, 38, 38],
    }),
    series: [
      { key: "congestion", label: "Congestion index", color: ACCENT },
      { key: "transit", label: "Transit share (%)", color: SECONDARY },
    ],
  },
  table: {
    title: "Road status",
    description: "Live corridor conditions from traffic sensors.",
    columns: ["Corridor", "Speed", "Delay", "Volume", "Status"],
    rows: [
      { id: "rd-1", cells: ["Ring Road North", "24 km/h", "+11 min", "3,410 veh/h"], status: "poor" },
      { id: "rd-2", cells: ["Harbour Expressway", "58 km/h", "+2 min", "2,180 veh/h"], status: "good" },
      { id: "rd-3", cells: ["Central Avenue", "31 km/h", "+7 min", "2,940 veh/h"], status: "moderate" },
      { id: "rd-4", cells: ["East Link", "46 km/h", "+3 min", "1,760 veh/h"], status: "good" },
    ],
  },
  suggestions: [
    "Add signal priority for buses on Central Avenue to cut dwell delay.",
    "Trial a peak-hour bus lane on Ring Road North before capital works.",
  ],
};

const greenCover: ModulePayload = {
  kpis: [
    kpi("green-area", "Green Area", 34, "% of city", 1.4, "moderate", "Parks, canopy and open green space.", 34),
    kpi("canopy", "Tree Coverage", 28, "% canopy", 2.1, "moderate", "Tree canopy over the urban footprint.", 28),
    kpi("parks", "Park Access", 74, "% within 500m", 3.2, "good", "Residents near a public park.", 74),
    kpi("heat", "Heat Island Delta", 2.8, "deg C", -0.4, "moderate", "Urban to rural temperature difference.", 56),
  ],
  trend: {
    title: "Green cover growth",
    description: "Canopy and park area by month.",
    kind: "area",
    data: series({
      canopy: [25.4, 25.7, 26, 26.4, 26.8, 27.1, 27.5, 27.8, 28],
      parks: [68, 69, 70, 71, 72, 72.5, 73, 73.6, 74],
    }),
    series: [
      { key: "canopy", label: "Canopy (%)", color: SECONDARY },
      { key: "parks", label: "Park access (%)", color: PRIMARY },
    ],
  },
  table: {
    title: "Park distribution",
    description: "Green space per resident by district.",
    columns: ["District", "Parks", "Green area", "m2/resident", "Status"],
    rows: [
      { id: "gp-1", cells: ["Greenbelt", "12", "410 ha", "34"], status: "good" },
      { id: "gp-2", cells: ["Central Business", "3", "46 ha", "6"], status: "poor" },
      { id: "gp-3", cells: ["Riverside", "8", "188 ha", "21"], status: "good" },
      { id: "gp-4", cells: ["North Industrial", "2", "31 ha", "4"], status: "poor" },
    ],
  },
  suggestions: [
    "Plant 12,000 shade trees along transit routes to cut surface heat by 2.4 C.",
    "Convert two vacant lots in Central Business into pocket parks.",
  ],
};

const alerts: AlertItem[] = [
  {
    id: "al-1",
    title: "PM2.5 exceeded threshold at ST-09 North Works",
    zone: "North Industrial",
    severity: "critical",
    occurredAt: new Date(Date.now() - 42 * 60000).toISOString(),
  },
  {
    id: "al-2",
    title: "Pressure anomaly suggests leak on Main 14B",
    zone: "District 3",
    severity: "warning",
    occurredAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: "al-3",
    title: "Ring Road North congestion above 40% for 3 hours",
    zone: "Ring Road North",
    severity: "warning",
    occurredAt: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: "al-4",
    title: "Reservoir 2 storage dropped below 70%",
    zone: "Upper Catchment",
    severity: "info",
    occurredAt: new Date(Date.now() - 26 * 3600000).toISOString(),
  },
];

const priorityRecommendations: PriorityRecommendation[] = [
  {
    id: "pr-1",
    title: "Expand the low-emission zone to the east corridor",
    detail: "Restrict pre-Euro 5 freight during peak windows and add camera enforcement.",
    category: "Air Quality",
    priority: "critical",
    estimatedImpact: "-11% peak PM2.5",
    effort: "2 quarters",
    status: "in-review",
  },
  {
    id: "pr-2",
    title: "Retrofit street lighting in districts 3 and 7",
    detail: "Replace 18,400 sodium luminaires with dimmable LED and central control.",
    category: "Energy",
    priority: "high",
    estimatedImpact: "-6.2 GWh / yr",
    effort: "3 quarters",
    status: "approved",
  },
  {
    id: "pr-3",
    title: "Repair distribution main 14B",
    detail: "Highest-loss segment in the network model with a six-week payback.",
    category: "Water",
    priority: "high",
    estimatedImpact: "-42 m3/day loss",
    effort: "4 weeks",
    status: "proposed",
  },
  {
    id: "pr-4",
    title: "Add four organic waste drop-off hubs",
    detail: "Targets districts with the lowest source separation compliance.",
    category: "Waste",
    priority: "medium",
    estimatedImpact: "+4 pts diversion",
    effort: "1 quarter",
    status: "proposed",
  },
  {
    id: "pr-5",
    title: "Plant 12,000 shade trees along transit routes",
    detail: "Prioritises stops with the highest measured surface temperatures.",
    category: "Green Cover",
    priority: "medium",
    estimatedImpact: "-2.4 deg C surface heat",
    effort: "2 quarters",
    status: "proposed",
  },
  {
    id: "pr-6",
    title: "Bus signal priority on Central Avenue",
    detail: "Low-cost controller update across 14 intersections.",
    category: "Mobility",
    priority: "low",
    estimatedImpact: "-3 min transit time",
    effort: "6 weeks",
    status: "proposed",
  },
];

const reports: ReportRecord[] = [
  { id: "rp-1", name: "Q3 Sustainability Assessment", module: "All modules", period: "Q3 2026", generatedAt: new Date(Date.now() - 2 * 86400000).toISOString(), format: "PDF", status: "ready" },
  { id: "rp-2", name: "Air Quality Compliance Summary", module: "Air Quality", period: "Aug 2026", generatedAt: new Date(Date.now() - 6 * 86400000).toISOString(), format: "PDF", status: "ready" },
  { id: "rp-3", name: "Water Loss Register", module: "Water", period: "Aug 2026", generatedAt: new Date(Date.now() - 9 * 86400000).toISOString(), format: "CSV", status: "ready" },
  { id: "rp-4", name: "Waste Diversion Detail", module: "Waste", period: "Jul 2026", generatedAt: new Date(Date.now() - 20 * 86400000).toISOString(), format: "CSV", status: "processing" },
  { id: "rp-5", name: "Energy Portfolio Benchmark", module: "Energy", period: "H1 2026", generatedAt: new Date(Date.now() - 34 * 86400000).toISOString(), format: "PDF", status: "ready" },
  { id: "rp-6", name: "Mobility Corridor Study", module: "Mobility", period: "Q2 2026", generatedAt: new Date(Date.now() - 51 * 86400000).toISOString(), format: "PDF", status: "failed" },
];

const scoreHistory: SeriesPoint[] = series({
  score: [68, 69, 70, 71, 72, 73, 74, 75, 76],
  benchmark: [70, 70, 70, 71, 71, 71, 72, 72, 72],
});

const scoreBreakdown: ScoreBreakdownRow[] = [
  { category: "Air Quality", score: 68, benchmark: 72, weight: 20 },
  { category: "Water", score: 88, benchmark: 80, weight: 18 },
  { category: "Waste", score: 71, benchmark: 74, weight: 16 },
  { category: "Energy", score: 64, benchmark: 69, weight: 18 },
  { category: "Mobility", score: 57, benchmark: 66, weight: 16 },
  { category: "Green Cover", score: 74, benchmark: 70, weight: 12 },
];

const userSettings: UserSettings = {
  name: "Amara Osei",
  email: "amara.osei@metrodistrict.gov",
  organization: "Metro District Sustainability Office",
  role: "Programme Director",
  language: "en",
  notifications: { alerts: true, weeklyDigest: true, recommendations: false },
  preferences: { units: "metric", timezone: "UTC+01:00" },
};

export async function getAirQuality(): Promise<ModulePayload> {
  // Live data is layered on top of the mock payload so the page never
  // breaks: no API key configured yet → mock values, same as before.
  // CPCB_API_KEY / WAQI_API_TOKEN set → those KPI values become real.
  const live = await getLiveAirQuality().catch((error: unknown) => {
    console.warn("[getAirQuality] live fetch failed, showing mock data", error);
    return null;
  });

  if (!live) return airQuality;

  const liveValues: Record<string, number | undefined> = {
    aqi: live.aqi,
    pm25: live.pm25,
    pm10: live.pm10,
    co2: live.co2,
  };

  return {
    ...airQuality,
    kpis: airQuality.kpis.map((k) =>
      liveValues[k.id] !== undefined ? { ...k, value: liveValues[k.id] as number } : k,
    ),
  };
}
export async function getWaterManagement(): Promise<ModulePayload> {
  return water;
}
export async function getWasteManagement(): Promise<ModulePayload> {
  return waste;
}
export async function getEnergyUsage(): Promise<ModulePayload> {
  return energy;
}
export async function getTrafficMobility(): Promise<ModulePayload> {
  return traffic;
}
export async function getGreenCover(): Promise<ModulePayload> {
  return greenCover;
}
export async function getAlerts(): Promise<AlertItem[]> {
  return alerts;
}
export async function getPriorityRecommendations(): Promise<PriorityRecommendation[]> {
  return priorityRecommendations;
}
export async function getReports(): Promise<ReportRecord[]> {
  return reports;
}
export async function getScoreHistory(): Promise<SeriesPoint[]> {
  return scoreHistory;
}
export async function getScoreBreakdown(): Promise<ScoreBreakdownRow[]> {
  return scoreBreakdown;
}
export async function getUserSettings(): Promise<UserSettings> {
  return userSettings;
}
