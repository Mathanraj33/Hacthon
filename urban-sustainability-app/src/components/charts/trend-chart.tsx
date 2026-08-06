import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import type { TrendData } from "@/types/modules";

const axisProps = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
  tickMargin: 8,
} as const;

/** Keeps labels legible on narrow screens instead of overlapping. */
const xAxisProps = { ...axisProps, minTickGap: 16, interval: "preserveStartEnd" as const };

/** Scales to the data range so small movements stay visible. */
const yAxisProps = {
  ...axisProps,
  width: 44,
  // Zoom to the data range (with padding) so small movements stay readable.
  domain: [
    (min: number) => Math.max(0, Math.floor(min - Math.abs(min) * 0.12 - 1)),
    (max: number) => Math.ceil(max + Math.abs(max) * 0.08 + 1),
  ] as [(v: number) => number, (v: number) => number],
};

export function TrendChart({ chart, height = 280 }: { chart: TrendData; height?: number }) {
  const isEmpty = chart.data.length === 0;

  return (
    <Card className="rounded-2xl border-border bg-card shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle className="text-base">{chart.title}</CardTitle>
        <CardDescription>{chart.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <EmptyState title="No chart data" description="This series has no recorded values yet." />
        ) : (
          <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              {chart.kind === "bar" ? (
                <BarChart data={chart.data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="name" {...xAxisProps} />
                  <YAxis {...axisProps} width={44} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-muted)" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {chart.series.map((s) => (
                    <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[6, 6, 0, 0]} />
                  ))}
                </BarChart>
              ) : chart.kind === "area" ? (
                <AreaChart data={chart.data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                  <defs>
                    {chart.series.map((s) => (
                      <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="name" {...xAxisProps} />
                  <YAxis {...yAxisProps} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {chart.series.map((s) => (
                    <Area
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.label}
                      stroke={s.color}
                      strokeWidth={2}
                      fill={`url(#grad-${s.key})`}
                    />
                  ))}
                </AreaChart>
              ) : (
                <LineChart data={chart.data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="name" {...xAxisProps} />
                  <YAxis {...yAxisProps} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {chart.series.map((s) => (
                    <Line
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.label}
                      stroke={s.color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type TooltipPayload = { name?: string; value?: number | string; color?: string };

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover p-3 text-xs shadow-[var(--shadow-elevated)]">
      <p className="mb-1.5 font-medium text-foreground">{label}</p>
      <ul className="space-y-1">
        {payload.map((entry) => (
          <li key={entry.name} className="flex items-center gap-2 text-muted-foreground">
            <span className="size-2 rounded-full" style={{ background: entry.color }} aria-hidden="true" />
            <span>{entry.name}</span>
            <span className="ml-auto font-medium text-foreground">{entry.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
