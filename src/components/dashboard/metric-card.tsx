import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatChange, formatNumber } from "@/utils/format";
import type { SustainabilityMetric } from "@/types/sustainability";
import { cn } from "@/lib/utils";

const statusStyles: Record<SustainabilityMetric["status"], string> = {
  good: "bg-success/12 text-success border-success/25",
  moderate: "bg-warning/15 text-warning-foreground border-warning/40",
  poor: "bg-destructive/10 text-destructive border-destructive/25",
};

const barStyles: Record<SustainabilityMetric["status"], string> = {
  good: "bg-success",
  moderate: "bg-warning",
  poor: "bg-destructive",
};

const trendIcon = { up: ArrowUpRight, down: ArrowDownRight, flat: ArrowRight };

export function MetricCard({
  metric,
  icon: Icon,
}: {
  metric: SustainabilityMetric;
  icon: LucideIcon;
}) {
  const TrendIcon = trendIcon[metric.trend];

  return (
    <Card className="rounded-2xl border-border bg-card shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-elevated)]">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <CardTitle className="text-sm font-semibold">{metric.label}</CardTitle>
        </div>
        <Badge variant="outline" className={cn("rounded-full capitalize", statusStyles[metric.status])}>
          {metric.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between gap-2">
          <p className="font-display text-3xl font-semibold text-foreground">
            {formatNumber(metric.value)}
            <span className="ml-1 text-sm font-medium text-muted-foreground">{metric.unit}</span>
          </p>
          <span
            className={cn(
              "flex items-center gap-1 text-sm font-medium",
              metric.change >= 0 ? "text-success" : "text-primary",
            )}
          >
            <TrendIcon className="size-4" aria-hidden="true" />
            {formatChange(metric.change)}
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={metric.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${metric.label} score`}
        >
          <div
            className={cn("h-full rounded-full transition-all duration-500", barStyles[metric.status])}
            style={{ width: `${metric.progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{metric.description}</p>
      </CardContent>
    </Card>
  );
}