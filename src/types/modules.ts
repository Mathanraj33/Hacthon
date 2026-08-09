import type { MetricStatus, TrendDirection } from "@/types/sustainability";

export type Kpi = {
  id: string;
  label: string;
  value: number;
  unit: string;
  change: number;
  trend: TrendDirection;
  status: MetricStatus;
  description: string;
  progress: number;
};

export type SeriesPoint = { name: string } & Record<string, string | number>;

export type ChartSeries = {
  key: string;
  label: string;
  color: string;
};

export type TrendData = {
  title: string;
  description: string;
  kind: "line" | "area" | "bar";
  data: SeriesPoint[];
  series: ChartSeries[];
};

export type TableRowData = {
  id: string;
  cells: string[];
  status?: MetricStatus;
  /** Optional label shown in the status badge instead of the raw status token. */
  statusLabel?: string;
};

export type DataTable = {
  title: string;
  description: string;
  columns: string[];
  rows: TableRowData[];
};

export type AlertItem = {
  id: string;
  title: string;
  zone: string;
  severity: "critical" | "warning" | "info";
  occurredAt: string;
};

export type PriorityRecommendation = {
  id: string;
  title: string;
  detail: string;
  category: string;
  priority: "critical" | "high" | "medium" | "low";
  estimatedImpact: string;
  effort: string;
  status: "proposed" | "in-review" | "approved";
};

export type ReportRecord = {
  id: string;
  name: string;
  module: string;
  period: string;
  generatedAt: string;
  format: "PDF" | "CSV";
  status: "ready" | "processing" | "failed";
};

export type ModulePayload = {
  kpis: Kpi[];
  trend: TrendData;
  secondaryTrend?: TrendData;
  table?: DataTable;
  suggestions?: string[];
};

export type ScoreBreakdownRow = {
  category: string;
  score: number;
  benchmark: number;
  weight: number;
};

export type UserSettings = {
  name: string;
  email: string;
  organization: string;
  role: string;
  language: string;
  notifications: {
    alerts: boolean;
    weeklyDigest: boolean;
    recommendations: boolean;
  };
  preferences: {
    units: string;
    timezone: string;
  };
};
