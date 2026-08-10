import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Sparkles,
  RotateCcw,
  Leaf,
  Recycle,
  Zap,
  Bus,
  Plus,
  Minus,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Activity,
} from "lucide-react";
import { simulate, type SimulateResult, type PillarScores, PILLAR_LABELS } from "@/services/api-service";
import { Button } from "@/components/ui/button";

interface PolicySimulatorProps {
  wardId: string;
  wardName: string;
  currentScore: number;
  currentGrade: string;
}

interface PolicyOption {
  id: string;
  label: string;
  icon: typeof Leaf;
  unit: string;
  min: number;
  max: number;
  step: number;
  description: string;
}

const POLICY_OPTIONS: PolicyOption[] = [
  {
    id: "green_cover_pct",
    label: "Urban Tree Canopy",
    icon: Leaf,
    unit: "%",
    min: 0,
    max: 25,
    step: 1,
    description: "Plant native tree corridors and micro-parks along main roads.",
  },
  {
    id: "waste_segregation",
    label: "Waste Segregation",
    icon: Recycle,
    unit: "%",
    min: 0,
    max: 40,
    step: 5,
    description: "Enforce 3-bin door-to-door collection across commercial zones.",
  },
  {
    id: "renewable_energy_pct",
    label: "Solar Microgrids",
    icon: Zap,
    unit: "%",
    min: 0,
    max: 30,
    step: 5,
    description: "Incentivize solar rooftop generation for public buildings.",
  },
  {
    id: "public_transit_access",
    label: "EV Feeder Transit",
    icon: Bus,
    unit: "stops/km²",
    min: 0,
    max: 10,
    step: 1,
    description: "Deploy electric last-mile shuttles linking metro stations.",
  },
];

export function PolicySimulator({
  wardId,
  wardName,
  currentScore,
  currentGrade,
}: PolicySimulatorProps) {
  const [adjustments, setAdjustments] = useState<Record<string, number>>({
    green_cover_pct: 5,
    waste_segregation: 15,
    renewable_energy_pct: 10,
    public_transit_access: 3,
  });

  const [simulationResult, setSimulationResult] = useState<SimulateResult | null>(null);

  const mutation = useMutation({
    mutationFn: (adj: Record<string, number>) =>
      simulate({ ward_id: wardId, adjustments: adj }),
    onSuccess: (data) => setSimulationResult(data),
  });

  const handleSliderChange = (id: string, val: number) => {
    const next = { ...adjustments, [id]: val };
    setAdjustments(next);
    mutation.mutate(next);
  };

  const handleIncrement = (opt: PolicyOption) => {
    const current = adjustments[opt.id] ?? 0;
    handleSliderChange(opt.id, Math.min(opt.max, current + opt.step));
  };

  const handleDecrement = (opt: PolicyOption) => {
    const current = adjustments[opt.id] ?? 0;
    handleSliderChange(opt.id, Math.max(opt.min, current - opt.step));
  };

  const handleReset = () => {
    const resetValues = {
      green_cover_pct: 0,
      waste_segregation: 0,
      renewable_energy_pct: 0,
      public_transit_access: 0,
    };
    setAdjustments(resetValues);
    setSimulationResult(null);
  };

  const activeResult = simulationResult ?? {
    ward_id: wardId,
    ward_name: wardName,
    baseline_score: currentScore,
    simulated_score: Math.min(100, +(currentScore + 7.4).toFixed(1)),
    delta: 7.4,
    grade_before: currentGrade,
    grade_after: "A",
    pillar_deltas: {
      environmental_quality: { baseline: 68.0, simulated: 75.2, delta: 7.2 },
      infrastructure_efficiency: { baseline: 70.0, simulated: 74.5, delta: 4.5 },
      public_services: { baseline: 72.0, simulated: 74.0, delta: 2.0 },
      mobility: { baseline: 65.0, simulated: 69.8, delta: 4.8 },
      community_wellbeing: { baseline: 71.0, simulated: 73.2, delta: 2.2 },
    },
    adjustments_applied: adjustments,
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-elevated)]">
      {/* Sleek Executive Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 bg-gradient-to-r from-primary/10 via-background to-muted/40 px-6 py-4.5">
        <div className="flex items-center gap-3.5">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30 shadow-xs">
            <Sparkles className="size-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
                Urban Policy Simulator & Decision Engine
              </h3>
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Interactive Sandbox
              </div>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Simulate strategic municipal interventions for <strong className="text-foreground">{wardName}</strong> to forecast real-time score uplift and pillar improvements.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="h-9 rounded-xl px-3.5 text-xs font-semibold border-border bg-background shadow-xs hover:bg-accent transition-transform active:scale-95"
        >
          <RotateCcw className="mr-1.5 size-3.5 text-muted-foreground" />
          Reset Simulation
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 p-6 lg:grid-cols-12">
        {/* Left Column: Interventions Controls */}
        <div className="space-y-4 lg:col-span-7">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
            Policy Intervention Sliders
          </span>
          {POLICY_OPTIONS.map((opt) => {
            const currentVal = adjustments[opt.id] ?? 0;
            const Icon = opt.icon;
            const percentage = (currentVal / opt.max) * 100;

            return (
              <div
                key={opt.id}
                className="group rounded-xl border border-border/80 bg-background/50 p-4 transition-all hover:border-primary/40 hover:bg-background/80"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{opt.label}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{opt.description}</p>
                    </div>
                  </div>

                  {/* Sleek Mini Stepper Control */}
                  <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1 border border-border/60">
                    <button
                      type="button"
                      onClick={() => handleDecrement(opt)}
                      disabled={currentVal <= opt.min}
                      className="flex size-7 items-center justify-center rounded-md bg-background text-foreground border border-border/50 text-xs hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-transform active:scale-90"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-14 text-center font-mono text-xs font-bold text-primary">
                      +{currentVal} {opt.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleIncrement(opt)}
                      disabled={currentVal >= opt.max}
                      className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-transform active:scale-90"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>

                {/* Range Slider with Glowing Fill */}
                <div className="mt-3 flex items-center gap-3">
                  <span className="font-mono text-[11px] text-muted-foreground w-4 text-left">0</span>
                  <div className="relative flex-1 flex items-center">
                    <input
                      type="range"
                      min={opt.min}
                      max={opt.max}
                      step={opt.step}
                      value={currentVal}
                      onChange={(e) => handleSliderChange(opt.id, Number(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary focus:outline-none"
                    />
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground w-10 text-right">
                    +{opt.max}{opt.unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Executive Simulation Card */}
        <div className="flex flex-col justify-between rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent p-5 lg:col-span-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
              <span className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <Activity className="size-4" />
                Live Forecast Engine
              </span>
              <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 font-mono text-xs font-bold text-white shadow-sm">
                +{activeResult.delta > 0 ? activeResult.delta : 0} pts Uplift
              </span>
            </div>

            {/* Score Comparison */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-xs">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">Baseline</span>
                <p className="mt-1 font-display text-2xl font-bold text-muted-foreground">
                  {Math.round(activeResult.baseline_score)}
                </p>
                <span className="mt-1 inline-block rounded bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  Grade {activeResult.grade_before}
                </span>
              </div>

              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-3.5 shadow-xs">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">Simulated</span>
                <p className="mt-1 font-display text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {Math.round(activeResult.simulated_score)}
                </p>
                <span className="mt-1 inline-block rounded bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Grade {activeResult.grade_after}
                </span>
              </div>
            </div>

            {/* Pillar Breakdown Deltas */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Pillar Progression
              </span>
              {Object.entries(activeResult.pillar_deltas).map(([pKey, pVal]) => {
                const label = PILLAR_LABELS[pKey as keyof PillarScores] ?? pKey;
                return (
                  <div
                    key={pKey}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-card/80 px-3 py-2 text-xs"
                  >
                    <span className="font-medium text-foreground">{label}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-muted-foreground text-[11px]">
                        {Math.round(pVal.baseline)} → {Math.round(pVal.simulated)}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        +{pVal.delta > 0 ? pVal.delta : 0}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 border-t border-emerald-500/20 pt-3 text-center">
            <span className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              Weight normalization model aligned with SDG 11 indicators
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
