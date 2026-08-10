import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, LayoutDashboard, Menu, X } from "lucide-react";
import { Brand } from "@/components/common/brand";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";

const links = [
  { label: "Overview", hash: "/#overview" },
  { label: "Pillars & Indicators", hash: "/#modules" },
  { label: "Impact", hash: "/#impact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Brand />

        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <a
              key={link.hash}
              href={link.hash}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/dashboard"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Live Dashboard
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            CPCB Live Feed
          </div>
          <ThemeToggle />
          <Button asChild className="rounded-xl font-medium shadow-sm transition-transform active:scale-95">
            <Link to="/dashboard">
              <LayoutDashboard className="mr-1.5 size-4" />
              Launch Dashboard
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="size-11 rounded-xl"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-background px-5 py-4 md:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {links.map((link) => (
              <a
                key={link.hash}
                href={link.hash}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Live Dashboard
            </Link>
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Button asChild className="h-11 rounded-xl font-medium">
              <Link to="/dashboard" onClick={() => setOpen(false)}>
                <LayoutDashboard className="mr-1.5 size-4" />
                Launch Dashboard
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}