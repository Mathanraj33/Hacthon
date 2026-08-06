import type { LucideIcon } from "lucide-react";
import { Map } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Visual placeholder for map / satellite panels that will be replaced by a
 * real geospatial provider during backend integration.
 */
export function PlaceholderPanel({
  title,
  description,
  note,
  icon: Icon = Map,
  height = 300,
}: {
  title: string;
  description: string;
  note: string;
  icon?: LucideIcon;
  height?: number;
}) {
  return (
    <Card className="rounded-2xl border-border bg-card shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-primary)_8%,transparent),color-mix(in_oklab,var(--color-secondary)_8%,transparent))] p-6 text-center"
          style={{ minHeight: height }}
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-background/80">
            <Icon className="size-6 text-primary" aria-hidden="true" />
          </span>
          <p className="max-w-sm text-sm text-muted-foreground">{note}</p>
        </div>
      </CardContent>
    </Card>
  );
}
