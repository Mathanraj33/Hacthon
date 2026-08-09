import { useId, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | undefined;
  helperText?: string | undefined;
};

/** Labelled input with helper text and accessible error messaging. */
export function TextField({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn("h-11 rounded-xl bg-background", error && "border-destructive", className)}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-help`} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}