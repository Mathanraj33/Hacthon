import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { KpiGrid } from "@/components/dashboard/kpi-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { SuggestionsCard } from "@/components/dashboard/suggestions-card";
import type { ModulePayload } from "@/types/modules";

/** Standard module page composition: KPIs, charts, extras, table, suggestions. */
export function ModuleView({
  payload,
  icons,
  extra,
}: {
  payload: ModulePayload;
  icons?: Record<string, LucideIcon> | undefined;
  extra?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <KpiGrid kpis={payload.kpis} icons={icons} />

      {payload.secondaryTrend ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <TrendChart chart={payload.trend} />
          <TrendChart chart={payload.secondaryTrend} />
        </div>
      ) : (
        <TrendChart chart={payload.trend} height={320} />
      )}

      {extra}

      {payload.table ? <DataTableCard table={payload.table} /> : null}

      {payload.suggestions?.length ? <SuggestionsCard items={payload.suggestions} /> : null}
    </div>
  );
}
