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
import { TrendChart } from "@/components/charts/trend-chart";
import { getAlerts, getScoreHistory } from "@/services/modules-service";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import {
  getMetrics,
  getRecommendations,
  getSensorReadings,
  getSustainabilityScore,
} from "@/services/sustainability-service";
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
  const query = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => ({
      metrics: await getMetrics(),
      score: await getSustainabilityScore(),
      recommendations: await getRecommendations(),
      readings: await getSensorReadings(),
      alerts: await getAlerts(),
      history: await getScoreHistory(),
    }),
  });

  return (
    <DashboardLayout
      title="City Sustainability Overview"
      subtitle="Metro District &middot; Q3 assessment cycle"
      actions={
        <Button variant="outline" className="hidden h-11 rounded-xl sm:inline-flex">
          <Download className="mr-2 size-4" aria-hidden="true" />
          Export report
        </Button>
      }
    >
      {query.isLoading ? (
        <div className="flex min-h-64 items-center justify-center">
          <LoadingSpinner size="lg" label="Loading assessment data" />
        </div>
      ) : query.isError || !query.data ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : (
        <div className="space-y-6">
          <div className="grid items-start gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ScoreWidget data={query.data.score} />
            </div>
            <RecommendationsWidget items={query.data.recommendations} />
          </div>

          <section aria-label="Sustainability metrics" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {query.data.metrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} icon={metricIcons[metric.id]} />
            ))}
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <TrendChart
              chart={{
                title: "Score trend",
                description: "Composite sustainability score against benchmark.",
                kind: "area",
                data: query.data.history,
                series: [
                  { key: "score", label: "City score", color: "var(--color-primary)" },
                  { key: "benchmark", label: "Benchmark", color: "var(--color-accent)" },
                ],
              }}
            />
            <AlertsWidget items={query.data.alerts} />
          </div>

          <ReadingsTable readings={query.data.readings} />

          <section className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Explore modules</h2>
            <QuickNavCards />
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}