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
        <section id="overview" className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--color-primary)_18%,transparent),transparent_65%)]" />
          <div className="mx-auto w-full max-w-6xl px-5 py-16 text-center sm:py-24">
            <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/10 text-primary">
              UN Sustainable Development Goal 11
            </Badge>
            <h1 className="mx-auto mt-6 max-w-3xl text-3xl font-semibold leading-tight text-foreground sm:text-5xl">
              Intelligent Urban Sustainability Assessment System
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Unify environmental, mobility and resource data into a single score, then act on
              AI-ranked recommendations that make cities cleaner, safer and more liveable.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-xl">
                <Link to="/dashboard">
                  Explore the dashboard
                  <ArrowRight className="ml-1 size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-xl">
                <Link to="/register">Create an account</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="modules" className="mx-auto w-full max-w-6xl px-5 py-16 sm:py-20">
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

        <section id="impact" className="border-y border-border bg-card">
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
            <Button asChild size="lg" variant="secondary" className="mt-7 h-12 rounded-xl">
              <Link to="/register">Get started free</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
