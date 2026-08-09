import { Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import type { Recommendation } from "@/types/sustainability";
import { cn } from "@/lib/utils";

const impactStyles: Record<Recommendation["impact"], string> = {
  high: "bg-success/12 text-success border-success/25",
  medium: "bg-warning/15 text-warning-foreground border-warning/40",
  low: "bg-muted text-muted-foreground border-border",
};

export function RecommendationsWidget({ items }: { items: Recommendation[] }) {
  return (
    <Card className="rounded-2xl border-border bg-card shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="size-5 text-accent" aria-hidden="true" />
          Smart Recommendations
        </CardTitle>
        <CardDescription>Ranked by projected impact on the city score.</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            title="No recommendations yet"
            description="Connect data sources to generate improvement actions."
          />
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <Badge
                    variant="outline"
                    className={cn("shrink-0 rounded-full capitalize", impactStyles[item.impact])}
                  >
                    {item.impact}
                  </Badge>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{item.detail}</p>
                <p className="mt-2 text-xs font-medium text-primary">{item.category}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}