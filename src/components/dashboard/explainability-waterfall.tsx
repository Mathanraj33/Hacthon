import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const mockData = [
  {
    name: "Base",
    value: 50,
    start: 0,
    end: 50,
    change: 50,
    type: "base",
  },
  {
    name: "Green Cover",
    value: 12,
    start: 50,
    end: 62,
    change: 12,
    type: "positive",
  },
  {
    name: "Public Transport",
    value: 8,
    start: 62,
    end: 70,
    change: 8,
    type: "positive",
  },
  {
    name: "Air Quality",
    value: -6,
    start: 70,
    end: 64,
    change: -6,
    type: "negative",
  },
  {
    name: "Waste Management",
    value: 10,
    start: 64,
    end: 74,
    change: 10,
    type: "positive",
  },
  {
    name: "Water Quality",
    value: -4,
    start: 74,
    end: 70,
    change: -4,
    type: "negative",
  },
  {
    name: "Final Score",
    value: 70,
    start: 0,
    end: 70,
    change: 70,
    type: "total",
  },
];

function getBarColor(type: string) {
  if (type === "negative") return "var(--color-destructive)";
  if (type === "base" || type === "total") return "var(--color-primary)";
  return "var(--color-secondary)";
}

export function ExplainabilityWaterfall() {
  return (
    <Card className="rounded-2xl border-border bg-card shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle className="text-base">
          Score Explainability
        </CardTitle>

        <CardDescription>
          Mock explanation of how different sustainability factors affect
          the overall score.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mockData}
              margin={{
                top: 20,
                right: 20,
                left: 10,
                bottom: 70,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                angle={-25}
                textAnchor="end"
                interval={0}
                height={70}
                tick={{ fontSize: 12 }}
              />

              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
              />

              <Tooltip
                formatter={(value) => [
                  `${value}`,
                  "Score contribution",
                ]}
              />

              <ReferenceLine
                y={70}
                stroke="var(--color-muted-foreground)"
                strokeDasharray="4 4"
                label="Final score"
              />

              <Bar
                dataKey="end"
                radius={[6, 6, 0, 0]}
              >
                {mockData.map((item) => (
                  <Cell
                    key={item.name}
                    fill={getBarColor(item.type)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-secondary" />
            Positive contribution
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-destructive" />
            Negative contribution
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
            Score total
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Demo data only — real scoring-engine values will be connected
          later.
        </p>
      </CardContent>
    </Card>
  );
}