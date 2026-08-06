import { Leaf } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Brand({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
        <Leaf className="size-5" aria-hidden="true" />
      </span>
      {!compact ? (
        <span className="flex flex-col leading-tight">
          <span className="font-display text-sm font-semibold text-foreground">UrbanSense</span>
          <span className="text-[11px] text-muted-foreground">SDG 11 Assessment</span>
        </span>
      ) : null}
    </Link>
  );
}