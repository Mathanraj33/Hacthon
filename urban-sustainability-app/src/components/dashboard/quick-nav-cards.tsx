import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { moduleNavItems } from "@/config/navigation";

/** Quick navigation grid linking the dashboard to every module page. */
export function QuickNavCards() {
  return (
    <section aria-label="Module navigation" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {moduleNavItems.map((item) => (
        <Link key={item.to} to={item.to} className="group focus-visible:outline-none">
          <Card className="h-full rounded-2xl border-border bg-card shadow-[var(--shadow-soft)] transition-all group-hover:border-primary/40 group-hover:shadow-[var(--shadow-elevated)] group-focus-visible:ring-2 group-focus-visible:ring-ring">
            <CardContent className="flex items-start gap-3 p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  {item.label}
                  <ArrowRight
                    className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </section>
  );
}
