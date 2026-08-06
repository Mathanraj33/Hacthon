import type {
  Recommendation,
  SensorReading,
  SustainabilityMetric,
  SustainabilityScore,
} from "@/types/sustainability";

/**
 * Mock data layer. Every function is async so a real API client can be
 * dropped in later without touching the components that consume it.
 */

const metrics: SustainabilityMetric[] = [
  {
    id: "air-quality",
    label: "Air Quality",
    value: 62,
    unit: "AQI",
    change: -8.4,
    trend: "down",
    status: "moderate",
    description: "PM2.5 averaged across 24 monitoring stations.",
    progress: 62,
  },
  {
    id: "waste",
    label: "Waste Management",
    value: 71,
    unit: "% diverted",
    change: 5.1,
    trend: "up",
    status: "good",
    description: "Share of municipal waste recycled or composted.",
    progress: 71,
  },
  {
    id: "water",
    label: "Water Management",
    value: 88,
    unit: "% treated",
    change: 2.3,
    trend: "up",
    status: "good",
    description: "Wastewater treated before discharge citywide.",
    progress: 88,
  },
  {
    id: "energy",
    label: "Energy Usage",
    value: 412,
    unit: "GWh",
    change: -3.7,
    trend: "down",
    status: "moderate",
    description: "Monthly consumption, 34% from renewable sources.",
    progress: 58,
  },
  {
    id: "traffic",
    label: "Traffic Analysis",
    value: 27,
    unit: "min avg",
    change: 6.2,
    trend: "up",
    status: "poor",
    description: "Average peak-hour commute across primary corridors.",
    progress: 41,
  },
  {
    id: "green-cover",
    label: "Green Cover",
    value: 34,
    unit: "% area",
    change: 1.4,
    trend: "up",
    status: "moderate",
    description: "Tree canopy and park coverage of the urban footprint.",
    progress: 34,
  },
];

const score: SustainabilityScore = {
  score: 76,
  grade: "B+",
  city: "Metro District",
  updatedAt: new Date().toISOString(),
  pillars: [
    { label: "Environment", value: 81 },
    { label: "Mobility", value: 64 },
    { label: "Resources", value: 79 },
    { label: "Livability", value: 74 },
  ],
};

const recommendations: Recommendation[] = [
  {
    id: "rec-1",
    title: "Expand low-emission zone to the east corridor",
    detail: "Projected 11% reduction in PM2.5 during peak hours within two quarters.",
    impact: "high",
    category: "Air Quality",
  },
  {
    id: "rec-2",
    title: "Add 4 organic waste drop-off hubs",
    detail: "Raises diversion rate above the 75% national benchmark.",
    impact: "medium",
    category: "Waste",
  },
  {
    id: "rec-3",
    title: "Retrofit street lighting in districts 3 and 7",
    detail: "Estimated annual saving of 6.2 GWh and 2,100 tonnes CO2e.",
    impact: "high",
    category: "Energy",
  },
  {
    id: "rec-4",
    title: "Plant 12,000 shade trees along transit routes",
    detail: "Reduces surface heat island effect by up to 2.4 degrees C.",
    impact: "medium",
    category: "Green Cover",
  },
];

const readings: SensorReading[] = [
  {
    id: "z-01",
    zone: "Central Business",
    metric: "PM2.5",
    value: "48 ug/m3",
    status: "moderate",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "z-02",
    zone: "Riverside",
    metric: "Water turbidity",
    value: "1.2 NTU",
    status: "good",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "z-03",
    zone: "North Industrial",
    metric: "NO2",
    value: "92 ppb",
    status: "poor",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "z-04",
    zone: "Greenbelt",
    metric: "Canopy cover",
    value: "61%",
    status: "good",
    updatedAt: new Date().toISOString(),
  },
];

export async function getMetrics(): Promise<SustainabilityMetric[]> {
  return metrics;
}

export async function getSustainabilityScore(): Promise<SustainabilityScore> {
  return score;
}

export async function getRecommendations(): Promise<Recommendation[]> {
  return recommendations;
}

export async function getSensorReadings(): Promise<SensorReading[]> {
  return readings;
}