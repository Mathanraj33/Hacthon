export type TrendDirection = "up" | "down" | "flat";

export type MetricStatus = "good" | "moderate" | "poor";

export type MetricId =
  | "air-quality"
  | "waste"
  | "water"
  | "energy"
  | "traffic"
  | "green-cover";

export type SustainabilityMetric = {
  id: MetricId;
  label: string;
  value: number;
  unit: string;
  /** Percentage change vs. the previous reporting period. */
  change: number;
  trend: TrendDirection;
  status: MetricStatus;
  description: string;
  /** Normalized 0-100 progress used by the widget progress bar. */
  progress: number;
};

export type SustainabilityScore = {
  score: number;
  grade: string;
  city: string;
  updatedAt: string;
  pillars: { label: string; value: number }[];
};

export type Recommendation = {
  id: string;
  title: string;
  detail: string;
  impact: "high" | "medium" | "low";
  category: string;
};

export type SensorReading = {
  id: string;
  zone: string;
  metric: string;
  value: string;
  status: MetricStatus;
  updatedAt: string;
};

export type Credentials = {
  email: string;
  password: string;
};

export type RegistrationPayload = Credentials & {
  name: string;
  organization: string;
};