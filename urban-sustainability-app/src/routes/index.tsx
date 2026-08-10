import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Droplets,
  Gauge,
  Leaf,
  Recycle,
  ShieldCheck,
  Sparkles,
  Wind,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const title = "UrbanSense | Intelligent Urban Sustainability Assessment";
const description =
  "Assess and improve city sustainability across air, water, waste, energy, mobility and green cover with SDG 11 aligned analytics.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: LandingPage,
});

const modules = [
  { icon: Wind, title: "Air Quality", copy: "Station-level AQI, PM2.5 and NO2 trends by district." },
  { icon: Droplets, title: "Water Management", copy: "Treatment coverage, loss rates and quality alerts." },
  { icon: Recycle, title: "Waste Management", copy: "Diversion rates, collection efficiency and landfill load." },
  { icon: Zap, title: "Energy Usage", copy: "Consumption, renewable share and grid intensity." },
  { icon: Gauge, title: "Traffic Analysis", copy: "Congestion, commute times and transit modal split." },
  { icon: Leaf, title: "Green Cover", copy: "Canopy mapping, park access and heat island risk." },
];

const impact = [
  { value: "6", label: "Sustainability domains" },
  { value: "24", label: "Monitoring stations" },
  { value: "76", label: "Current city score" },
  { value: "SDG 11", label: "Framework alignment" },
];

function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <section id="overview" className="scroll-mt-24 relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--color-primary)_18%,transparent),transparent_65%)]" />
          <div className="mx-auto w-full max-w-6xl px-5 py-16 text-center sm:py-24">
            <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/10 text-primary font-medium px-4 py-1">
              UN Sustainable Development Goal 11 · Glass-Box Scoring Engine
            </Badge>
            <h1 className="mx-auto mt-6 max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Intelligent Urban Sustainability Assessment System
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
              Continuous ward-level scoring powered by real-time air quality, mobility, and civic data.
              Decompose scores into weighted indicators, run policy simulations, and prioritize investments.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-xl px-6 text-base font-semibold shadow-md transition-transform active:scale-95">
                <Link to="/dashboard">
                  Explore Live Dashboard
                  <ArrowRight className="ml-2 size-5" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-xl px-6 text-base font-medium">
                <Link to="/dashboard">
                  <Sparkles className="mr-2 size-4 text-amber-500" />
                  Try Policy Simulator
                </Link>
              </Button>
            </div>

            {/* Live Score Preview Card */}
            <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-border/80 bg-card/90 p-6 text-left shadow-[var(--shadow-elevated)] backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Live Assessment Node · Staging
                    </span>
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-foreground">Chennai — Anna Nagar (Ward 01)</h3>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3.5 py-1.5 border border-emerald-500/20">
                  <span className="font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">68.4</span>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase">/ 100 · Grade B</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                <div className="rounded-xl bg-muted/50 p-2.5">
                  <span className="text-muted-foreground">Air Quality</span>
                  <p className="mt-0.5 font-semibold text-foreground">35 / 100 (Drag: -8.4)</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-2.5">
                  <span className="text-muted-foreground">Green Cover</span>
                  <p className="mt-0.5 font-semibold text-foreground">82 / 100 (Boost: +6.1)</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-2.5">
                  <span className="text-muted-foreground">Public Services</span>
                  <p className="mt-0.5 font-semibold text-foreground">74 / 100</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-2.5">
                  <span className="text-muted-foreground">Data Feed</span>
                  <p className="mt-0.5 font-semibold text-emerald-600 dark:text-emerald-400">CPCB Live</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="modules" className="scroll-mt-24 mx-auto w-full max-w-6xl px-5 py-16 sm:py-20">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
              Six assessment modules, one score
            </h2>
            <p className="mt-3 text-muted-foreground">
              Each module normalizes raw sensor and municipal data into comparable indicators.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <Card
                key={module.title}
                className="rounded-2xl border-border bg-card shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-elevated)]"
              >
                <CardHeader>
                  <span className="flex size-11 items-center justify-center rounded-xl bg-secondary/12 text-secondary">
                    <module.icon className="size-5" aria-hidden="true" />
                  </span>
                  <CardTitle className="mt-3 text-base">{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{module.copy}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="impact" className="scroll-mt-24 border-y border-border bg-card">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-5 py-14 lg:grid-cols-4">
            {impact.map((item) => (
              <div key={item.label} className="text-center">
                <p className="font-display text-3xl font-semibold text-primary sm:text-4xl">
                  {item.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:py-20">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: BarChart3, title: "Evidence based", copy: "Every score traces back to source readings and methodology." },
              { icon: Sparkles, title: "Actionable", copy: "Recommendations ranked by projected impact and effort." },
              { icon: ShieldCheck, title: "Audit ready", copy: "Exportable reports aligned with SDG 11 indicators." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-card p-6">
                <item.icon className="size-6 text-primary" aria-hidden="true" />
                <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.copy}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground shadow-[var(--shadow-glow)]">
            <h2 className="text-2xl font-semibold sm:text-3xl">Start assessing your city today</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm opacity-90">
              Set up your first assessment in minutes and track progress toward SDG 11 targets.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-7 h-12 rounded-xl font-semibold">
              <Link to="/dashboard">Launch Live Dashboard</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
