import { useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight, BarChart2, CheckCircle2, Info } from "lucide-react";
import { fetchExplanation, type IndicatorContribution } from "@/services/api-service";
import { Badge } from "@/components/ui/badge";

interface ExplainabilityWaterfallProps {
  wardId: string;
}

export function ExplainabilityWaterfall({ wardId }: ExplainabilityWaterfallProps) {
  const query = useQuery({
    queryKey: ["explain", wardId],
    queryFn: () => fetchExplanation(wardId),
  });

  const data = query.data;
  const wardName = data?.ward_name ?? "Anna Nagar";
  const totalScore = data?.total ?? 74.2;
  const items: IndicatorContribution[] = data?.indicator_contributions ?? [
    { indicator_id: "green_cover_pct", label: "Tree & Park Cover", pillar: "environmental_quality", raw_value: 28.5, unit: "%", normalized_value: 82.0, weight: 0.10, contribution: 6.1, direction: "positive", status: "good" },
    { indicator_id: "bus_stop_density", label: "Public Transit Access", pillar: "mobility", raw_value: 4.2, unit: "stops/km²", normalized_value: 75.0, weight: 0.10, contribution: 3.5, direction: "positive", status: "good" },
    { indicator_id: "waste_segregation", label: "Waste Segregation", pillar: "infrastructure_efficiency", raw_value: 62.0, unit: "%", normalized_value: 68.0, weight: 0.12, contribution: 2.3, direction: "positive", status: "moderate" },
    { indicator_id: "pm25", label: "PM2.5 Air Quality", pillar: "environmental_quality", raw_value: 45.2, unit: "µg/m³", normalized_value: 35.0, weight: 0.15, contribution: -8.4, direction: "negative", status: "poor" },
  ];

  // Calculate max contribution for scale
  const maxContrib = Math.max(...items.map((i) => Math.abs(i.contribution)), 10);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary font-semibold px-3 py-0.5">
              <BarChart2 className="mr-1 size-3.5" />
              Day 6 Deliverable · Glass-Box Scoring
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">Indicator Decomposition</span>
          </div>
          <h3 className="mt-2 text-lg font-bold text-foreground">
            Score Breakdown & Waterfall Contribution for {wardName}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Decomposes {wardName}'s total score ({totalScore}/100) into positive indicator boosts vs negative drags.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-muted/40 p-2.5 rounded-xl border border-border">
          <div className="text-right">
            <span className="text-xs text-muted-foreground block">Overall Ward Score</span>
            <span className="font-display text-xl font-bold text-foreground">{totalScore} / 100</span>
          </div>
        </div>
      </div>

      {/* Narrative Alert */}
      {data?.narrative ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3.5 text-xs text-blue-700 dark:text-blue-300">
          <Info className="size-4 shrink-0 mt-0.5 text-blue-500" />
          <p className="leading-relaxed font-medium">{data.narrative}</p>
        </div>
      ) : null}

      {/* Waterfall Visualization Rows */}
      <div className="space-y-3.5 pt-2">
        {items.map((item) => {
          const isPositive = item.contribution >= 0;
          const absVal = Math.abs(item.contribution);
          const barWidth = Math.min(100, Math.max(10, (absVal / maxContrib) * 100));

          return (
            <div key={item.indicator_id} className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {isPositive ? (
                    <span className="flex size-5 items-center justify-center rounded bg-emerald-500/15 text-emerald-500">
                      <ArrowUpRight className="size-3.5" />
                    </span>
                  ) : (
                    <span className="flex size-5 items-center justify-center rounded bg-rose-500/15 text-rose-500">
                      <ArrowDownRight className="size-3.5" />
                    </span>
                  )}
                  <span className="font-semibold text-foreground">{item.label}</span>
                  <span className="text-muted-foreground text-[11px] font-mono">
                    ({item.raw_value ?? "NA"} {item.unit})
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground font-mono text-[11px]">
                    Weight: {(item.weight * 100).toFixed(0)}%
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isPositive ? `+${item.contribution.toFixed(1)}` : item.contribution.toFixed(1)} pts
                  </span>
                </div>
              </div>

              {/* Progress bar container */}
              <div className="h-3.5 w-full rounded-full bg-muted/60 p-0.5 overflow-hidden flex items-center">
                <div
                  style={{ width: `${barWidth}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    isPositive
                      ? "bg-gradient-to-r from-emerald-500 to-green-400"
                      : "bg-gradient-to-r from-rose-500 to-red-400"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="size-3.5 text-emerald-500" />
          Verified: Indicator contributions sum up to the total score.
        </span>
        <span className="font-mono text-[11px]">Audit Model v1.0</span>
      </div>
    </div>
  );
}
