import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clamp, formatDateTime } from "@/utils/format";
import type { SustainabilityScore } from "@/types/sustainability";

export function ScoreWidget({ data }: { data: SustainabilityScore }) {
  const value = clamp(data.score);
  const circumference = 2 * Math.PI * 52;

  return (
    <Card className="flex flex-col rounded-2xl border-border bg-card shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle className="text-base">Sustainability Score</CardTitle>
        <CardDescription>
          {data.city} &middot; updated {formatDateTime(data.updatedAt)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          <svg width="140" height="140" viewBox="0 0 120 120" role="img" aria-label={`Overall score ${value} out of 100`}>
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-muted)" strokeWidth="12" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - value / 100)}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-semibold text-foreground">{value}</span>
            <span className="text-xs text-muted-foreground">Grade {data.grade}</span>
          </div>
        </div>
        <ul className="w-full space-y-3">
          {data.pillars.map((pillar) => (
            <li key={pillar.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{pillar.label}</span>
                <span className="font-medium text-foreground">{pillar.value}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-secondary transition-all duration-500"
                  style={{ width: `${clamp(pillar.value)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}