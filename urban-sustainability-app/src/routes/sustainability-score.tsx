import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { QueryState } from "@/components/common/query-state";
import { ScoreWidget } from "@/components/dashboard/score-widget";
import { WardSelector } from "@/components/dashboard/ward-selector";
import { TrendChart } from "@/components/charts/trend-chart";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ExplainabilityWaterfall } from "@/components/charts/explainability-waterfall";
import { AreasNeedingImprovement } from "@/components/dashboard/areas-needing-improvement";
import { useWard } from "@/context/ward-context";
import {
  fetchScore,
  fetchScoreHistory,
  pillarScoresToArray,
  PILLAR_LABELS,
  PILLARS,
} from "@/services/api-service";

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
  const { wardId } = useWard();

  const scoreQuery = useQuery({
    queryKey: ["score", wardId],
    queryFn: () => fetchScore(wardId),
  });

  const historyQuery = useQuery({
    queryKey: ["history", wardId],
    queryFn: () => fetchScoreHistory(wardId, 90),
  });

  const combined = useQuery({
    queryKey: ["score-page", wardId],
    queryFn: async () => {
      const [score, history] = await Promise.all([
        fetchScore(wardId),
        fetchScoreHistory(wardId, 90),
      ]);
      return { score, history };
    },
  });

  return (
    <DashboardLayout
      title="Sustainability Score"
      subtitle="SDG 11 composite index"
      actions={<WardSelector />}
    >
      <QueryState
        isLoading={combined.isLoading}
        isError={combined.isError}
        data={combined.data}
        onRetry={() => combined.refetch()}
        loadingLabel="Loading score data"
      >
        {({ score, history }) => {
          const scoreWidgetData = {
            score: Math.round(score.total),
            grade: score.grade,
            city: score.ward_name,
            updatedAt: score.computed_at,
            pillars: pillarScoresToArray(score.pillar_scores),
          };

          const historyData = history.history.map((h) => ({
            date: h.date,
            score: Math.round(h.total),
            benchmark: 70,
          }));

          // Category breakdown table — one row per pillar
          const breakdownRows = PILLARS.map((key) => ({
            category: PILLAR_LABELS[key],
            score: Math.round(score.pillar_scores[key]),
            benchmark: 70,
            weight: Math.round(100 / PILLARS.length), // equal weight display
          }));

          return (
            <div className="space-y-6">
              <ScoreWidget data={scoreWidgetData} />

              <ExplainabilityWaterfall wardId={wardId} />

              <AreasNeedingImprovement wardId={wardId} />

              <TrendChart
                chart={{
                  title: `${score.ward_name} — 90-day trend`,
                  description: "Composite sustainability score vs. SDG-11 target benchmark (70).",
                  kind: "area",
                  data: historyData,
                  series: [
                    { key: "score", label: "Ward score", color: "var(--color-primary)" },
                    { key: "benchmark", label: "SDG-11 target", color: "var(--color-accent)" },
                  ],
                }}
                height={320}
              />

              <DataTableCard
                table={{
                  title: "Pillar breakdown",
                  description: "Score and benchmark per SDG-11 assessment pillar.",
                  columns: ["Pillar", "Score", "Benchmark", "Weight", "Status"],
                  rows: breakdownRows.map((row) => ({
                    id: row.category,
                    cells: [
                      row.category,
                      String(row.score),
                      String(row.benchmark),
                      `${row.weight}%`,
                    ],
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
          );
        }}
      </QueryState>
    </DashboardLayout>
  );
}
