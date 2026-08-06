import { Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";

export function SuggestionsCard({
  items,
  title = "AI suggestions",
  description = "Generated from the latest readings for this module.",
}: {
  items: string[];
  title?: string;
  description?: string;
}) {
  return (
    <Card className="rounded-2xl border-border bg-card shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-5 text-accent" aria-hidden="true" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState title="No suggestions" description="More data is needed to generate actions." />
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground"
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
