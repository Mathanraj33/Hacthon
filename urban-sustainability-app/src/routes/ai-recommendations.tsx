import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { QueryState } from "@/components/common/query-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPriorityRecommendations } from "@/services/modules-service";
import type { PriorityRecommendation } from "@/types/modules";
import { cn } from "@/lib/utils";

const title = "AI Recommendations | UrbanSense Sustainability Platform";
const description =
  "Prioritised improvement actions with estimated impact, effort and approval status.";

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

const priorityStyles: Record<PriorityRecommendation["priority"], string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/25",
  high: "bg-warning/15 text-warning-foreground border-warning/40",
  medium: "bg-primary/10 text-primary border-primary/25",
  low: "bg-muted text-muted-foreground border-border",
};

function Page() {
  const query = useQuery({ queryKey: ["ai-recommendations"], queryFn: getPriorityRecommendations });

  return (
    <DashboardLayout title="AI Recommendations" subtitle="Ranked by projected impact on the city score">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        data={query.data}
        onRetry={() => query.refetch()}
        loadingLabel="Loading recommendations"
        isEmpty={(data) => data.length === 0}
        emptyTitle="No recommendations yet"
        emptyDescription="Connect data sources to generate improvement actions."
      >
        {(items) => (
          <div className="grid gap-5 lg:grid-cols-2">
            {items.map((item) => (
              <Card
                key={item.id}
                className="rounded-2xl border-border bg-card shadow-[var(--shadow-soft)]"
              >
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                  <CardTitle className="flex items-start gap-2 text-base">
                    <Sparkles className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
                    {item.title}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={cn("shrink-0 rounded-full capitalize", priorityStyles[item.priority])}
                  >
                    {item.priority}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border border-border bg-background p-3">
                      <dt className="text-xs text-muted-foreground">Estimated impact</dt>
                      <dd className="font-medium text-foreground">{item.estimatedImpact}</dd>
                    </div>
                    <div className="rounded-xl border border-border bg-background p-3">
                      <dt className="text-xs text-muted-foreground">Effort</dt>
                      <dd className="font-medium text-foreground">{item.effort}</dd>
                    </div>
                  </dl>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      className="min-h-11 rounded-xl"
                      onClick={() => toast.success(`Approved: ${item.title}`)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="min-h-11 rounded-xl"
                      onClick={() => toast(`Assigned for review: ${item.title}`)}
                    >
                      Assign
                    </Button>
                    <span className="ml-auto text-xs capitalize text-muted-foreground">
                      {item.category} &middot; {item.status.replace("-", " ")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </QueryState>
    </DashboardLayout>
  );
}
