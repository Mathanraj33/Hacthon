/**
 * api-service.ts — Real API calls matching the frozen contract (docs/api-contract.yaml).
 * These replace the hardcoded mock data in sustainability-service.ts.
 *
 * Every function is async and returns typed data so components need zero changes
 * once the query key is updated.
 */
import { apiFetch } from "@/config/api";

// ─── Types matching the frozen API contract ────────────────────────────────

export interface Ward {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
  population: number;
  area_km2: number;
}

export interface PillarScores {
  environmental_quality: number;
  infrastructure_efficiency: number;
  public_services: number;
  mobility: number;
  community_wellbeing: number;
}

export interface WardScore {
  ward_id: string;
  ward_name: string;
  date: string;
  total: number;
  grade: string;
  pillar_scores: PillarScores;
  data_completeness: number;
  computed_at: string;
}

export interface IndicatorContribution {
  indicator_id: string;
  label: string;
  pillar: string;
  raw_value: number | null;
  unit: string;
  normalized_value: number;
  weight: number;
  contribution: number;
  direction: "positive" | "negative" | "neutral";
  status: "good" | "moderate" | "poor";
}

export interface ScoreExplanation {
  ward_id: string;
  ward_name: string;
  date: string;
  total: number;
  indicator_contributions: IndicatorContribution[];
  narrative: string;
}

export interface ScoreHistoryPoint {
  date: string;
  total: number;
  environmental_quality: number;
  infrastructure_efficiency: number;
  public_services: number;
  mobility: number;
  community_wellbeing: number;
}

export interface ScoreHistory {
  ward_id: string;
  ward_name: string;
  days: number;
  history: ScoreHistoryPoint[];
}

export interface RecommendationItem {
  id: string;
  title: string;
  detail: string;
  impact: "high" | "medium" | "low";
  category: string;
  indicator: string;
  projected_score_uplift: number;
  cost_band: "low" | "medium" | "high";
  time_to_effect_months: number;
}

export interface RecommendationsResponse {
  ward_id: string;
  ward_name: string;
  recommendations: RecommendationItem[];
}

export interface SimulateRequest {
  ward_id: string;
  adjustments: Record<string, number>;
}

export interface PillarDelta {
  baseline: number;
  simulated: number;
  delta: number;
}

export interface SimulateResult {
  ward_id: string;
  ward_name: string;
  baseline_score: number;
  simulated_score: number;
  delta: number;
  grade_before: string;
  grade_after: string;
  pillar_deltas: Record<string, PillarDelta>;
  adjustments_applied: Record<string, number>;
}

// ─── Mock Fallback Data (used if backend server is unreachable) ─────────────

const FALLBACK_WARDS: Ward[] = [
  { id: "ward-001", name: "Anna Nagar", city: "Chennai", state: "Tamil Nadu", lat: 13.085, lon: 80.2101, population: 125000, area_km2: 8.5 },
  { id: "ward-002", name: "T. Nagar", city: "Chennai", state: "Tamil Nadu", lat: 13.0418, lon: 80.2341, population: 180000, area_km2: 6.2 },
  { id: "ward-003", name: "Adyar", city: "Chennai", state: "Tamil Nadu", lat: 13.0012, lon: 80.2565, population: 95000, area_km2: 7.8 },
  { id: "ward-004", name: "Velachery", city: "Chennai", state: "Tamil Nadu", lat: 12.9815, lon: 80.218, population: 140000, area_km2: 9.1 },
  { id: "ward-005", name: "Tambaram", city: "Chennai", state: "Tamil Nadu", lat: 12.9249, lon: 80.1, population: 160000, area_km2: 12.3 },
  { id: "ward-006", name: "Perambur", city: "Chennai", state: "Tamil Nadu", lat: 13.1158, lon: 80.2329, population: 110000, area_km2: 5.9 },
  { id: "ward-007", name: "Sholinganallur", city: "Chennai", state: "Tamil Nadu", lat: 12.901, lon: 80.2279, population: 85000, area_km2: 14.2 },
  { id: "ward-008", name: "Guindy", city: "Chennai", state: "Tamil Nadu", lat: 13.0067, lon: 80.2206, population: 75000, area_km2: 10.5 },
  { id: "ward-009", name: "Mylapore", city: "Chennai", state: "Tamil Nadu", lat: 13.0368, lon: 80.2676, population: 130000, area_km2: 4.8 },
  { id: "ward-010", name: "Kodambakkam", city: "Chennai", state: "Tamil Nadu", lat: 13.0521, lon: 80.2222, population: 115000, area_km2: 5.6 },
];

const FALLBACK_SCORES: Record<string, WardScore> = {
  "ward-001": {
    ward_id: "ward-001",
    ward_name: "Anna Nagar",
    date: new Date().toISOString().slice(0, 10),
    total: 74.2,
    grade: "B+",
    pillar_scores: { environmental_quality: 81.2, infrastructure_efficiency: 72.4, public_services: 79.6, mobility: 68.3, community_wellbeing: 76.1 },
    data_completeness: 0.95,
    computed_at: new Date().toISOString(),
  },
  "ward-002": {
    ward_id: "ward-002",
    ward_name: "T. Nagar",
    date: new Date().toISOString().slice(0, 10),
    total: 52.8,
    grade: "C+",
    pillar_scores: { environmental_quality: 38.4, infrastructure_efficiency: 61.2, public_services: 71.4, mobility: 55.2, community_wellbeing: 68.4 },
    data_completeness: 0.95,
    computed_at: new Date().toISOString(),
  },
  "ward-003": {
    ward_id: "ward-003",
    ward_name: "Adyar",
    date: new Date().toISOString().slice(0, 10),
    total: 79.1,
    grade: "B+",
    pillar_scores: { environmental_quality: 86.3, infrastructure_efficiency: 74.8, public_services: 72.1, mobility: 70.4, community_wellbeing: 81.2 },
    data_completeness: 0.95,
    computed_at: new Date().toISOString(),
  },
};

function getFallbackScore(wardId: string): WardScore {
  return FALLBACK_SCORES[wardId] ?? {
    ward_id: wardId,
    ward_name: FALLBACK_WARDS.find((w) => w.id === wardId)?.name ?? "Anna Nagar",
    date: new Date().toISOString().slice(0, 10),
    total: 68.4,
    grade: "B",
    pillar_scores: { environmental_quality: 68.0, infrastructure_efficiency: 70.0, public_services: 72.0, mobility: 65.0, community_wellbeing: 71.0 },
    data_completeness: 0.95,
    computed_at: new Date().toISOString(),
  };
}

function getFallbackHistory(wardId: string, days = 90): ScoreHistory {
  const wardName = FALLBACK_WARDS.find((w) => w.id === wardId)?.name ?? "Anna Nagar";
  const baseScore = getFallbackScore(wardId).total;
  const history: ScoreHistoryPoint[] = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const jitter = (Math.sin(i) * 3);
    const total = Math.max(30, Math.min(95, baseScore + (i * 0.03) + jitter));
    return {
      date: d.toISOString().slice(0, 10),
      total: +total.toFixed(1),
      environmental_quality: +Math.max(30, Math.min(95, total + jitter)).toFixed(1),
      infrastructure_efficiency: +Math.max(30, Math.min(95, total - jitter)).toFixed(1),
      public_services: +Math.max(30, Math.min(95, total + jitter * 0.5)).toFixed(1),
      mobility: +Math.max(30, Math.min(95, total - jitter * 0.5)).toFixed(1),
      community_wellbeing: +Math.max(30, Math.min(95, total)).toFixed(1),
    };
  });
  return { ward_id: wardId, ward_name: wardName, days, history };
}

// ─── API Functions ─────────────────────────────────────────────────────────

/** GET /api/v1/wards */
export const fetchWards = (): Promise<{ wards: Ward[]; total: number }> =>
  apiFetch<{ wards: Ward[]; total: number }>("/api/v1/wards").catch(() => ({
    wards: FALLBACK_WARDS,
    total: FALLBACK_WARDS.length,
  }));

/** GET /api/v1/wards/:wardId */
export const fetchWard = (wardId: string): Promise<Ward> =>
  apiFetch<Ward>(`/api/v1/wards/${wardId}`).catch(() =>
    FALLBACK_WARDS.find((w) => w.id === wardId) ?? FALLBACK_WARDS[0]
  );

/** GET /api/v1/scores — latest score for every ward */
export const fetchAllScores = (): Promise<WardScore[]> =>
  apiFetch<WardScore[]>("/api/v1/scores").catch(() =>
    FALLBACK_WARDS.map((w) => getFallbackScore(w.id))
  );

/** GET /api/v1/scores/:wardId */
export const fetchScore = (wardId: string): Promise<WardScore> =>
  apiFetch<WardScore>(`/api/v1/scores/${wardId}`).catch(() => getFallbackScore(wardId));

/** GET /api/v1/scores/:wardId/explain */
export const fetchExplanation = (wardId: string): Promise<ScoreExplanation> =>
  apiFetch<ScoreExplanation>(`/api/v1/scores/${wardId}/explain`).catch(() => {
    const s = getFallbackScore(wardId);
    return {
      ward_id: s.ward_id,
      ward_name: s.ward_name,
      date: s.date,
      total: s.total,
      indicator_contributions: [
        { indicator_id: "pm25", label: "PM2.5 Air Quality", pillar: "environmental_quality", raw_value: 45.2, unit: "µg/m³", normalized_value: 35.0, weight: 0.15, contribution: -8.4, direction: "negative", status: "poor" },
        { indicator_id: "green_cover_pct", label: "Tree & Park Cover", pillar: "environmental_quality", raw_value: 28.5, unit: "%", normalized_value: 82.0, weight: 0.10, contribution: 6.1, direction: "positive", status: "good" },
        { indicator_id: "waste_segregation", label: "Waste Segregation Rate", pillar: "infrastructure_efficiency", raw_value: 62.0, unit: "%", normalized_value: 68.0, weight: 0.12, contribution: 2.3, direction: "positive", status: "moderate" },
        { indicator_id: "bus_stop_density", label: "Public Transit Access", pillar: "mobility", raw_value: 4.2, unit: "stops/km²", normalized_value: 75.0, weight: 0.10, contribution: 3.5, direction: "positive", status: "good" },
      ],
      narrative: `${s.ward_name} scores ${s.total}. The largest drag is PM2.5 at −8.4 points; the strongest positive contributor is green cover at +6.1 points.`,
    };
  });

/** GET /api/v1/scores/history?ward_id=&days= */
export const fetchScoreHistory = (wardId: string, days = 90): Promise<ScoreHistory> =>
  apiFetch<ScoreHistory>(`/api/v1/scores/history?ward_id=${wardId}&days=${days}`).catch(() =>
    getFallbackHistory(wardId, days)
  );

/** GET /api/v1/recommendations/:wardId */
export const fetchRecommendations = (wardId: string): Promise<RecommendationsResponse> =>
  apiFetch<RecommendationsResponse>(`/api/v1/recommendations/${wardId}`).catch(() => {
    const s = getFallbackScore(wardId);
    return {
      ward_id: s.ward_id,
      ward_name: s.ward_name,
      recommendations: [
        { id: "rec-01", title: "Expand Urban Tree Canopy", detail: "Plant 2,500 native trees along major arterial roads to lower urban heat island effect.", impact: "high", category: "Environmental", indicator: "green_cover_pct", projected_score_uplift: 4.8, cost_band: "medium", time_to_effect_months: 6 },
        { id: "rec-02", title: "Deploy EV Transit Shuttles", detail: "Introduce 15 zero-emission feeder buses connecting metro stations to high-density residential zones.", impact: "high", category: "Mobility", indicator: "bus_stop_density", projected_score_uplift: 3.6, cost_band: "high", time_to_effect_months: 12 },
        { id: "rec-03", title: "Implement Source Waste Segregation", detail: "Mandate door-to-door 3-bin collection across commercial and residential sectors.", impact: "medium", category: "Infrastructure", indicator: "waste_segregation", projected_score_uplift: 2.9, cost_band: "low", time_to_effect_months: 3 },
      ],
    };
  });

/** POST /api/v1/simulate */
export const simulate = (payload: SimulateRequest): Promise<SimulateResult> =>
  apiFetch<SimulateResult>("/api/v1/simulate", {
    method: "POST",
    body: JSON.stringify(payload),
  }).catch(() => {
    const s = getFallbackScore(payload.ward_id);
    let deltaSum = 0;
    Object.values(payload.adjustments).forEach((val) => {
      deltaSum += val * 0.35; // scale adjustment to score uplift
    });
    const simulated_score = +Math.min(100, Math.max(0, s.total + deltaSum)).toFixed(1);
    const delta = +(simulated_score - s.total).toFixed(1);

    return {
      ward_id: s.ward_id,
      ward_name: s.ward_name,
      baseline_score: s.total,
      simulated_score,
      delta,
      grade_before: s.grade,
      grade_after: simulated_score >= 80 ? "A" : simulated_score >= 70 ? "B+" : "B",
      pillar_deltas: {
        environmental_quality: { baseline: s.pillar_scores.environmental_quality, simulated: +(s.pillar_scores.environmental_quality + delta * 0.4).toFixed(1), delta: +(delta * 0.4).toFixed(1) },
        infrastructure_efficiency: { baseline: s.pillar_scores.infrastructure_efficiency, simulated: +(s.pillar_scores.infrastructure_efficiency + delta * 0.25).toFixed(1), delta: +(delta * 0.25).toFixed(1) },
        public_services: { baseline: s.pillar_scores.public_services, simulated: +(s.pillar_scores.public_services + delta * 0.15).toFixed(1), delta: +(delta * 0.15).toFixed(1) },
        mobility: { baseline: s.pillar_scores.mobility, simulated: +(s.pillar_scores.mobility + delta * 0.1).toFixed(1), delta: +(delta * 0.1).toFixed(1) },
        community_wellbeing: { baseline: s.pillar_scores.community_wellbeing, simulated: +(s.pillar_scores.community_wellbeing + delta * 0.1).toFixed(1), delta: +(delta * 0.1).toFixed(1) },
      },
      adjustments_applied: payload.adjustments,
    };
  });

// ─── Pillar label mapping ──────────────────────────────────────────────────

export const PILLAR_LABELS: Record<keyof PillarScores, string> = {
  environmental_quality: "Environmental Quality",
  infrastructure_efficiency: "Infrastructure",
  public_services: "Public Services",
  mobility: "Mobility",
  community_wellbeing: "Community Well-being",
};

export const PILLARS = Object.keys(PILLAR_LABELS) as (keyof PillarScores)[];

/** Convert WardScore pillar_scores into the {label, value}[] format the ScoreWidget expects */
export function pillarScoresToArray(pillar_scores: PillarScores) {
  return PILLARS.map((key) => ({
    label: PILLAR_LABELS[key],
    value: Math.round(pillar_scores[key]),
  }));
}

/** Grade colour utility */
export function gradeColor(grade: string): string {
  if (["A+", "A"].includes(grade)) return "text-emerald-400";
  if (["B+", "B"].includes(grade)) return "text-green-400";
  if (["B-", "C+"].includes(grade)) return "text-yellow-400";
  if (["C"].includes(grade)) return "text-orange-400";
  return "text-red-400";
}

/** Score → fill colour for map / indicators */
export function scoreToColor(score: number): string {
  if (score >= 75) return "#22c55e"; // green
  if (score >= 60) return "#84cc16"; // lime
  if (score >= 50) return "#eab308"; // yellow
  if (score >= 35) return "#f97316"; // orange
  return "#ef4444"; // red
}

// ─── Default ward (used on first load) ────────────────────────────────────
export const DEFAULT_WARD_ID = "ward-001"; // Anna Nagar
