import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, Droplets, Gauge, Leaf, Recycle, Wind, Zap } from "lucide-react";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ScoreWidget } from "@/components/dashboard/score-widget";
import { RecommendationsWidget } from "@/components/dashboard/recommendations-widget";
import { ReadingsTable } from "@/components/dashboard/readings-table";
import { AlertsWidget } from "@/components/dashboard/alerts-widget";
import { QuickNavCards } from "@/components/dashboard/quick-nav-cards";
import { WardSelector } from "@/components/dashboard/ward-selector";
import { TrendChart } from "@/components/charts/trend-chart";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { useWard } from "@/context/ward-context";
import { PolicySimulator } from "@/components/dashboard/policy-simulator";
import {
  fetchScore,
  fetchRecommendations,
  fetchScoreHistory,
  pillarScoresToArray,
  PILLAR_LABELS,
} from "@/services/api-service";
import type { MetricId } from "@/types/sustainability";

const title = "Dashboard | UrbanSense Sustainability Platform";
const description =
  "Live city sustainability score with air, water, waste, energy, traffic and green cover widgets.";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: DashboardPage,
});

const metricIcons: Record<MetricId, typeof Wind> = {
  "air-quality": Wind,
  waste: Recycle,
  water: Droplets,
  energy: Zap,
  traffic: Gauge,
  "green-cover": Leaf,
};

function DashboardPage() {
  const { wardId } = useWard();

  // ── Real API data ────────────────────────────────────────────────────────
  const scoreQuery = useQuery({
    queryKey: ["score", wardId],
    queryFn: () => fetchScore(wardId),
  });

  const recsQuery = useQuery({
    queryKey: ["recommendations", wardId],
    queryFn: () => fetchRecommendations(wardId),
  });

  const historyQuery = useQuery({
    queryKey: ["history", wardId],
    queryFn: () => fetchScoreHistory(wardId, 90),
  });

  const isLoading = scoreQuery.isLoading || recsQuery.isLoading;
  const isError = scoreQuery.isError;

  // ── Map real score → ScoreWidget's expected shape ────────────────────────
  const scoreWidgetData = scoreQuery.data
    ? {
        score: Math.round(scoreQuery.data.total),
        grade: scoreQuery.data.grade,
        city: scoreQuery.data.ward_name,
        updatedAt: scoreQuery.data.computed_at,
        pillars: pillarScoresToArray(scoreQuery.data.pillar_scores),
      }
    : null;

  // ── Map real recommendations → RecommendationsWidget shape ───────────────
  const recommendationsData = recsQuery.data?.recommendations.slice(0, 4).map((r) => ({
    id: r.id,
    title: r.title,
    detail: r.detail,
    impact: r.impact as "high" | "medium" | "low",
    category: r.category,
  })) ?? [];

  // ── Map score history → TrendChart shape ─────────────────────────────────
  const historyData =
    historyQuery.data?.history.map((h) => ({
      date: h.date,
      score: Math.round(h.total),
      benchmark: 70, // SDG-11 target
    })) ?? [];

  return (
    <DashboardLayout
      title="City Sustainability Overview"
      subtitle={`Chennai · ${scoreQuery.data?.ward_name ?? "Loading…"} · Live assessment`}
      actions={
        <div className="flex items-center gap-3">
          <WardSelector />
          <Button variant="outline" className="hidden h-10 rounded-xl sm:inline-flex">
            <Download className="mr-2 size-4" aria-hidden="true" />
            Export
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center">
          <LoadingSpinner size="lg" label="Loading ward data" />
        </div>
      ) : isError || !scoreWidgetData ? (
        <ErrorState onRetry={() => scoreQuery.refetch()} />
      ) : (
        <div className="space-y-6">
          {/* Score + Recommendations */}
          <div className="grid items-start gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ScoreWidget data={scoreWidgetData} />
            </div>
            <RecommendationsWidget items={recommendationsData} />
          </div>

          {/* Interactive Policy Simulator */}
          <PolicySimulator
            wardId={wardId}
            wardName={scoreQuery.data?.ward_name ?? "Anna Nagar"}
            currentScore={scoreQuery.data ? Math.round(scoreQuery.data.total) : 68.4}
            currentGrade={scoreQuery.data?.grade ?? "B"}
          />

          {/* Pillar metric cards from real pillar_scores */}
          <section aria-label="Pillar scores" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {scoreQuery.data &&
              Object.entries(PILLAR_LABELS).map(([key, label]) => {
                const value =
                  scoreQuery.data!.pillar_scores[key as keyof typeof scoreQuery.data.pillar_scores];
                const status =
                  value >= 70 ? ("good" as const) : value >= 45 ? ("moderate" as const) : ("poor" as const);
                return (
                  <div
                    key={key}
                    className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
                  >
                    <span className="text-sm font-medium text-muted-foreground">{label}</span>
                    <div className="flex items-end justify-between">
                      <span className="font-display text-3xl font-semibold text-foreground">
                        {Math.round(value)}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          status === "good"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : status === "moderate"
                              ? "bg-yellow-500/15 text-yellow-400"
                              : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          status === "good"
                            ? "bg-emerald-500"
                            : status === "moderate"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${Math.round(value)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </section>

          {/* Score trend */}
          <div className="grid gap-6 xl:grid-cols-2">
            <TrendChart
              chart={{
                title: `${scoreQuery.data?.ward_name} — 90-day score trend`,
                description: "Composite sustainability score vs. SDG-11 benchmark (70).",
                kind: "area",
                data: historyData,
                series: [
                  { key: "score", label: "Ward score", color: "var(--color-primary)" },
                  { key: "benchmark", label: "SDG-11 target", color: "var(--color-accent)" },
                ],
              }}
            />
            <AlertsWidget
              items={[
                {
                  id: "a1",
                  title: `Data completeness: ${((scoreQuery.data?.data_completeness ?? 1) * 100).toFixed(0)}% — all indicators reporting`,
                  zone: scoreQuery.data?.ward_name ?? "Loading",
                  severity: "info" as const,
                  occurredAt: new Date().toISOString(),
                },
                {
                  id: "a2",
                  title: "Scores computed from real seeded ward data · contract frozen-day3",
                  zone: "System",
                  severity: "info" as const,
                  occurredAt: new Date().toISOString(),
                },
              ]}
            />
          </div>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Explore modules</h2>
            <QuickNavCards />
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}