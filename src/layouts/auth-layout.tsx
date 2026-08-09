import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Brand } from "@/components/common/brand";
import { ThemeToggle } from "@/components/common/theme-toggle";

type AuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

const highlights = [
  { icon: TrendingUp, text: "Live SDG 11 indicators across every district" },
  { icon: Sparkles, text: "AI recommendations ranked by projected impact" },
  { icon: ShieldCheck, text: "Auditable, standards-aligned reporting" },
];

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--color-secondary)_45%,transparent),transparent_60%)]" />
        <div className="relative">
          <Link to="/" className="font-display text-lg font-semibold">
            UrbanSense
          </Link>
        </div>
        <div className="relative space-y-8">
          <h2 className="max-w-sm text-3xl font-semibold leading-tight">
            Measure what makes a city liveable.
          </h2>
          <ul className="space-y-4">
            {highlights.map((item) => (
              <li key={item.text} className="flex items-start gap-3 text-sm opacity-90">
                <item.icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs opacity-70">
          Aligned with UN Sustainable Development Goal 11.
        </p>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between px-5 py-4">
          <Brand />
          <ThemeToggle />
        </div>
        <main className="flex flex-1 items-center justify-center px-5 pb-12">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to home
            </Link>
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
              {children}
            </div>
            {footer ? (
              <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}