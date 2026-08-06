import {
  BarChart3,
  Droplets,
  Gauge,
  LayoutDashboard,
  Leaf,
  Recycle,
  Settings,
  Sparkles,
  Target,
  Wind,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  to:
    | "/dashboard"
    | "/air-quality"
    | "/water-management"
    | "/waste-management"
    | "/energy-usage"
    | "/traffic-mobility"
    | "/green-cover"
    | "/sustainability-score"
    | "/ai-recommendations"
    | "/reports"
    | "/settings";
  icon: LucideIcon;
  description: string;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, description: "Executive overview of every module." },
  { label: "Air Quality", to: "/air-quality", icon: Wind, description: "AQI, PM2.5, PM10 and CO2 monitoring." },
  { label: "Water Management", to: "/water-management", icon: Droplets, description: "Consumption, quality and leakage." },
  { label: "Waste Management", to: "/waste-management", icon: Recycle, description: "Recycling, collection and disposal." },
  { label: "Energy Usage", to: "/energy-usage", icon: Zap, description: "Consumption and renewable share." },
  { label: "Traffic & Mobility", to: "/traffic-mobility", icon: Gauge, description: "Congestion, transit and road status." },
  { label: "Green Cover", to: "/green-cover", icon: Leaf, description: "Canopy, parks and heat island risk." },
  { label: "Sustainability Score", to: "/sustainability-score", icon: Target, description: "SDG 11 score and benchmarks." },
  { label: "AI Recommendations", to: "/ai-recommendations", icon: Sparkles, description: "Prioritised improvement actions." },
  { label: "Reports", to: "/reports", icon: BarChart3, description: "Generate and export assessments." },
  { label: "Settings", to: "/settings", icon: Settings, description: "Profile, theme and notifications." },
];

export const moduleNavItems = navItems.filter((item) => item.to !== "/dashboard");
