import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Brand } from "@/components/common/brand";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";

const links = [
  { label: "Overview", hash: "overview" },
  { label: "Modules", hash: "modules" },
  { label: "Impact", hash: "impact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Brand />

        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <a
              key={link.hash}
              href={`#${link.hash}`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Button asChild variant="ghost" className="rounded-xl">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild className="rounded-xl">
            <Link to="/register">Get started</Link>
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
                href={`#${link.hash}`}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2">
            <Button asChild variant="outline" className="h-11 rounded-xl">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild className="h-11 rounded-xl">
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}