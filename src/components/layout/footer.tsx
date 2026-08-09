import { Link } from "@tanstack/react-router";
import { Brand } from "@/components/common/brand";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-4">
          <Brand />
          <p className="text-sm text-muted-foreground">
            An intelligent urban sustainability assessment system supporting UN SDG 11:
            sustainable cities and communities.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div className="space-y-3">
            <p className="font-semibold text-foreground">Platform</p>
            <Link to="/dashboard" className="block text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link to="/login" className="block text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Link to="/register" className="block text-muted-foreground hover:text-foreground">
              Create account
            </Link>
          </div>
          <div className="space-y-3">
            <p className="font-semibold text-foreground">Modules</p>
            <span className="block text-muted-foreground">Air &amp; Water</span>
            <span className="block text-muted-foreground">Waste &amp; Energy</span>
            <span className="block text-muted-foreground">Mobility</span>
          </div>
          <div className="space-y-3">
            <p className="font-semibold text-foreground">Resources</p>
            <span className="block text-muted-foreground">Methodology</span>
            <span className="block text-muted-foreground">Data sources</span>
            <span className="block text-muted-foreground">Support</span>
          </div>
        </nav>
      </div>
      <div className="border-t border-border px-5 py-5 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} UrbanSense. Built for sustainable cities.
      </div>
    </footer>
  );
}