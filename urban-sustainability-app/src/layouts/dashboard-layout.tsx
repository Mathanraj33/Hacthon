import { useEffect, useState, type ReactNode } from "react";
import { Bell, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { Brand } from "@/components/common/brand";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { SidebarNav } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { WardSelector } from "@/components/dashboard/ward-selector";

type DashboardLayoutProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

const STORAGE_KEY = "iusas-sidebar-collapsed";

export function DashboardLayout({ title, subtitle, actions, children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Read the persisted preference after hydration to avoid SSR mismatches.
  useEffect(() => {
    setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <div className="min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-sidebar transition-[width] duration-200 lg:flex",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-border px-4",
            collapsed && "justify-center px-2",
          )}
        >
          <Brand compact={collapsed} />
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav collapsed={collapsed} />
        </div>
        <div className={cn("border-t border-border p-3", collapsed && "px-2")}>
          <Button
            variant="ghost"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className={cn("min-h-11 w-full rounded-xl", collapsed ? "justify-center px-0" : "justify-start")}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-5" aria-hidden="true" />
            ) : (
              <>
                <PanelLeftClose className="mr-2 size-5" aria-hidden="true" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile drawer — stays mounted so open/close can both animate;
          pointer-events are toggled off while closed so it doesn't block clicks. */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          aria-label="Close navigation"
          tabIndex={mobileOpen ? 0 : -1}
          className={cn(
            "absolute inset-0 bg-foreground/40 transition-opacity duration-200",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            "relative flex h-full w-72 max-w-[85%] flex-col bg-sidebar shadow-[var(--shadow-elevated)] transition-transform duration-200 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <Brand />
            <Button
              variant="ghost"
              size="icon"
              className="size-11 rounded-xl"
              aria-label="Close navigation"
              tabIndex={mobileOpen ? 0 : -1}
              onClick={() => setMobileOpen(false)}
            >
              <X className="size-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      </div>

      <div className={cn("transition-[padding] duration-200", collapsed ? "lg:pl-[76px]" : "lg:pl-64")}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            className="size-11 rounded-xl lg:hidden"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">{title}</h1>
            {subtitle ? (
              <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              City Official Mode
            </div>
            {actions ? actions : <WardSelector />}
            <Button
              variant="ghost"
              size="icon"
              className="size-11 rounded-xl"
              aria-label="Notifications"
            >
              <Bell className="size-5" />
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
