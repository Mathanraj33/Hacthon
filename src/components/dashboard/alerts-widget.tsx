import { BellRing } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { formatDateTime } from "@/utils/format";
import type { AlertItem } from "@/types/modules";
import { cn } from "@/lib/utils";

const severityStyles: Record<AlertItem["severity"], string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/25",
  warning: "bg-warning/15 text-warning-foreground border-warning/40",
  info: "bg-primary/10 text-primary border-primary/25",
};

export function AlertsWidget({ items }: { items: AlertItem[] }) {
  return (
    <Card className="rounded-2xl border-border bg-card shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BellRing className="size-5 text-primary" aria-hidden="true" />
          Recent alerts
        </CardTitle>
        <CardDescription>Threshold breaches from the last 48 hours.</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState title="No active alerts" description="All monitored thresholds are within range." />
        ) : (
          <ul className="space-y-3">
            {items.map((alert) => (
              <li key={alert.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{alert.title}</p>
                  <Badge
                    variant="outline"
                    className={cn("shrink-0 rounded-full capitalize", severityStyles[alert.severity])}
                  >
                    {alert.severity}
                  </Badge>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {alert.zone} &middot; {formatDateTime(alert.occurredAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
