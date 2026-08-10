// src/mocks/handlers.ts
// ⚠️  CONTRACT FROZEN — Day 3.
// These mocks EXACTLY match docs/api-contract.yaml.
// DO NOT change response shapes without team sign-off.
// M3 / M4 build against these. Any mismatch = integration failure.
import { http, HttpResponse } from "msw";

const BASE = "http://localhost:8000/api/v1";

// ─── Static mock data matching the frozen contract ────────────────────────────

const WARDS = [
  { id: "ward-001", name: "Anna Nagar",    city: "Chennai", state: "Tamil Nadu", lat: 13.0850, lon: 80.2101, population: 125000, area_km2: 8.5  },
  { id: "ward-002", name: "T. Nagar",      city: "Chennai", state: "Tamil Nadu", lat: 13.0418, lon: 80.2341, population: 180000, area_km2: 6.2  },
  { id: "ward-003", name: "Adyar",         city: "Chennai", state: "Tamil Nadu", lat: 13.0012, lon: 80.2565, population: 95000,  area_km2: 7.8  },
  { id: "ward-004", name: "Velachery",     city: "Chennai", state: "Tamil Nadu", lat: 12.9815, lon: 80.2180, population: 140000, area_km2: 9.1  },
  { id: "ward-005", name: "Tambaram",      city: "Chennai", state: "Tamil Nadu", lat: 12.9249, lon: 80.1000, population: 160000, area_km2: 12.3 },
  { id: "ward-006", name: "Perambur",      city: "Chennai", state: "Tamil Nadu", lat: 13.1158, lon: 80.2329, population: 110000, area_km2: 5.9  },
  { id: "ward-007", name: "Sholinganallur",city: "Chennai", state: "Tamil Nadu", lat: 12.9010, lon: 80.2279, population: 85000,  area_km2: 14.2 },
  { id: "ward-008", name: "Guindy",        city: "Chennai", state: "Tamil Nadu", lat: 13.0067, lon: 80.2206, population: 75000,  area_km2: 10.5 },
  { id: "ward-009", name: "Mylapore",      city: "Chennai", state: "Tamil Nadu", lat: 13.0368, lon: 80.2676, population: 130000, area_km2: 4.8  },
  { id: "ward-010", name: "Kodambakkam",   city: "Chennai", state: "Tamil Nadu", lat: 13.0521, lon: 80.2222, population: 115000, area_km2: 5.6  },
];

// Pre-built scores matching the seed data profiles
const SCORES: Record<string, ReturnType<typeof makeScore>> = {
  "ward-001": makeScore("ward-001", "Anna Nagar",    74.2, "B+", 81.2, 72.4, 79.6, 68.3, 76.1, 0.95),
  "ward-002": makeScore("ward-002", "T. Nagar",      52.8, "C+", 38.4, 61.2, 71.4, 55.2, 68.4, 0.95),
  "ward-003": makeScore("ward-003", "Adyar",         79.1, "B+", 86.3, 74.8, 72.1, 70.4, 81.2, 0.95),
  "ward-004": makeScore("ward-004", "Velachery",     66.4, "B-", 64.2, 68.4, 64.8, 66.1, 71.2, 0.95),
  "ward-005": makeScore("ward-005", "Tambaram",      61.2, "C+", 58.4, 62.1, 56.4, 58.2, 69.4, 0.95),
  "ward-006": makeScore("ward-006", "Perambur",      44.8, "C",  22.1, 55.4, 50.2, 60.4, 60.1, 0.95),
  "ward-007": makeScore("ward-007", "Sholinganallur",76.8, "B+", 78.4, 80.1, 58.2, 58.4, 84.2, 0.95),
  "ward-008": makeScore("ward-008", "Guindy",        57.4, "C+", 48.2, 65.4, 60.4, 68.2, 66.4, 0.95),
  "ward-009": makeScore("ward-009", "Mylapore",      71.2, "B",  68.4, 72.1, 81.4, 72.8, 74.4, 0.95),
  "ward-010": makeScore("ward-010", "Kodambakkam",   63.8, "B-", 60.4, 66.2, 68.4, 64.2, 68.4, 0.95),
};

function makeScore(
  ward_id: string, ward_name: string,
  total: number, grade: string,
  environmental_quality: number, infrastructure_efficiency: number,
  public_services: number, mobility: number, community_wellbeing: number,
  data_completeness: number,
) {
  return {
    ward_id, ward_name,
    date: new Date().toISOString().slice(0, 10),
    total, grade,
    pillar_scores: { environmental_quality, infrastructure_efficiency, public_services, mobility, community_wellbeing },
    data_completeness,
    computed_at: new Date().toISOString(),
  };
}

// Generate 90 days of history for a ward
function makeHistory(wardId: string, wardName: string, baseScore: number) {
  const history = Array.from({ length: 90 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (89 - i));
    const jitter = () => (Math.random() - 0.5) * 6;
    const total = Math.max(0, Math.min(100, baseScore + (i * 0.04) + jitter()));
    return {
      date: d.toISOString().slice(0, 10),
      total: +total.toFixed(2),
      environmental_quality: +Math.max(0, Math.min(100, total + jitter())).toFixed(2),
      infrastructure_efficiency: +Math.max(0, Math.min(100, total + jitter())).toFixed(2),
      public_services: +Math.max(0, Math.min(100, total + jitter())).toFixed(2),
      mobility: +Math.max(0, Math.min(100, total + jitter())).toFixed(2),
      community_wellbeing: +Math.max(0, Math.min(100, total + jitter())).toFixed(2),
    };
  });
  return { ward_id: wardId, ward_name: wardName, days: 90, history };
}

export const handlers = [

  // ── Health ────────────────────────────────────────────────────────────────
  http.get("http://localhost:8000/health", () =>
    HttpResponse.json({
      status: "ok", db_ok: true, row_count: 18000,
      contract: "frozen-day3", version: "1.0.0",
    })
  ),

  // ── Wards ─────────────────────────────────────────────────────────────────
  http.get(`${BASE}/wards`, () =>
    HttpResponse.json({ wards: WARDS, total: WARDS.length })
  ),

  http.get(`${BASE}/wards/:wardId`, ({ params }) => {
    const ward = WARDS.find(w => w.id === params.wardId);
    if (!ward) return HttpResponse.json({ detail: `Ward '${params.wardId}' not found.` }, { status: 404 });
    return HttpResponse.json(ward);
  }),

  // ── Indicators ────────────────────────────────────────────────────────────
  http.get(`${BASE}/indicators`, () =>
    HttpResponse.json({
      total: 20,
      indicators: [
        { id: "pm25",                label: "PM2.5 Concentration",     unit: "μg/m³",    pillar: "environmental_quality",     direction: "lower_better",  weight: 0.08, min_val: 0,   max_val: 250, who_target: 15,   source: "cpcb",      description: "Fine particulate matter." },
        { id: "aqi",                 label: "Air Quality Index",        unit: "AQI",      pillar: "environmental_quality",     direction: "lower_better",  weight: 0.06, min_val: 0,   max_val: 500, who_target: 50,   source: "cpcb",      description: "Composite AQI." },
        { id: "no2_ppb",             label: "Nitrogen Dioxide",         unit: "ppb",      pillar: "environmental_quality",     direction: "lower_better",  weight: 0.06, min_val: 0,   max_val: 200, who_target: 21,   source: "open-meteo",description: "NO2 concentration." },
        { id: "green_cover_pct",     label: "Green Cover",              unit: "%",        pillar: "environmental_quality",     direction: "higher_better", weight: 0.05, min_val: 0,   max_val: 60,  who_target: 30,   source: "osm",       description: "Tree canopy and park coverage." },
        { id: "co2_ppm",             label: "CO₂ Concentration",        unit: "ppm",      pillar: "environmental_quality",     direction: "lower_better",  weight: 0.05, min_val: 400, max_val: 800, who_target: 415,  source: "open-meteo",description: "Ambient CO₂ level." },
        { id: "water_treated_pct",   label: "Water Treatment Coverage", unit: "%",        pillar: "infrastructure_efficiency", direction: "higher_better", weight: 0.06, min_val: 0,   max_val: 100, who_target: 95,   source: "municipal", description: "Wastewater treated." },
        { id: "energy_renewable_pct",label: "Renewable Energy Share",   unit: "%",        pillar: "infrastructure_efficiency", direction: "higher_better", weight: 0.05, min_val: 0,   max_val: 100, who_target: 50,   source: "municipal", description: "Renewable energy fraction." },
        { id: "road_quality_score",  label: "Road Quality Index",       unit: "score",    pillar: "infrastructure_efficiency", direction: "higher_better", weight: 0.05, min_val: 0,   max_val: 100, who_target: 80,   source: "municipal", description: "Road surface quality 0–100." },
        { id: "water_quality_score", label: "Drinking Water Quality",   unit: "score",    pillar: "infrastructure_efficiency", direction: "higher_better", weight: 0.04, min_val: 0,   max_val: 100, who_target: 90,   source: "municipal", description: "Water safety score." },
        { id: "waste_diversion_pct", label: "Waste Diversion Rate",     unit: "%",        pillar: "public_services",          direction: "higher_better", weight: 0.06, min_val: 0,   max_val: 100, who_target: 75,   source: "municipal", description: "Waste recycled or composted." },
        { id: "hospitals_per_km2",   label: "Hospital Density",         unit: "per km²",  pillar: "public_services",          direction: "higher_better", weight: 0.07, min_val: 0,   max_val: 5,   who_target: 1.5,  source: "osm",       description: "Hospitals per km²." },
        { id: "schools_per_km2",     label: "School Density",           unit: "per km²",  pillar: "public_services",          direction: "higher_better", weight: 0.07, min_val: 0,   max_val: 10,  who_target: 3,    source: "osm",       description: "Schools per km²." },
        { id: "avg_commute_min",     label: "Average Commute Time",     unit: "minutes",  pillar: "mobility",                 direction: "lower_better",  weight: 0.05, min_val: 5,   max_val: 90,  who_target: 30,   source: "municipal", description: "Peak-hour commute." },
        { id: "transit_coverage_pct",label: "Public Transit Coverage",  unit: "%",        pillar: "mobility",                 direction: "higher_better", weight: 0.05, min_val: 0,   max_val: 100, who_target: 80,   source: "osm",       description: "% within 500m of transit." },
        { id: "road_density",        label: "Road Network Density",     unit: "km/km²",   pillar: "mobility",                 direction: "higher_better", weight: 0.03, min_val: 0,   max_val: 30,  who_target: 15,   source: "osm",       description: "Total road length per km²." },
        { id: "public_transport_trips",label:"Daily Transit Ridership", unit: "thousands",pillar: "mobility",                 direction: "higher_better", weight: 0.02, min_val: 0,   max_val: 500, who_target: 100,  source: "municipal", description: "Daily transit trips (thousands)." },
        { id: "green_space_per_capita",label:"Green Space per Capita",  unit: "m²/person",pillar: "community_wellbeing",      direction: "higher_better", weight: 0.05, min_val: 0,   max_val: 100, who_target: 9,    source: "osm",       description: "Public green space per resident." },
        { id: "literacy_rate",       label: "Literacy Rate",            unit: "%",        pillar: "community_wellbeing",      direction: "higher_better", weight: 0.05, min_val: 50,  max_val: 100, who_target: 95,   source: "census",    description: "Adult literacy rate." },
        { id: "park_area_pct",       label: "Park Coverage",            unit: "%",        pillar: "community_wellbeing",      direction: "higher_better", weight: 0.03, min_val: 0,   max_val: 30,  who_target: 10,   source: "osm",       description: "Ward area as public parks." },
        { id: "noise_db",            label: "Ambient Noise Level",      unit: "dB",       pillar: "community_wellbeing",      direction: "lower_better",  weight: 0.02, min_val: 30,  max_val: 90,  who_target: 55,   source: "municipal", description: "Average daytime noise level." },
      ],
    })
  ),

  // ── Scores — list all ────────────────────────────────────────────────────
  http.get(`${BASE}/scores`, () =>
    HttpResponse.json(Object.values(SCORES))
  ),

  // ── Scores — history (must be before /{ward_id}) ─────────────────────────
  http.get(`${BASE}/scores/history`, ({ request }) => {
    const url = new URL(request.url);
    const wardId = url.searchParams.get("ward_id") ?? "ward-001";
    const score = SCORES[wardId];
    if (!score) return HttpResponse.json({ detail: `Ward '${wardId}' not found.` }, { status: 404 });
    return HttpResponse.json(makeHistory(wardId, score.ward_name, score.total));
  }),

  // ── Scores — explain ─────────────────────────────────────────────────────
  http.get(`${BASE}/scores/:wardId/explain`, ({ params }) => {
    const score = SCORES[params.wardId as string];
    if (!score) return HttpResponse.json({ detail: `Ward '${params.wardId}' not found.` }, { status: 404 });

    const contributions = [
      { indicator_id: "green_cover_pct",      label: "Green Cover",              pillar: "environmental_quality",     raw_value: 29.0, unit: "%",        normalized_value: 48.3, weight: 0.05, contribution: 2.42, direction: "positive", status: "moderate" },
      { indicator_id: "water_treated_pct",    label: "Water Treatment Coverage", pillar: "infrastructure_efficiency", raw_value: 89.0, unit: "%",        normalized_value: 89.0, weight: 0.06, contribution: 5.34, direction: "positive", status: "good"     },
      { indicator_id: "hospitals_per_km2",    label: "Hospital Density",         pillar: "public_services",          raw_value: 2.1,  unit: "per km²",  normalized_value: 42.0, weight: 0.07, contribution: 2.94, direction: "positive", status: "moderate" },
      { indicator_id: "pm25",                 label: "PM2.5 Concentration",      pillar: "environmental_quality",     raw_value: 44.0, unit: "μg/m³",    normalized_value: 82.4, weight: 0.08, contribution: 6.59, direction: "positive", status: "good"     },
      { indicator_id: "avg_commute_min",      label: "Average Commute Time",     pillar: "mobility",                 raw_value: 32.0, unit: "minutes",  normalized_value: 67.1, weight: 0.05, contribution: 3.36, direction: "positive", status: "good"     },
      { indicator_id: "literacy_rate",        label: "Literacy Rate",            pillar: "community_wellbeing",      raw_value: 93.0, unit: "%",        normalized_value: 86.0, weight: 0.05, contribution: 4.30, direction: "positive", status: "good"     },
      { indicator_id: "transit_coverage_pct", label: "Public Transit Coverage",  pillar: "mobility",                 raw_value: 72.0, unit: "%",        normalized_value: 72.0, weight: 0.05, contribution: 3.60, direction: "positive", status: "good"     },
      { indicator_id: "noise_db",             label: "Ambient Noise Level",      pillar: "community_wellbeing",      raw_value: 62.0, unit: "dB",       normalized_value: 46.7, weight: 0.02, contribution: 0.93, direction: "negative", status: "moderate" },
      { indicator_id: "energy_renewable_pct", label: "Renewable Energy Share",   pillar: "infrastructure_efficiency",raw_value: 34.0, unit: "%",        normalized_value: 34.0, weight: 0.05, contribution: 1.70, direction: "negative", status: "poor"     },
      { indicator_id: "waste_diversion_pct",  label: "Waste Diversion Rate",     pillar: "public_services",          raw_value: 68.0, unit: "%",        normalized_value: 68.0, weight: 0.06, contribution: 4.08, direction: "positive", status: "good"     },
    ];

    return HttpResponse.json({
      ward_id: params.wardId,
      ward_name: score.ward_name,
      date: score.date,
      total: score.total,
      indicator_contributions: contributions,
      narrative: `${score.ward_name} scores ${score.total}/100 (Grade ${score.grade}). Key strengths: Water Treatment Coverage (89/100) and PM2.5 (82/100). Improvement areas: Renewable Energy Share (34/100) and Noise Level (47/100). Data completeness: 95%.`,
    });
  }),

  // ── Scores — single ward (must be after /history and /:wardId/explain) ──
  http.get(`${BASE}/scores/:wardId`, ({ params }) => {
    const score = SCORES[params.wardId as string];
    if (!score) return HttpResponse.json({ detail: `Ward '${params.wardId}' not found.` }, { status: 404 });
    return HttpResponse.json(score);
  }),

  // ── Recommendations ───────────────────────────────────────────────────────
  http.get(`${BASE}/recommendations/:wardId`, ({ params }) => {
    const score = SCORES[params.wardId as string];
    if (!score) return HttpResponse.json({ detail: `Ward '${params.wardId}' not found.` }, { status: 404 });
    return HttpResponse.json({
      ward_id: params.wardId,
      ward_name: score.ward_name,
      recommendations: [
        { id: `rec-${params.wardId}-001`, title: "Install rooftop solar on public buildings",       detail: "Displaces 6.2 GWh/year and reduces local CO₂ by ~2,100 tonnes.",              impact: "high",   category: "Infrastructure Efficiency", indicator: "energy_renewable_pct", projected_score_uplift: 2.5, cost_band: "medium", time_to_effect_months: 9  },
        { id: `rec-${params.wardId}-002`, title: "Expand low-emission zone to north corridor",      detail: "Projected 11% reduction in PM2.5 during peak hours within two quarters.",     impact: "high",   category: "Environmental Quality",     indicator: "pm25",                projected_score_uplift: 2.4, cost_band: "medium", time_to_effect_months: 3  },
        { id: `rec-${params.wardId}-003`, title: "Add 4 organic waste drop-off hubs",              detail: "Raises diversion rate above the 75% national benchmark.",                     impact: "medium", category: "Public Services",           indicator: "waste_diversion_pct", projected_score_uplift: 1.8, cost_band: "low",    time_to_effect_months: 2  },
        { id: `rec-${params.wardId}-004`, title: "Plant 12,000 shade trees along transit routes",  detail: "Reduces surface heat island effect by up to 2.4°C.",                          impact: "medium", category: "Environmental Quality",     indicator: "green_cover_pct",     projected_score_uplift: 1.5, cost_band: "low",    time_to_effect_months: 6  },
        { id: `rec-${params.wardId}-005`, title: "Enforce night-time noise ordinance",             detail: "Reduces residential noise exposure by 4–6 dB within 3 months.",               impact: "medium", category: "Community Wellbeing",       indicator: "noise_db",            projected_score_uplift: 0.8, cost_band: "low",    time_to_effect_months: 3  },
        { id: `rec-${params.wardId}-006`, title: "Add 6 new bus stops in residential zone",        detail: "Closes the last-mile gap and brings transit coverage above 80% SDG target.", impact: "medium", category: "Mobility",                  indicator: "transit_coverage_pct",projected_score_uplift: 0.7, cost_band: "low",    time_to_effect_months: 2  },
      ],
    });
  }),

  // ── Simulate ──────────────────────────────────────────────────────────────
  http.post(`${BASE}/simulate`, async ({ request }) => {
    const body = await request.json() as { ward_id: string; adjustments: Record<string, number> };
    const score = SCORES[body.ward_id];
    if (!score) return HttpResponse.json({ detail: `Ward '${body.ward_id}' not found.` }, { status: 404 });

    // Simple delta simulation for mocks
    const totalAdjKeys = Object.keys(body.adjustments ?? {}).length;
    const delta = totalAdjKeys > 0
      ? Object.values(body.adjustments).reduce((acc, v) => acc + v * 0.08, 0)
      : 0;
    const simTotal = Math.max(0, Math.min(100, score.total + delta));

    const gradeOf = (s: number) => s >= 90 ? "A+" : s >= 80 ? "A" : s >= 75 ? "B+" : s >= 70 ? "B" : s >= 65 ? "B-" : s >= 55 ? "C+" : s >= 45 ? "C" : s >= 35 ? "D" : "F";

    const ps = score.pillar_scores;
    return HttpResponse.json({
      ward_id: body.ward_id,
      ward_name: score.ward_name,
      baseline_score: score.total,
      simulated_score: +simTotal.toFixed(2),
      delta: +(simTotal - score.total).toFixed(2),
      grade_before: gradeOf(score.total),
      grade_after: gradeOf(simTotal),
      pillar_deltas: {
        environmental_quality:     { baseline: ps.environmental_quality,     simulated: +(ps.environmental_quality     + delta * 0.3).toFixed(2), delta: +(delta * 0.3).toFixed(2) },
        infrastructure_efficiency: { baseline: ps.infrastructure_efficiency, simulated: +(ps.infrastructure_efficiency + delta * 0.2).toFixed(2), delta: +(delta * 0.2).toFixed(2) },
        public_services:           { baseline: ps.public_services,           simulated: +(ps.public_services           + delta * 0.2).toFixed(2), delta: +(delta * 0.2).toFixed(2) },
        mobility:                  { baseline: ps.mobility,                  simulated: +(ps.mobility                  + delta * 0.15).toFixed(2),delta: +(delta * 0.15).toFixed(2)},
        community_wellbeing:       { baseline: ps.community_wellbeing,       simulated: +(ps.community_wellbeing       + delta * 0.15).toFixed(2),delta: +(delta * 0.15).toFixed(2)},
      },
      adjustments_applied: body.adjustments,
    });
  }),
];
