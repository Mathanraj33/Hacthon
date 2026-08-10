import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowUpRight, CheckCircle, ShieldAlert, Sparkles, Target } from "lucide-react";
import { fetchExplanation, fetchRecommendations, fetchScore } from "@/services/api-service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AreasNeedingImprovementProps {
  wardId: string;
}

export function AreasNeedingImprovement({ wardId }: AreasNeedingImprovementProps) {
  const scoreQuery = useQuery({
    queryKey: ["score", wardId],
    queryFn: () => fetchScore(wardId),
  });

  const explainQuery = useQuery({
    queryKey: ["explain", wardId],
    queryFn: () => fetchExplanation(wardId),
  });

  const recsQuery = useQuery({
    queryKey: ["recommendations", wardId],
    queryFn: () => fetchRecommendations(wardId),
  });

  const wardName = scoreQuery.data?.ward_name ?? "Anna Nagar";
  const contributions = explainQuery.data?.indicator_contributions ?? [
    { indicator_id: "pm25", label: "PM2.5 Air Quality", pillar: "Environmental", raw_value: 45.2, unit: "µg/m³", normalized_value: 35.0, weight: 0.15, contribution: -8.4, direction: "negative", status: "poor" },
    { indicator_id: "waste_segregation", label: "Waste Segregation", pillar: "Infrastructure", raw_value: 42.0, unit: "%", normalized_value: 48.0, weight: 0.12, contribution: -4.1, direction: "negative", status: "poor" },
    { indicator_id: "public_transit", label: "Feeder Bus Density", pillar: "Mobility", raw_value: 2.1, unit: "stops/km²", normalized_value: 52.0, weight: 0.10, contribution: -2.8, direction: "negative", status: "moderate" },
  ];

  const recommendations = recsQuery.data?.recommendations ?? [
    { id: "rec-01", title: "Expand Urban Tree Canopy", detail: "Plant 2,500 native trees along major arterial roads to lower heat island effect.", impact: "high", category: "Environmental", indicator: "green_cover_pct", projected_score_uplift: 4.8, cost_band: "medium", time_to_effect_months: 6 },
    { id: "rec-02", title: "Deploy EV Transit Shuttles", detail: "Introduce 15 zero-emission feeder buses connecting metro stations.", impact: "high", category: "Mobility", indicator: "bus_stop_density", projected_score_uplift: 3.6, cost_band: "high", time_to_effect_months: 12 },
    { id: "rec-03", title: "Mandate Waste Segregation", detail: "Enforce 3-bin door-to-door waste collection across commercial zones.", impact: "medium", category: "Infrastructure", indicator: "waste_segregation", projected_score_uplift: 2.9, cost_band: "low", time_to_effect_months: 3 },
  ];

  // Filter drags (negative or poor status)
  const drags = contributions.filter((c) => c.contribution < 0 || c.status === "poor");

  return (
    <div className="space-y-6">
      {/* Overview Header Banner */}
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rose-500/20 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500">
              <ShieldAlert className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-xs">
                  S-50 Verb 2 · Evidence Based
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">SDG 11 Deficit Audit</span>
              </div>
              <h3 className="mt-1 text-lg font-bold text-foreground">
                Priority Areas Needing Improvement — {wardName}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-card border border-border px-3.5 py-1.5 shadow-sm">
            <Target className="size-4 text-rose-500" />
            <span className="text-xs font-semibold text-muted-foreground">Active Drag Total:</span>
            <span className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400">
              {drags.reduce((acc, curr) => acc + curr.contribution, 0).toFixed(1)} pts
            </span>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
          The glass-box scoring engine continuously audits indicator deficits against WHO guidelines and national SDG 11 benchmarks. Below are the audited drags pulls down {wardName}'s score and ranked interventions to reclaim points.
        </p>
      </div>

      {/* Grid: Audited Deficits on Left, Ranked Interventions on Right */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Deficits Table */}
        <div className="lg:col-span-6">
          <Card className="rounded-2xl border-border bg-card shadow-[var(--shadow-soft)] h-full">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <AlertTriangle className="size-4 text-amber-500" />
                  Audited Indicator Deficits
                </CardTitle>
                <span className="text-xs font-mono text-muted-foreground">{drags.length} priority drags</span>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {drags.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No major deficits detected for this ward.
                </div>
              ) : (
                drags.map((item) => (
                  <div
                    key={item.indicator_id}
                    className="rounded-xl border border-border/80 bg-muted/30 p-3.5 transition-colors hover:bg-muted/60"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-sm font-semibold text-foreground">{item.label}</span>
                        <p className="text-xs text-muted-foreground capitalize">{item.pillar} Pillar</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                          {item.contribution > 0 ? `-${item.contribution}` : `${item.contribution}`} pts
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between border-t border-border/50 pt-2 text-xs">
                      <span className="text-muted-foreground">
                        Measured Value: <strong className="text-foreground">{item.raw_value ?? "NA"} {item.unit}</strong>
                      </span>
                      <span className="text-muted-foreground">
                        Normalized Score: <strong className="text-rose-500">{Math.round(item.normalized_value)} / 100</strong>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quantified Recommendations */}
        <div className="lg:col-span-6">
          <Card className="rounded-2xl border-border bg-card shadow-[var(--shadow-soft)] h-full">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  Targeted Interventions & Uplift
                </CardTitle>
                <span className="text-xs font-mono text-muted-foreground">Ranked by ROI</span>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        {rec.title}
                        <ArrowUpRight className="size-3.5 text-emerald-500" />
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{rec.detail}</p>
                    </div>
                    <Badge className="bg-emerald-500 text-white font-bold text-xs shrink-0 rounded-lg">
                      +{rec.projected_score_uplift} pts
                    </Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-primary/10 pt-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-background px-2 py-0.5 font-medium border text-muted-foreground capitalize">
                        Cost: {rec.cost_band}
                      </span>
                      <span className="rounded bg-background px-2 py-0.5 font-medium border text-muted-foreground">
                        Time: {rec.time_to_effect_months} mo
                      </span>
                    </div>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="size-3" />
                      {rec.category}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
