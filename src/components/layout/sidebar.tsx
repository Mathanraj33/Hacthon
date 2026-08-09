import { Link } from "@tanstack/react-router";
import { moduleNavItems } from "@/config/navigation";
import { cn } from "@/lib/utils";

type SidebarNavProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
};

/**
 * Primary in-app navigation rendered inside DashboardLayout's desktop rail
 * and mobile drawer. Reconstructed component — see NOTES_FOR_YOU.md.
 */
export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  return (
    <nav aria-label="Modules" className={cn("flex flex-col gap-1 p-3", collapsed && "px-2")}>
      {moduleNavItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              collapsed && "justify-center px-0",
            )}
            activeProps={{
              className: "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary",
            }}
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            {!collapsed ? <span className="truncate">{item.label}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
