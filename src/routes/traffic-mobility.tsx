import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "lucide-react";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { QueryState } from "@/components/common/query-state";
import { ModuleView } from "@/components/dashboard/module-view";
import { kpiIcons } from "@/config/kpi-icons";
import { PlaceholderPanel } from "@/components/dashboard/placeholder-panel";
import { getTrafficMobility } from "@/services/modules-service";

const title = "Traffic & Mobility | UrbanSense Sustainability Platform";
const description = "Congestion, public transport usage, travel time and road status.";

export const Route = createFileRoute("/traffic-mobility")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const query = useQuery({ queryKey: ["traffic-mobility"], queryFn: getTrafficMobility });

  return (
    <DashboardLayout title="Traffic & Mobility" subtitle="Primary corridors · peak hours">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        data={query.data}
        onRetry={() => query.refetch()}
        loadingLabel="Loading Traffic & Mobility data"
        isEmpty={(data) => data.kpis.length === 0}
      >
        {(data) => (
          <ModuleView
            payload={data}
            icons={kpiIcons.traffic}
            extra={(
          <PlaceholderPanel
            title="Traffic heatmap"
            description="Congestion intensity across the road network."
            note="Traffic heatmap placeholder. Connect a live traffic feed to render corridor-level congestion."
            icon={Activity}
          />
        )}
          />
        )}
      </QueryState>
    </DashboardLayout>
  );
}
