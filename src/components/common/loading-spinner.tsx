import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
};

const sizes = { sm: "size-4", md: "size-6", lg: "size-10" } as const;

export function LoadingSpinner({ className, size = "md", label }: LoadingSpinnerProps) {
  return (
    <div role="status" aria-live="polite" className={cn("flex items-center gap-3", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizes[size])} aria-hidden="true" />
      <span className={cn("text-sm text-muted-foreground", !label && "sr-only")}>
        {label ?? "Loading"}
      </span>
    </div>
  );
}