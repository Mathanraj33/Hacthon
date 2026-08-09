import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { QueryState } from "@/components/common/query-state";
import { ScoreWidget } from "@/components/dashboard/score-widget";
import { TrendChart } from "@/components/charts/trend-chart";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { getSustainabilityScore } from "@/services/sustainability-service";
import { getScoreBreakdown, getScoreHistory } from "@/services/modules-service";
import { ExplainabilityWaterfall } from "@/components/dashboard/explainability-waterfall";

const title = "Sustainability Score | UrbanSense Sustainability Platform";
const description =
  "Overall SDG 11 score with historical trends, category breakdown and benchmark comparison.";

export const Route = createFileRoute("/sustainability-score")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const query = useQuery({
    queryKey: ["sustainability-score"],
    queryFn: async () => ({
      score: await getSustainabilityScore(),
      history: await getScoreHistory(),
      breakdown: await getScoreBreakdown(),
    }),
  });

  return (
    <DashboardLayout title="Sustainability Score" subtitle="SDG 11 composite index">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        data={query.data}
        onRetry={() => query.refetch()}
        loadingLabel="Loading score data"
      >
        {(data) => (
          <div className="space-y-6">
            <ScoreWidget data={data.score} />
            <ExplainabilityWaterfall />
            <TrendChart
              chart={{
                title: "Historical trend",
                description: "Composite score against the national benchmark.",
                kind: "area",
                data: data.history,
                series: [
                  { key: "score", label: "City score", color: "var(--color-primary)" },
                  { key: "benchmark", label: "Benchmark", color: "var(--color-accent)" },
                ],
              }}
              height={320}
            />
            <DataTableCard
              table={{
                title: "Category breakdown",
                description: "Score, benchmark and weighting per assessment category.",
                columns: ["Category", "Score", "Benchmark", "Weight", "Status"],
                rows: data.breakdown.map((row) => ({
                  id: row.category,
                  cells: [row.category, String(row.score), String(row.benchmark), `${row.weight}%`],
                  status:
                    row.score >= row.benchmark
                      ? ("good" as const)
                      : row.score >= row.benchmark - 8
                        ? ("moderate" as const)
                        : ("poor" as const),
                })),
              }}
            />
          </div>
        )}
      </QueryState>
    </DashboardLayout>
  );
}
