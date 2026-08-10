/**
 * WardSelector — Dropdown to switch between the 10 Chennai wards.
 * Placed in the dashboard header so every page shows the same selector.
 */
import { useQuery } from "@tanstack/react-query";
import { MapPin, ChevronDown } from "lucide-react";
import { fetchWards } from "@/services/api-service";
import { useWard } from "@/context/ward-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function WardSelector() {
  const { wardId, setWardId } = useWard();

  const { data, isLoading } = useQuery({
    queryKey: ["wards"],
    queryFn: fetchWards,
    staleTime: Infinity, // ward list never changes during a session
  });

  if (isLoading) {
    return (
      <div className="flex h-10 w-52 animate-pulse items-center gap-2 rounded-xl border border-border bg-muted px-3">
        <MapPin className="size-4 text-muted-foreground" />
        <span className="h-3 w-28 rounded bg-muted-foreground/30" />
      </div>
    );
  }

  return (
    <Select value={wardId} onValueChange={setWardId}>
      <SelectTrigger
        id="ward-selector"
        className="h-10 w-56 rounded-xl border-border bg-card shadow-sm"
        aria-label="Select ward"
      >
        <MapPin className="mr-1.5 size-4 shrink-0 text-primary" aria-hidden />
        <SelectValue placeholder="Select ward" />
        <ChevronDown className="ml-auto size-4 shrink-0 opacity-50" aria-hidden />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        {data?.wards.map((ward) => (
          <SelectItem key={ward.id} value={ward.id} className="rounded-lg">
            <span className="font-medium">{ward.name}</span>
            <span className="ml-2 text-xs text-muted-foreground">
              {ward.population.toLocaleString("en-IN")} pop.
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
