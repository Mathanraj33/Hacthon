import {
  Activity,
  BatteryCharging,
  CloudFog,
  Container,
  Droplets,
  Factory,
  Flame,
  Gauge,
  Leaf,
  Recycle,
  Route,
  ShieldAlert,
  Sun,
  Thermometer,
  TreePine,
  TriangleAlert,
  Truck,
  Trash2,
  Waves,
  Wind,
  Zap,
  Bus,
  Timer,
  Trees,
  FlaskConical,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Per-module KPI id -> icon maps so every tile reads at a glance. */
export const kpiIcons = {
  airQuality: { aqi: Wind, pm25: CloudFog, pm10: Factory, co2: Flame },
  water: { consumption: Droplets, quality: FlaskConical, leakage: Waves, reservoir: Container },
  waste: { recycling: Recycle, collection: Truck, generation: Trash2, landfill: ShieldAlert },
  energy: { consumption: Zap, renewable: Sun, intensity: BatteryCharging, peak: Activity },
  traffic: { congestion: Gauge, transit: Bus, travel: Timer, incidents: TriangleAlert },
  greenCover: { "green-area": Leaf, canopy: TreePine, parks: Trees, heat: Thermometer },
  score: { overall: Gauge, trend: Route },
} satisfies Record<string, Record<string, LucideIcon>>;
