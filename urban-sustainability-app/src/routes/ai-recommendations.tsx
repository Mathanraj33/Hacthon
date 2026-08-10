import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles, TrendingUp, Clock, DollarSign } from "lucide-react";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { QueryState } from "@/components/common/query-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WardSelector } from "@/components/dashboard/ward-selector";
import { useWard } from "@/context/ward-context";
import { AreasNeedingImprovement } from "@/components/dashboard/areas-needing-improvement";
import { fetchRecommendations } from "@/services/api-service";
import { cn } from "@/lib/utils";

const title = "Recommendations | UrbanSense Sustainability Platform";
const description =
  "Prioritised improvement actions ranked by projected score uplift, with cost band and time-to-effect.";

export const Route = createFileRoute("/ai-recommendations")({
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

const impactStyles = {
  high:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  low:    "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

const costStyles = {
  low:    "bg-blue-500/15 text-blue-400",
  medium: "bg-orange-500/15 text-orange-400",
  high:   "bg-red-500/15 text-red-400",
};

function Page() {
  const { wardId } = useWard();

  const query = useQuery({
    queryKey: ["recommendations", wardId],
    queryFn: () => fetchRecommendations(wardId),
  });

  return (
    <DashboardLayout
      title="Improvement Recommendations"
      subtitle="Ranked by projected score uplift — highest impact first"
      actions={<WardSelector />}
    >
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        data={query.data}
        onRetry={() => query.refetch()}
        loadingLabel="Loading recommendations"
        isEmpty={(data) => data.recommendations.length === 0}
        emptyTitle="No recommendations yet"
        emptyDescription="Connect data sources to generate improvement actions."
      >
        {(data) => (
          <div className="space-y-6">
            <AreasNeedingImprovement wardId={wardId} />
            {/* Ward summary banner */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{data.recommendations.length}</span> interventions
                for <span className="font-semibold text-foreground">{data.ward_name}</span>, ranked by projected score
                improvement. Top intervention could add{" "}
                <span className="font-semibold text-primary">
                  +{data.recommendations[0]?.projected_score_uplift.toFixed(1)} pts
                </span>{" "}
                to the ward score.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {data.recommendations.map((item, index) => (
                <Card
                  key={item.id}
                  className="rounded-2xl border-border bg-card shadow-[var(--shadow-soft)] transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                    <CardTitle className="flex items-start gap-2.5 text-base">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                      {item.title}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={cn("shrink-0 rounded-full capitalize", impactStyles[item.impact])}
                    >
                      {item.impact} impact
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{item.detail}</p>

                    {/* Key metrics row */}
                    <dl className="grid grid-cols-3 gap-3 text-sm">
                      <div className="flex flex-col gap-1 rounded-xl border border-border bg-background p-3">
                        <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="size-3" aria-hidden />
                          Score uplift
                        </dt>
                        <dd className="font-semibold text-primary">
                          +{item.projected_score_uplift.toFixed(1)} pts
                        </dd>
                      </div>
                      <div className="flex flex-col gap-1 rounded-xl border border-border bg-background p-3">
                        <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                          <DollarSign className="size-3" aria-hidden />
                          Cost band
                        </dt>
                        <dd>
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                              costStyles[item.cost_band],
                            )}
                          >
                            {item.cost_band}
                          </span>
                        </dd>
                      </div>
                      <div className="flex flex-col gap-1 rounded-xl border border-border bg-background p-3">
                        <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" aria-hidden />
                          Time to effect
                        </dt>
                        <dd className="font-medium text-foreground">
                          {item.time_to_effect_months}mo
                        </dd>
                      </div>
                    </dl>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        className="min-h-10 rounded-xl"
                        onClick={() => toast.success(`Approved: ${item.title}`)}
                      >
                        <Sparkles className="mr-1.5 size-4" aria-hidden />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="min-h-10 rounded-xl"
                        onClick={() => toast(`Assigned for review: ${item.title}`)}
                      >
                        Assign for review
                      </Button>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {item.category} · targets <code className="text-primary">{item.indicator}</code>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </QueryState>
    </DashboardLayout>
  );
}
